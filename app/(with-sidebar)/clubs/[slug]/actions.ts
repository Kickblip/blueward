"use server"

import { and, eq, ne } from "drizzle-orm"
import { unstable_cache, updateTag } from "next/cache"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { db } from "@/lib/db"
import { calculateLevel } from "@/lib/level"
import { clubMembers, clubs, players } from "@/lib/schema"
import { safeSubstring } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

function fetchCachedMemberships(slug: string) {
  return unstable_cache(
    async () => {
      const club = await db.query.clubs.findFirst({
        where: eq(clubs.slug, slug),
        columns: {
          id: true,
        },
        with: {
          members: {
            with: {
              player: {
                columns: {
                  puuid: true,
                },
              },
            },
          },
        },
      })

      return club?.members ?? null
    },
    ["club-members-by-slug", slug],
    {
      tags: [`club:${slug}`],
    }
  )()
}

export async function fetchClubMembersBySlug(slug: string) {
  if (!slug) return null

  const members = await fetchCachedMemberships(slug)

  if (!members) return null

  const enrichedMembers = await Promise.all(
    members.map(async ({ player, ...membership }) => {
      const card = await fetchPlayerCardByPuuid(
        safeSubstring(player.puuid, 0, 20)
      )

      return {
        ...membership,
        playerCard: card
          ? {
              id: card.id,
              riotIdGameName: card.riotIdGameName,
              experience: card.experience,
            }
          : null,
      }
    })
  )

  return enrichedMembers.sort((a, b) => {
    const aLevel = a.playerCard ? calculateLevel(a.playerCard.experience) : -1
    const bLevel = b.playerCard ? calculateLevel(b.playerCard.experience) : -1

    return (
      bLevel - aLevel ||
      (b.playerCard?.experience ?? -1) - (a.playerCard?.experience ?? -1) ||
      (a.playerCard?.riotIdGameName ?? "").localeCompare(
        b.playerCard?.riotIdGameName ?? ""
      )
    )
  })
}

export async function fetchClubBySlug(slug: string) {
  if (!slug) return null

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  })

  return club ?? null
}

export async function joinClub(slug: string) {
  if (slug.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid club.")
  }

  const { userId } = await auth()

  if (!userId) {
    redirect(`/signin?redirect_url=/clubs/${slug}`)
  }

  const [player, club] = await Promise.all([
    db.query.players.findFirst({
      where: eq(players.authId, userId),
      columns: { id: true, puuid: true },
    }),
    db.query.clubs.findFirst({
      where: eq(clubs.slug, slug),
      columns: { id: true },
    }),
  ])

  if (!player) {
    throw new Error("Claim a player profile before joining a club.")
  }

  if (!club) {
    throw new Error("Club not found.")
  }

  await db
    .insert(clubMembers)
    .values({
      clubId: club.id,
      playerId: player.id,
      role: "MEMBER",
    })
    .onConflictDoNothing({ target: [clubMembers.clubId, clubMembers.playerId] })

  updateTag(`player-card:${safeSubstring(player.puuid, 0, 20)}`)
  updateTag(`club:${slug}`)
}

export async function leaveClub(slug: string) {
  if (slug.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid club.")
  }

  const { userId } = await auth()

  if (!userId) {
    redirect(`/signin?redirect_url=/clubs/${slug}`)
  }

  const [membership] = await db
    .select({
      clubId: clubMembers.clubId,
      playerId: players.id,
      puuid: players.puuid,
      role: clubMembers.role,
    })
    .from(clubMembers)
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .innerJoin(clubs, eq(clubs.id, clubMembers.clubId))
    .where(and(eq(clubs.slug, slug), eq(players.authId, userId)))
    .limit(1)

  if (!membership) return

  if (membership.role === "OWNER") {
    throw new Error("Transfer club ownership before leaving.")
  }

  const [left] = await db
    .delete(clubMembers)
    .where(
      and(
        eq(clubMembers.clubId, membership.clubId),
        eq(clubMembers.playerId, membership.playerId),
        ne(clubMembers.role, "OWNER")
      )
    )
    .returning({ playerId: clubMembers.playerId })

  if (!left) {
    throw new Error("Membership changed. Refresh and try again.")
  }

  updateTag(`player-card:${safeSubstring(membership.puuid, 0, 20)}`)
  updateTag(`club:${slug}`)
}
