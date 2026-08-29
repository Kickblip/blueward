import { Card } from "@/components/ui/card"
import { ProfileMatch } from "@/components/profile-match"
import Image from "next/image"
import { BasicStatFormat } from "@/components/match-history-widgets"
import { fetchRecentMatchesByPuuid, fetchPlayerProfileByPuuid } from "./actions"
import { fetchAvatarUrlByAuthId } from "@/lib/avatar-url"
import { calcAverageKDA, calcWinrate, calcWinrateByChampion } from "./utils"
import { currentUser } from "@clerk/nextjs/server"
import { BannerSelector } from "@/components/banner-selector"
import { notFound } from "next/navigation"
import { DonutChart } from "@/components/donut-chart"
import { BannerBackground } from "@/components/banner-background"
import { LevelBadge } from "@/components/level-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { OPGGLogo } from "@/lib/icons"
import Link from "next/link"

export default async function PlayerProfile({
  params,
}: {
  params: Promise<{ pid: string }>
}) {
  const { pid } = await params

  const [matchesRes, profileRes, userRes] = await Promise.allSettled([
    fetchRecentMatchesByPuuid(pid),
    fetchPlayerProfileByPuuid(pid),
    currentUser(),
  ])

  const matches = matchesRes.status === "fulfilled" ? matchesRes.value : []
  const playerProfile =
    profileRes.status === "fulfilled" ? profileRes.value : null
  const user = userRes.status === "fulfilled" ? userRes.value : null

  const profilePictureUrl = await fetchAvatarUrlByAuthId(playerProfile?.authId)

  let userOwnsProfile = false
  if (user && playerProfile?.authId) {
    userOwnsProfile = playerProfile.authId === user.id
  }
  const avgKDA = calcAverageKDA(matches)
  const { wins, losses, total, winrate } = calcWinrate(matches)
  const winrateByChampion = calcWinrateByChampion(matches)

  if (!playerProfile) {
    notFound()
  }

  const club = playerProfile.clubMemberships[0]?.club

  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 md:grid-cols-3">
      <div className="col-span-2 flex flex-col gap-4">
        {matches.map((match, index) => (
          <ProfileMatch key={index} match={match} />
        ))}
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <Card className="p-0">
          <BannerBackground bannerId={playerProfile.bannerId ?? 0}>
            <div className="relative aspect-[2/1] w-full rounded-t-md">
              {userOwnsProfile && (
                <BannerSelector
                  puuid={pid}
                  playerBanners={playerProfile.banners ?? []}
                />
              )}

              <div className="absolute -bottom-8 left-4 h-32 w-32 overflow-hidden rounded-full border-4 border-secondary">
                <Image
                  src={profilePictureUrl || "/defaultpfp.webp"}
                  alt="Player avatar"
                  width={512}
                  height={512}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </BannerBackground>

          <div className="mb-2 flex flex-col gap-4 px-4 pt-10">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <LevelBadge experience={playerProfile.experience} />
                </TooltipTrigger>
                <TooltipContent>Blueward Player Level</TooltipContent>
              </Tooltip>

              {club && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/clubs/${club.slug}`}>
                      <div className="rounded-full border bg-secondary px-2 py-0.5 font-oswald text-sm font-semibold uppercase">
                        {club.name}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Club</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`https://op.gg/lol/summoners/na/${playerProfile.riotIdGameName}-${playerProfile.riotIdTagline}`}
                    target="_blank"
                  >
                    <div className="rounded-full bg-blue-600 px-2 py-1.5 hover:bg-blue-500">
                      <OPGGLogo size={13} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View on OP.GG</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-end gap-1">
              <p className="scale-y-150 font-oswald text-4xl font-semibold">
                {playerProfile.riotIdGameName}
              </p>
              <p className="text-sm text-muted-foreground">
                #{playerProfile.riotIdTagline}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DonutChart wins={wins} losses={losses} />

                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">
                    {(winrate * 100).toFixed(0)}% WR
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {total} Played
                  </div>
                </div>
              </div>

              <BasicStatFormat
                title={`${avgKDA.avgKills.toFixed(1)} / ${avgKDA.avgDeaths.toFixed(1)} / ${avgKDA.avgAssists.toFixed(1)}`}
                subtitle={`${((avgKDA.avgKills + avgKDA.avgAssists) / Math.max(1, avgKDA.avgDeaths)).toFixed(1)} KDA`}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2 bg-background/50 py-3 text-center text-xs font-semibold">
              <p>Champion</p>
              <p>Played</p>
              <p>W-L</p>
              <p>Winrate</p>
            </div>

            <div className="flex flex-col gap-1">
              {winrateByChampion.map((c, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center justify-items-center gap-2 text-center text-sm font-semibold"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${c.name}_0.jpg`}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <p>{c.played}</p>

                  <p>
                    {c.wins}-{c.losses}
                  </p>

                  <p>{(c.winrate * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
