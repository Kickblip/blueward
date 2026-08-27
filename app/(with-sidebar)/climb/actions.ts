import { db } from "@/lib/db"
import { desc, eq, asc } from "drizzle-orm"
import { climbChallengePlayers, players } from "@/lib/schema"
import { unstable_cache, updateTag } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { fetchWithRetry } from "../import/actions"

export const getClimbLeaderboard = unstable_cache(
  async () => {
    const rows = await db
      .select({
        playerId: climbChallengePlayers.playerId,
        puuid: climbChallengePlayers.puuid,
        riotIdGameName: players.riotIdGameName,
        riotIdTagline: players.riotIdTagline,
        bannerId: players.bannerId,
        netWins: climbChallengePlayers.netWins,
        wins: climbChallengePlayers.wins,
        losses: climbChallengePlayers.losses,
      })
      .from(climbChallengePlayers)
      .innerJoin(players, eq(climbChallengePlayers.playerId, players.id))
      .orderBy(desc(climbChallengePlayers.netWins), asc(players.riotIdGameName))

    return rows.map((player, index) => ({
      rank: index + 1,
      ...player,
    }))
  },
  ["climb-challenge-leaderboard"],
  {
    tags: ["climb-challenge-leaderboard"],
  }
)

export const joinClimbChallenge = async () => {
  "use server"

  const { userId } = await auth()

  if (!userId) {
    redirect("/signin?redirect_url=/climb")
  }

  const player = await db.query.players.findFirst({
    where: eq(players.authId, userId),
    columns: {
      id: true,
      puuid: true,
    },
  })

  if (!player) {
    throw new Error("Connect your Riot account before joining the challenge")
  }

  const response = await fetchWithRetry(
    `https://na1.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(player.puuid)}`,
    {
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY!,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error("Unable to capture your starting record. Please try again.")
  }

  const entries = await response.json()

  if (!Array.isArray(entries)) {
    throw new Error("Riot returned an invalid ranked record.")
  }

  const solo = entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5")

  const [joined] = await db
    .insert(climbChallengePlayers)
    .values({
      playerId: player.id,
      puuid: player.puuid,
      startingWins: solo?.wins ?? 0,
      startingLosses: solo?.losses ?? 0,
    })
    .onConflictDoNothing({
      target: climbChallengePlayers.puuid,
    })
    .returning({
      puuid: climbChallengePlayers.puuid,
    })

  if (joined) {
    updateTag("climb-challenge-leaderboard")
  }
}
