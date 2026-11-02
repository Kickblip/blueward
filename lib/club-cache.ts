import { eq, inArray } from "drizzle-orm"
import { updateTag } from "next/cache"
import { db } from "@/lib/db"
import { clubMembers, clubs, players } from "@/lib/schema"

// Used to revalidate club related caches when necessary
export async function invalidatePlayerClubs(puuids: string[]) {
  if (!puuids.length) return

  const affectedClubs = await db
    .selectDistinct({ slug: clubs.slug })
    .from(clubMembers)
    .innerJoin(clubs, eq(clubs.id, clubMembers.clubId))
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(inArray(players.puuid, puuids))

  for (const { slug } of affectedClubs) {
    updateTag(`club:${slug}`)
  }
}
