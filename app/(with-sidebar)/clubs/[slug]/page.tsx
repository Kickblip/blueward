import { fetchClubBySlug, fetchClubMembersBySlug } from "./actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { joinClub } from "./actions"
import { LevelBadge } from "@/components/level-badge"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [{ slug }, user] = await Promise.all([params, currentUser()])

  const puuid = user?.privateMetadata.puuid

  const [members, club, player] = await Promise.all([
    fetchClubMembersBySlug(slug),
    fetchClubBySlug(slug),
    puuid ? fetchPlayerCardByPuuid(safeSubstring(puuid, 0, 20)) : null,
  ])

  if (!members || !club) return notFound()

  const canJoin = Boolean(player && !player.clubMemberships.length)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        {members.map((member) => (
          <div
            key={member.playerId}
            className="flex items-center gap-3 rounded-md border bg-secondary px-4 py-3"
          >
            <h2 className="min-w-0 truncate font-oswald text-xl font-semibold">
              {member.playerCard?.riotIdGameName ?? "Unknown"}
            </h2>

            {member.playerCard && (
              <LevelBadge
                experience={member.playerCard.experience}
                className="shrink-0"
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-oswald text-2xl font-semibold uppercase">
            {club.name}
          </h2>
        </div>

        {canJoin && (
          <form action={joinClub.bind(null, slug)}>
            <Button type="submit">Join club</Button>
          </form>
        )}
      </Card>
    </div>
  )
}
