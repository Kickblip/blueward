"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq, ne } from "drizzle-orm"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import * as z from "zod"

import { db } from "@/lib/db"
import { clubMembers, clubs, players } from "@/lib/schema"

const memberTargetSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  targetPlayerId: z.coerce.number().int().positive(),
})

async function requireOwner(slug: unknown, targetPlayerId: unknown) {
  const input = memberTargetSchema.safeParse({ slug, targetPlayerId })

  if (!input.success) {
    throw new Error("Invalid member action.")
  }

  const { userId } = await auth()

  if (!userId) {
    redirect(`/signin?redirect_url=/clubs/${input.data.slug}/settings/members`)
  }

  const [owner] = await db
    .select({
      clubId: clubs.id,
      playerId: players.id,
    })
    .from(clubs)
    .innerJoin(clubMembers, eq(clubMembers.clubId, clubs.id))
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(
      and(
        eq(clubs.slug, input.data.slug),
        eq(players.authId, userId),
        eq(clubMembers.role, "OWNER")
      )
    )
    .limit(1)

  if (!owner) {
    throw new Error("Only the club owner can manage members.")
  }

  return {
    slug: input.data.slug,
    clubId: owner.clubId,
    ownerPlayerId: owner.playerId,
    targetPlayerId: input.data.targetPlayerId,
  }
}

export async function promoteToAdmin(slug: string, targetPlayerId: number) {
  const context = await requireOwner(slug, targetPlayerId)

  const [promoted] = await db
    .update(clubMembers)
    .set({ role: "ADMIN" })
    .where(
      and(
        eq(clubMembers.clubId, context.clubId),
        eq(clubMembers.playerId, context.targetPlayerId),
        eq(clubMembers.role, "MEMBER")
      )
    )
    .returning({ playerId: clubMembers.playerId })

  if (!promoted) {
    throw new Error("Only regular members can be promoted.")
  }

  updateTag(`club:${context.slug}`)
}

export async function makeOwner(slug: string, targetPlayerId: number) {
  const context = await requireOwner(slug, targetPlayerId)

  if (context.targetPlayerId === context.ownerPlayerId) {
    throw new Error("This player is already the owner.")
  }

  await db.transaction(async (tx) => {
    // demote first because the database permits only one owner per club.
    const [demoted] = await tx
      .update(clubMembers)
      .set({ role: "ADMIN" })
      .where(
        and(
          eq(clubMembers.clubId, context.clubId),
          eq(clubMembers.playerId, context.ownerPlayerId),
          eq(clubMembers.role, "OWNER")
        )
      )
      .returning({ playerId: clubMembers.playerId })

    if (!demoted) {
      throw new Error("Club ownership changed. Please try again.")
    }

    const [promoted] = await tx
      .update(clubMembers)
      .set({ role: "OWNER" })
      .where(
        and(
          eq(clubMembers.clubId, context.clubId),
          eq(clubMembers.playerId, context.targetPlayerId),
          ne(clubMembers.role, "OWNER")
        )
      )
      .returning({ playerId: clubMembers.playerId })

    if (!promoted) {
      throw new Error("Member not found.")
    }
  })

  updateTag(`club:${context.slug}`)
}

export async function removeMember(slug: string, targetPlayerId: number) {
  const context = await requireOwner(slug, targetPlayerId)

  const [removed] = await db
    .delete(clubMembers)
    .where(
      and(
        eq(clubMembers.clubId, context.clubId),
        eq(clubMembers.playerId, context.targetPlayerId),
        ne(clubMembers.role, "OWNER")
      )
    )
    .returning({ playerId: clubMembers.playerId })

  if (!removed) {
    throw new Error("Member not found or cannot be removed.")
  }

  updateTag(`club:${context.slug}`)
}
