import Card from "@repo/ui/Card"
import ProfileMatch from "@/components/ProfileMatch"
import Image from "next/image"
import DonutChart from "@repo/ui/DonutChart"
import { BasicStatFormat } from "@repo/ui/MatchHistoryWidgets"
import { fetchRecentMatchesByPuuid, fetchPlayerProfileByPuuid, fetchProfilePictureByAuthId } from "./actions"
import { calcAverageKDA, calcWinrate, calcWinrateByChampion } from "./helpers"
import { BsPersonFillAdd } from "react-icons/bs"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import BannerSelector from "@/components/BannerSelector"

export default async function PlayerProfile({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params
  const matches = await fetchRecentMatchesByPuuid(pid)
  const playerProfile = await fetchPlayerProfileByPuuid(pid)
  const profilePictureUrl = await fetchProfilePictureByAuthId(playerProfile?.authId)

  const avgKDA = calcAverageKDA(matches)
  const winrate = calcWinrate(matches)
  const winrateByChampion = calcWinrateByChampion(matches)

  const user = await currentUser()
  let userOwnsProfile = false
  if (user && playerProfile?.authId) {
    userOwnsProfile = playerProfile.authId === user.id
  }

  return (
    <div className="grid grid-cols-3 gap-4 min-h-screen">
      <div className="col-span-1 flex flex-col gap-4">
        <Card className="p-0">
          <div className="relative">
            <Image
              src={`/banners/${playerProfile?.bannerId ?? 0}.webp`}
              alt="player background"
              width={1000}
              height={1000}
              className="aspect-[2/1] w-full rounded-t-md object-cover object-center"
            />

            {userOwnsProfile && <BannerSelector puuid={pid} playerBanners={playerProfile?.banners ?? []} />}

            <div className="absolute -bottom-8 left-4 h-32 w-32 rounded-full border-4 border-zinc-900 overflow-hidden">
              <Image
                src={profilePictureUrl || "/defaultpfp.webp"}
                alt="Player avatar"
                width={512}
                height={512}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex gap-1 px-4 pt-10 mb-2 items-end">
            <p className="font-oswald scale-y-150 font-semibold text-4xl">{playerProfile?.riotIdGameName}</p>
            <p className="text-sm text-zinc-400">#{playerProfile?.riotIdTagline}</p>
          </div>

          <div className="flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DonutChart value={winrate.winrate} size={70} thickness={14} />
                <div className="flex flex-col">
                  <p className="text-zinc-200 font-semibold text-lg">{(winrate.winrate * 100).toFixed(0)}% WR</p>
                  <div className="text-sm text-zinc-400">{winrate.total} Played</div>
                </div>
              </div>

              <BasicStatFormat
                title={`${avgKDA.avgKills.toFixed(1)} / ${avgKDA.avgDeaths.toFixed(1)} / ${avgKDA.avgAssists.toFixed(1)}`}
                subtitle={`${((avgKDA.avgKills + avgKDA.avgAssists) / Math.max(1, avgKDA.avgDeaths)).toFixed(1)} KDA`}
              />
            </div>

            <div
              className="grid grid-cols-4 gap-2 items-center text-center
                            bg-zinc-800 py-2
                            text-xs text-zinc-300"
            >
              <p>Champion</p>
              <p>Played</p>
              <p>W-L</p>
              <p>Winrate</p>
            </div>

            <div className="flex flex-col gap-1">
              {winrateByChampion.map((c, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 items-center text-zinc-200 font-semibold text-sm text-center justify-items-center"
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

        {!playerProfile?.authId && (
          <Link href={`/player/${pid}/claim`}>
            <Card className="hover:bg-zinc-800 transition-colors duration-200">
              <div className="flex items-center justify-center gap-2">
                <BsPersonFillAdd size={18} />
                <p className="text-sm">Claim Account</p>
              </div>
            </Card>
          </Link>
        )}
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        {matches.map((match, index) => (
          <ProfileMatch key={index} match={match} />
        ))}
      </div>
    </div>
  )
}
