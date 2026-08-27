import { db } from "@/lib/db"
import { desc, eq, asc } from "drizzle-orm"
import { climbChallengePlayers, players } from "@/lib/schema"
import { unstable_cache, updateTag } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

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

  const [joined] = await db
    .insert(climbChallengePlayers)
    .values({
      playerId: player.id,
      puuid: player.puuid,
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
