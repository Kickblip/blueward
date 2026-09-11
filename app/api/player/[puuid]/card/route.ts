import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { NextRequest } from "next/server"

export function fetchPlayerCardByPuuid(puuid: string) {
  return unstable_cache(
    async () => {
      const player = await db.query.players.findFirst({
        where: eq(sql`left(${players.puuid}, 20)`, puuid),
        with: {
          clubMemberships: {
            columns: { clubId: true, role: true },
            with: {
              club: {
                columns: { id: true, name: true, slug: true },
              },
            },
          },
        },
      })

      return player ?? null
    },
    ["player-card", puuid],
    {
      tags: ["player-cards", `player-card:${puuid}`],
    }
  )()
}

export type PlayerCard = NonNullable<
  Awaited<ReturnType<typeof fetchPlayerCardByPuuid>>
>

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
