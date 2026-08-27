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

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-auth-key")

  if (key !== process.env.CLIMB_CHALLENGE_SYNC_KEY) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = Date.now()

  if (now < challengeStart || now >= challengeEnd) {
    return new Response("Climb challenge is not live", { status: 409 })
  }

  const limit = pLimit(2)

  const participants = await db
    .select({
      puuid: climbChallengePlayers.puuid,
      startingWins: climbChallengePlayers.startingWins,
      startingLosses: climbChallengePlayers.startingLosses,
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

        if (!entries) {
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

        await db
          .update(climbChallengePlayers)
          .set({
            startingWins,
            startingLosses,
            wins,
            losses,
            netWins,
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
