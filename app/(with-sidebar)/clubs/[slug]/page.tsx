import { fetchClubBySlug, fetchClubMembersBySlug } from "./actions"
import { BannerBackground } from "@/components/banner-background"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { safeSubstring } from "@/lib/utils"
import { fetchPlayerProfileByPuuid } from "../../player/[pid]/actions"
import { currentUser } from "@clerk/nextjs/server"
import { joinClub } from "./actions"
import { LevelBadge } from "@/components/level-badge"

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
    puuid ? fetchPlayerProfileByPuuid(safeSubstring(puuid, 0, 20)) : null,
  ])

  if (!members || !club) return notFound()

  const canJoin = Boolean(player && !player.clubMemberships.length)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        {members.map((member) => (
          <BannerBackground
            key={member.playerCard ? member.playerCard.id : 0}
            bannerId={member.playerCard ? member.playerCard.bannerId : 0}
          >
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md p-2">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"
              />

              <div className="relative z-10 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-4">
                  <LevelBadge experience={member.playerCard?.experience ?? 0} />
                </div>

                <h2 className="font-oswald text-4xl font-semibold uppercase">
                  {member.playerCard
                    ? member.playerCard.riotIdGameName
                    : "Unknown"}
                </h2>
              </div>
            </div>
          </BannerBackground>
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
