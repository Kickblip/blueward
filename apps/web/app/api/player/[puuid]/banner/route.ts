import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { and, eq, sql } from "drizzle-orm"

export async function POST(req: Request, { params }: { params: Promise<{ puuid: string }> }) {
  const user = await currentUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bannerId } = await req.json()
  if (typeof bannerId !== "number") return NextResponse.json({ error: "Invalid bannerId" }, { status: 400 })

  const { puuid } = await params
  if (!puuid) return NextResponse.json({ error: "puuid required" }, { status: 400 })

  const updated = await db
    .update(players)
    .set({ bannerId })
    .where(and(eq(sql`left(${players.puuid}, 20)`, puuid), eq(players.authId, user.id)))
    .returning({ id: players.id, bannerId: players.bannerId })

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found or not allowed" }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
