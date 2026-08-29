"use server"

import { eq } from "drizzle-orm"
import { unstable_cache, updateTag } from "next/cache"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { db } from "@/lib/db"
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

  return Promise.all(
    members.map(async ({ player, ...membership }) => {
      const card = await fetchPlayerCardByPuuid(
        safeSubstring(player.puuid, 0, 20)
      )

      return {
        ...membership,
        playerCard: card
          ? {
              id: card.id,
              puuid: card.puuid,
              riotIdGameName: card.riotIdGameName,
              riotIdTagline: card.riotIdTagline,
              bannerId: card.bannerId,
              experience: card.experience,
            }
          : null,
      }
    })
  )
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
      columns: { id: true },
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

  const [joined] = await db
    .insert(clubMembers)
    .values({
      clubId: club.id,
      playerId: player.id,
      role: "MEMBER",
    })
    .onConflictDoNothing()
    .returning({ clubId: clubMembers.clubId })

  if (!joined) {
    throw new Error("You already belong to a club.")
  }

  updateTag(`club:${slug}`)
}
