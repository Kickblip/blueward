import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { playerPerformances, matches } from "@/lib/schema"
import { NextResponse } from "next/server"

export const matchParticipantsPerformancesQuery = (matchRowId: number) =>
  db
    .select({
      puuid: playerPerformances.puuid,
      riotIdGameName: playerPerformances.riotIdGameName,
      riotIdTagline: playerPerformances.riotIdTagline,

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

      doubleKills: playerPerformances.doubleKills,
      tripleKills: playerPerformances.tripleKills,
      quadraKills: playerPerformances.quadraKills,
      pentaKills: playerPerformances.pentaKills,

      wardsPlaced: playerPerformances.wardsPlaced,
      controlWardsPlaced: playerPerformances.controlWardsPlaced,
      wardTakedowns: playerPerformances.wardTakedowns,
      visionScore: playerPerformances.visionScore,

      spell1Casts: playerPerformances.spell1Casts,
      spell2Casts: playerPerformances.spell2Casts,
      spell3Casts: playerPerformances.spell3Casts,
      spell4Casts: playerPerformances.spell4Casts,
      summoner1Casts: playerPerformances.summoner1Casts,
      summoner2Casts: playerPerformances.summoner2Casts,

      assistMePings: playerPerformances.assistMePings,
      enemyMissingPings: playerPerformances.enemyMissingPings,
      enemyVisionPings: playerPerformances.enemyVisionPings,
      needVisionPings: playerPerformances.needVisionPings,
      onMyWayPings: playerPerformances.onMyWayPings,
      pushPings: playerPerformances.pushPings,
    })
    .from(playerPerformances)
    .where(eq(playerPerformances.matchRowId, matchRowId))

export type MatchParticipantPerformanceRow = Awaited<ReturnType<typeof matchParticipantsPerformancesQuery>>[number]

export async function GET(_req: Request, { params }: { params: Promise<{ matchRowId: string }> }) {
  const { matchRowId } = await params

  if (!matchRowId) {
    return NextResponse.json({ error: "matchRowId required" }, { status: 400 })
  }

  const id = Number(matchRowId)

  const rows = await matchParticipantsPerformancesQuery(id)
  return NextResponse.json(rows)
}
