import { fetchClubBySlug, fetchClubMembersBySlug } from "./actions"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { joinClub, leaveClub } from "./actions"
import { LevelBadge } from "@/components/level-badge"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { ClubInfoCard } from "@/components/club-info-card"
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

  const membership = player?.clubMemberships.find(
    ({ clubId }) => clubId === club.id
  )
  const canJoin = !user || Boolean(player && !membership)
  const isOwner = membership?.role === "OWNER"

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

      <div className="col-span-1 flex flex-col gap-2">
        <ClubInfoCard club={club} />

        {canJoin && (
          <form action={joinClub.bind(null, slug)}>
            <Button
              type="submit"
              size="lg"
              className="w-full font-oswald font-semibold uppercase"
            >
              Join club
            </Button>
          </form>
        )}

        {membership && (
          <Tooltip>
            <TooltipTrigger asChild>
              <form
                action={leaveClub.bind(null, slug)}
                className="flex flex-col gap-2"
                tabIndex={isOwner ? 0 : undefined}
              >
                <Button
                  type="submit"
                  size="lg"
                  variant="destructive"
                  disabled={isOwner}
                  className="w-full font-oswald font-semibold uppercase"
                >
                  Leave club
                </Button>
              </form>
            </TooltipTrigger>
            {isOwner && (
              <TooltipContent className="text-center">
                You must transfer ownership before leaving this club
              </TooltipContent>
            )}
          </Tooltip>
        )}
      </div>
    </div>
  )
}
