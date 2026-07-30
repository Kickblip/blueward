import { fetchClubMembersBySlug } from "./actions"
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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const members = await fetchClubMembersBySlug(slug)

  if (!members) return null

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <BannerBackground
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
  )
}
