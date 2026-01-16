import { NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"

export async function POST() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.privateMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  revalidateTag("recent-games", "max")
  revalidateTag("top-players-by-mmr", "max")
  revalidatePath("/leaderboard/[stat]", "page")
  revalidatePath("/", "page")

  return NextResponse.json({ ok: true })
}
