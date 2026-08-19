import { fetchClubBySlug, fetchClubMembersBySlug } from "./actions"
import { BannerBackground } from "@/components/banner-background"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowRight,
  CrownIcon,
  EllipsisIcon,
  HandIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { safeSubstring } from "@/lib/utils"
import { fetchPlayerProfileByPuuid } from "../../player/[pid]/actions"
import { currentUser } from "@clerk/nextjs/server"
import { joinClub } from "./actions"

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

  const isAdmin = members.some(
    // NOT VALID
    (member) => member.role === "ADMIN" || member.role === "OWNER"
  )

  const canJoin = Boolean(player && !player.clubMemberships.length)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        {members.map((member) => (
          <BannerBackground
            key={member.playerCard ? member.playerCard.id : 0}
            bannerId={member.playerCard ? member.playerCard.bannerId : 0}
          >
            <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
              <div className="flex h-full flex-col justify-between gap-2 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-red-500">HELLO</div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon-sm">
                        <EllipsisIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Player</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <UserIcon />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <HandIcon />
                          Draft Player
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <ArrowLeft />
                          Move to Team 1
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowRight />
                          Move to Team 2
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Danger</DropdownMenuLabel>
                        <DropdownMenuItem variant="destructive">
                          <CrownIcon />
                          Make Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive">
                          <Trash2Icon />
                          Kick Player
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h2 className="font-oswald text-4xl font-semibold text-white uppercase">
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
