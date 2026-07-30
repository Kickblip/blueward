"use server"

import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { revalidatePath, unstable_cache } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { clubMembers, clubs, players } from "@/lib/schema"

export async function createClub(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/signin")
  }

  const value = formData.get("name")
  const name = typeof value === "string" ? value.trim() : ""

  if (name.length < 2 || name.length > 64) {
    throw new Error("Club name must be between 2 and 64 characters.")
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (!slug) {
    throw new Error("Club name must contain letters or numbers.")
  }

  const player = await db.query.players.findFirst({
    where: eq(players.authId, userId),
    columns: { id: true },
  })

  if (!player) {
    throw new Error("Claim a player profile before creating a club.")
  }

  await db.transaction(async (tx) => {
    const [club] = await tx
      .insert(clubs)
      .values({ name, slug })
      .returning({ id: clubs.id })

    await tx.insert(clubMembers).values({
      clubId: club.id,
      playerId: player.id,
      role: "OWNER",
    })
  })

  revalidatePath("/clubs")
  redirect(`/clubs/${slug}`)
}

export const fetchClubs = unstable_cache(
  async () => db.query.clubs.findMany(),
  ["clubs"],
  { tags: ["clubs"] }
)
