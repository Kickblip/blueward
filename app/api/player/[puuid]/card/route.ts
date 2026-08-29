import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { eq, InferSelectModel, sql } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { NextRequest } from "next/server"

export type PlayerCard = InferSelectModel<typeof players>

export function fetchPlayerCardByPuuid(puuid: string) {
  return unstable_cache(
    async (): Promise<PlayerCard | null> => {
      const [player] = await db
        .select()
        .from(players)
        .where(eq(sql`left(${players.puuid}, 20)`, puuid))
        .limit(1)

      return player ?? null
    },
    ["player-card", puuid],
    {
      tags: ["player-cards", `player-card:${puuid}`],
    }
  )()
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ puuid: string }> }
) {
  const user = await currentUser()

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { puuid } = await params

  if (!puuid)
    return NextResponse.json({ error: "puuid required" }, { status: 400 })

  const playerCard = await fetchPlayerCardByPuuid(puuid)

  if (!playerCard)
    return NextResponse.json({ error: "Player not found" }, { status: 404 })

  return NextResponse.json(playerCard)
}
