import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { players, playerPerformances, matches } from "@/lib/schema"
import { clerkClient } from "@clerk/nextjs/server"
import type { InferSelectModel } from "drizzle-orm"
type PlayerRow = InferSelectModel<typeof players>

export async function fetchPlayerProfileByPuuid(puuid: string): Promise<PlayerRow | null> {
  "use server"

  const result = await db.select().from(players).where(eq(players.puuid, puuid)).limit(1)

  return result[0] ?? null
}

export async function fetchProfilePictureByAuthId(authId: string | null | undefined): Promise<string | null> {
  "use server"

  if (!authId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(authId)
    return user.imageUrl ?? null
  } catch {
    return null
  }
}

const recentMatchesQuery = (puuid: string) =>
  db
    .select({
      matchRowId: playerPerformances.matchRowId,
      mmr: playerPerformances.mmr,
      champLevel: playerPerformances.champLevel,
      championName: playerPerformances.championName,
      role: playerPerformances.role,
      kills: playerPerformances.kills,
      deaths: playerPerformances.deaths,
      assists: playerPerformances.assists,
      goldEarned: playerPerformances.goldEarned,
      item0: playerPerformances.item0,
      item1: playerPerformances.item1,
      item2: playerPerformances.item2,
      item3: playerPerformances.item3,
      item4: playerPerformances.item4,
      item5: playerPerformances.item5,
      item6: playerPerformances.item6,
      roleBoundItem: playerPerformances.roleBoundItem,
      summoner1Id: playerPerformances.summoner1Id,
      summoner2Id: playerPerformances.summoner2Id,
      magicDamageDealtToChampions: playerPerformances.magicDamageDealtToChampions,
      physicalDamageDealtToChampions: playerPerformances.physicalDamageDealtToChampions,
      neutralMinionsKilled: playerPerformances.neutralMinionsKilled,
      trueDamageDealtToChampions: playerPerformances.trueDamageDealtToChampions,
      totalMinionsKilled: playerPerformances.totalMinionsKilled,
      win: playerPerformances.win,
      perkPrimaryStyleId: playerPerformances.perkPrimaryStyleId,
      perkSecondaryStyleId: playerPerformances.perkSecondaryStyleId,

      gameEndTimestamp: matches.gameEndTimestamp,
      gameDuration: matches.gameDuration,
      tag: matches.tag,
    })
    .from(playerPerformances)
    .innerJoin(matches, eq(matches.id, playerPerformances.matchRowId))
    .where(eq(playerPerformances.puuid, puuid))
    .orderBy(desc(matches.gameEndTimestamp), desc(playerPerformances.id))

export type RecentMatchRow = Awaited<ReturnType<typeof recentMatchesQuery>>[number]

export async function fetchRecentMatchesByPuuid(puuid: string): Promise<RecentMatchRow[]> {
  return recentMatchesQuery(puuid)
}
