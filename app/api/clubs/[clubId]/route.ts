import { auth } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath, revalidateTag } from "next/cache"
import * as z from "zod"

import { db } from "@/lib/db"
import { clubMembers, clubs, players } from "@/lib/schema"

const clubIdSchema = z.coerce.number().int().positive()

const clubSettingsSchema = z.object({
  name: z.string().trim().min(2).max(64),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  bio: z
    .string()
    .trim()
    .max(512)
    .transform((value) => value || null),
})

export async function PATCH(
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

  const settings = clubSettingsSchema.safeParse(
    await request.json().catch(() => null)
  )

  if (!settings.success) {
    return Response.json({ error: "Invalid club settings" }, { status: 400 })
  }

  const [access] = await db
    .select({ previousSlug: clubs.slug })
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
    const [club] = await db
      .update(clubs)
      .set(settings.data)
      .where(eq(clubs.id, clubId.data))
      .returning({
        id: clubs.id,
        name: clubs.name,
        slug: clubs.slug,
        bio: clubs.bio,
      })

    revalidateTag(`club:${access.previousSlug}`, "max")
    revalidateTag(`club:${club.slug}`, "max")
    revalidatePath("/clubs")

    return Response.json({ club })
  } catch (error) {
    if ((error as { cause?: { code?: string } }).cause?.code === "23505") {
      return Response.json(
        { error: "That slug is already in use" },
        { status: 409 }
      )
    }

    console.error("Failed to update club:", error)
    return Response.json({ error: "Failed to update club" }, { status: 500 })
  }
}
