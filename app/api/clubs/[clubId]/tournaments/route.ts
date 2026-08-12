import { auth } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import * as z from "zod"

import { db } from "@/lib/db"
import { clubMembers, clubs, players, tournaments } from "@/lib/schema"

const clubIdSchema = z.coerce.number().int().positive()

const tournamentSchema = z.object({
  name: z.string().trim().min(2).max(128),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clubId = clubIdSchema.safeParse((await params).clubId)

  if (!clubId.success) {
    return Response.json({ error: "Invalid club ID" }, { status: 400 })
  }

  const input = tournamentSchema.safeParse(
    await request.json().catch(() => null)
  )

  if (!input.success) {
    return Response.json(
      { error: "Invalid tournament details" },
      { status: 400 }
    )
  }

  const [access] = await db
    .select({ clubSlug: clubs.slug })
    .from(clubMembers)
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .innerJoin(clubs, eq(clubs.id, clubMembers.clubId))
    .where(
      and(
        eq(clubMembers.clubId, clubId.data),
        eq(players.authId, userId),
        inArray(clubMembers.role, ["OWNER", "ADMIN"])
      )
    )
    .limit(1)

  if (!access) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const [tournament] = await db
      .insert(tournaments)
      .values({
        clubId: clubId.data,
        name: input.data.name,
        slug: input.data.slug,
      })
      .returning({
        id: tournaments.id,
        name: tournaments.name,
        slug: tournaments.slug,
        status: tournaments.status,
      })

    revalidatePath(`/clubs/${access.clubSlug}/settings/tournaments`)

    return Response.json({ tournament }, { status: 201 })
  } catch (error) {
    if ((error as { cause?: { code?: string } }).cause?.code === "23505") {
      return Response.json(
        { error: "That tournament slug is already in use" },
        { status: 409 }
      )
    }

    console.error("Failed to create tournament:", error)

    return Response.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    )
  }
}
