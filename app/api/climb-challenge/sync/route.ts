export const maxDuration = 300

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { climbChallengePlayers } from "@/lib/schema"
import { fetchWithRetry } from "@/app/(with-sidebar)/import/actions"
import { eq } from "drizzle-orm"
import pLimit from "p-limit"
import { revalidateTag } from "next/cache"
import {
  CLIMB_CHALLENGE_END_DATE,
  CLIMB_CHALLENGE_START_DATE,
} from "@/lib/config"

const challengeStart = Date.parse(CLIMB_CHALLENGE_START_DATE)
const challengeEnd = Date.parse(CLIMB_CHALLENGE_END_DATE)

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization")

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = Date.now()

  if (now < challengeStart || now >= challengeEnd) {
    return new Response("Climb challenge is not live", { status: 409 })
  }

  const limit = pLimit(5)

  const participants = await db
    .select({
      puuid: climbChallengePlayers.puuid,
      startingWins: climbChallengePlayers.startingWins,
      startingLosses: climbChallengePlayers.startingLosses,
      wins: climbChallengePlayers.wins,
      losses: climbChallengePlayers.losses,
      hotStreak: climbChallengePlayers.hotStreak,
      points: climbChallengePlayers.points,
      inactive: climbChallengePlayers.inactive,
    })
    .from(climbChallengePlayers)

  const results = await Promise.all(
    participants.map((participant) =>
      limit(async () => {
        const response = await fetchWithRetry(
          `https://na1.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(participant.puuid)}`,
          {
            headers: {
              "X-Riot-Token": process.env.RIOT_API_KEY!,
            },
            cache: "no-store",
          }
        )

        if (!response.ok) {
          return { puuid: participant.puuid, updated: false }
        }

        const entries = await response.json().catch(() => null)

        if (!Array.isArray(entries)) {
          return { puuid: participant.puuid, updated: false }
        }

        const solo = entries.find(
          (entry: any) => entry.queueType === "RANKED_SOLO_5x5"
        )

        if (!solo) {
          return { puuid: participant.puuid, updated: false }
        }

        const startingWins = participant.startingWins ?? solo.wins
        const startingLosses = participant.startingLosses ?? solo.losses

        const wins = solo.wins - startingWins
        const losses = solo.losses - startingLosses
        const netWins = wins - losses

        const newWins = wins - participant.wins
        const newLosses = losses - participant.losses
        const hotStreak = solo.hotStreak === true
        const inactive = solo.inactive === true
        const winValue = Math.ceil(
          25 * (hotStreak ? 1.4 : 1) * (inactive ? 0.8 : 1)
        )
        const points = participant.points + newWins * winValue - newLosses * 25

        await db
          .update(climbChallengePlayers)
          .set({
            startingWins,
            startingLosses,
            wins,
            losses,
            netWins,
            hotStreak,
            inactive,
            points,
          })
          .where(eq(climbChallengePlayers.puuid, participant.puuid))

        return { puuid: participant.puuid, updated: true }
      })
    )
  )

  const updated = results.filter((result) => result.updated).length
  const skipped = results
    .filter((result) => !result.updated)
    .map((result) => result.puuid)

  if (updated > 0) {
    revalidateTag("climb-challenge-leaderboard", { expire: 0 })
  }

  return Response.json({ updated, skipped })
}
