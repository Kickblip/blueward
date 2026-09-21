import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { and, eq, sql } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { MAX_NOTE_LENGTH } from "@/lib/config"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ puuid: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to save a note." },
      { status: 401 }
    )
  }

  const body = await req.json().catch(() => null)
  const note = body?.note

  if (typeof note !== "string" || note.length > MAX_NOTE_LENGTH) {
    return NextResponse.json({ error: "Note is too long" }, { status: 400 })
  }

  const { puuid } = await params

  const [player] = await db
    .update(players)
    .set({ note: note.trim() || null })
    .where(
      and(
        eq(sql`left(${players.puuid}, 20)`, puuid),
        eq(players.authId, userId)
      )
    )
    .returning({ note: players.note })

  if (!player) {
    return NextResponse.json(
      { error: "Profile not found or not owned by you." },
      { status: 404 }
    )
  }

  revalidateTag(`player-card:${puuid}`, { expire: 0 })

  return NextResponse.json(player)
}
