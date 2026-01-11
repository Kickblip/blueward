import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { sql, desc, asc } from "drizzle-orm"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const qRaw = (searchParams.get("q") ?? "").trim()
  if (!qRaw) return NextResponse.json([])

  if (qRaw.length < 3) {
    return NextResponse.json([])
  }

  const q = qRaw.slice(0, 32)
  const limit = 10

  const scoreExpr = sql<number>`similarity(${players.riotIdGameName}, ${q})`

  const rows = await db
    .select({
      riotIdGameName: players.riotIdGameName,
      puuid: players.puuid,
      score: scoreExpr,
    })
    .from(players)
    .where(sql`${players.riotIdGameName} % ${q}`)
    .orderBy(desc(scoreExpr), asc(players.riotIdGameName))
    .limit(limit)

  return NextResponse.json(rows.map(({ riotIdGameName, puuid }) => ({ riotIdGameName, puuid })))
}
