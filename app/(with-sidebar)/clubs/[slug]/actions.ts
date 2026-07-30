"use server"

import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"

import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { db } from "@/lib/db"
import { clubs } from "@/lib/schema"
import { safeSubstring } from "@/lib/utils"

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
              avatarUrl: card.avatarUrl,
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
