"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq, ne, inArray } from "drizzle-orm"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import * as z from "zod"
import { safeSubstring } from "@/lib/utils"
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

async function invalidatePlayerCards(playerIds: number[]) {
  const affectedPlayers = await db
    .select({ puuid: players.puuid })
    .from(players)
    .where(inArray(players.id, playerIds))

  for (const player of affectedPlayers) {
    updateTag(`player-card:${safeSubstring(player.puuid, 0, 20)}`)
  }
}

async function requireRole(
  slug: unknown,
  targetPlayerId: unknown,
  roles: ("OWNER" | "ADMIN")[]
) {
  const input = memberTargetSchema.safeParse({ slug, targetPlayerId })

  if (!input.success) {
    throw new Error("Invalid member action.")
  }

  const { userId } = await auth()

  if (!userId) {
    redirect(`/signin?redirect_url=/clubs/${input.data.slug}/settings/members`)
  }

  const [actor] = await db
    .select({
      clubId: clubs.id,
      playerId: players.id,
      role: clubMembers.role,
    })
    .from(clubs)
    .innerJoin(clubMembers, eq(clubMembers.clubId, clubs.id))
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(
      and(
        eq(clubs.slug, input.data.slug),
        eq(players.authId, userId),
        inArray(clubMembers.role, roles)
      )
    )
    .limit(1)

  if (!actor) {
    throw new Error("You do not have permission to manage this member.")
  }

  return {
    slug: input.data.slug,
    clubId: actor.clubId,
    actorPlayerId: actor.playerId,
    actorRole: actor.role,
    targetPlayerId: input.data.targetPlayerId,
  }
}

export async function promoteToAdmin(slug: string, targetPlayerId: number) {
  const context = await requireRole(slug, targetPlayerId, ["OWNER"])

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

  await invalidatePlayerCards([context.targetPlayerId])
  updateTag(`club:${context.slug}`)
}

export async function demoteToMember(slug: string, targetPlayerId: number) {
  const context = await requireRole(slug, targetPlayerId, ["OWNER"])

  if (context.targetPlayerId === context.actorPlayerId) {
    throw new Error("You cannot demote yourself.")
  }

  const [demoted] = await db
    .update(clubMembers)
    .set({ role: "MEMBER" })
    .where(
      and(
        eq(clubMembers.clubId, context.clubId),
        eq(clubMembers.playerId, context.targetPlayerId),
        eq(clubMembers.role, "ADMIN")
      )
    )
    .returning({ playerId: clubMembers.playerId })

  if (!demoted) {
    throw new Error("Only admins can be demoted.")
  }

  await invalidatePlayerCards([context.targetPlayerId])
  updateTag(`club:${context.slug}`)
}

export async function makeOwner(slug: string, targetPlayerId: number) {
  const context = await requireRole(slug, targetPlayerId, ["OWNER"])

  if (context.targetPlayerId === context.actorPlayerId) {
    throw new Error("This player is already the owner.")
  }

  await db.transaction(async (tx) => {
    // demote first because the database permits only one owner per club
    const [demoted] = await tx
      .update(clubMembers)
      .set({ role: "ADMIN" })
      .where(
        and(
          eq(clubMembers.clubId, context.clubId),
          eq(clubMembers.playerId, context.actorPlayerId),
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

  await invalidatePlayerCards([context.actorPlayerId, context.targetPlayerId])

  updateTag(`club:${context.slug}`)
}

export async function removeMember(slug: string, targetPlayerId: number) {
  const context = await requireRole(slug, targetPlayerId, ["OWNER", "ADMIN"])

  const [removed] = await db
    .delete(clubMembers)
    .where(
      and(
        eq(clubMembers.clubId, context.clubId),
        eq(clubMembers.playerId, context.targetPlayerId),
        context.actorRole === "OWNER"
          ? ne(clubMembers.role, "OWNER")
          : eq(clubMembers.role, "MEMBER")
      )
    )
    .returning({ playerId: clubMembers.playerId })

  if (!removed) {
    throw new Error("Member not found or cannot be removed.")
  }

  await invalidatePlayerCards([context.targetPlayerId])
  updateTag(`club:${context.slug}`)
}
