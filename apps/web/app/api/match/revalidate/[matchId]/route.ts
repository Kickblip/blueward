import { NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { matches } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function POST(_req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params

  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.privateMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  revalidateTag("recent-games", "max")
  revalidateTag("top-players-by-mmr", "max")
  revalidatePath("/leaderboard/[stat]", "page")
  revalidatePath("/", "page")

  const rows = await db.select({ players: matches.players }).from(matches).where(eq(matches.matchId, matchId)).limit(1)

  const players = rows[0]?.players ?? []

  for (const puuid of players) {
    revalidateTag(`recent-matches:${puuid}`, "max")
  }

  return NextResponse.json({ ok: true })
}
