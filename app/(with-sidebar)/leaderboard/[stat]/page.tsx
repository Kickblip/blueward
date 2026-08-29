import { LeaderboardRow } from "@/components/leaderboard-row"
import { statList, getTopPlayersForStat, StatKey } from "./actions"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import {
  safeSubstring,
  timestampToRelativeTime,
  toNumberWithCommas,
} from "@/lib/utils"
import { IoPodium } from "react-icons/io5"
import Image from "next/image"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { Avatar, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { BiSolidCrown } from "react-icons/bi"
import { fetchAvatarUrlByAuthId } from "@/lib/avatar-url"

export async function generateStaticParams() {
  return Object.keys(statList).map((stat) => ({ stat }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stat: StatKey }>
}) {
  const { stat } = await params

  return {
    title: `BLUEWARD | Top ${statList[stat]}`,
  }
}

export default async function Leaderboard({
  params,
}: {
  params: Promise<{ stat: StatKey }>
}) {
  const { stat } = await params

  const limit = 15
  const players = await getTopPlayersForStat(stat, limit)
  const podium = players.slice(0, 3)

  const podiumProfiles = await Promise.all(
    podium.map(async (player) => {
      const card = await fetchPlayerCardByPuuid(
        safeSubstring(player.puuid, 0, 20)
      )

      return {
        card,
        avatarUrl: await fetchAvatarUrlByAuthId(card?.authId),
      }
    })
  )

  const buildStatsProp = (value: number, createdAt: string) => ({
    [statList[stat]]: toNumberWithCommas(value),
    Set: timestampToRelativeTime(createdAt),
  })

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="col-span-1 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 font-oswald text-2xl font-semibold uppercase">
            <IoPodium className="size-6 text-chart-3 dark:text-chart-1" />
            <span>Leaderboards</span>
          </h1>

          <p className="max-w-sm text-sm text-muted-foreground">
            Top {limit} players for {statList[stat]} updated live
          </p>
          {Object.entries(statList).map(([slug, label]) => (
            <Link
              href={`/leaderboard/${slug}`}
              key={slug}
              className={`text-md font-semibold ${slug === stat ? "text-chart-3 dark:text-chart-1" : "transition-colors duration-200 hover:text-chart-3 dark:hover:text-chart-1"} `}
            >
              <Card className="p-2">{label}</Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="col-span-2 flex flex-col items-center gap-4">
        <div className="grid w-full grid-cols-3 gap-4">
          <PodiumCard
            player={podium[1]}
            profileCard={podiumProfiles[1].card}
            avatarUrl={podiumProfiles[1].avatarUrl}
            stat={stat}
          />
          <PodiumCard
            player={podium[0]}
            profileCard={podiumProfiles[0].card}
            avatarUrl={podiumProfiles[0].avatarUrl}
            stat={stat}
            first
          />
          <PodiumCard
            player={podium[2]}
            profileCard={podiumProfiles[2].card}
            avatarUrl={podiumProfiles[2].avatarUrl}
            stat={stat}
          />
        </div>

        <Image src="/podium.svg" alt="" width={512} height={512} />

        <div className="-mt-40 flex w-full flex-col gap-4 bg-background px-4">
          {players.slice(3).map((player, index) => (
            <LeaderboardRow
              key={player.puuid + player.createdAt}
              ranking={index + 4}
              stats={buildStatsProp(player.value, player.createdAt)}
              name={player.riotIdGameName}
              puuid={player.puuid}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PodiumCard({
  player,
  profileCard,
  avatarUrl,
  stat,
  first = false,
}: {
  player: Awaited<ReturnType<typeof getTopPlayersForStat>>[number]
  profileCard: Awaited<ReturnType<typeof fetchPlayerCardByPuuid>> | null
  avatarUrl: string | null
  stat: StatKey
  first?: boolean
}) {
  return (
    <Link
      href={`/player/${safeSubstring(player.puuid, 0, 20)}`}
      className="group"
    >
      <div className={`flex flex-col items-center gap-2 ${!first && "pt-16"}`}>
        {first && <BiSolidCrown className="size-6 text-yellow-500" />}

        <div className="relative mb-6 aspect-video w-full">
          <Image
            src={`/banners/compressed/${profileCard?.bannerId || 0}.webp`}
            alt=""
            fill
            className="rounded-md object-cover"
          />

          <div className="absolute top-full left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <AvatarGroup>
              <Avatar className="size-12">
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${player.championName}_0.jpg`}
                />
              </Avatar>
              <Avatar className="size-12">
                <AvatarImage src={avatarUrl ?? "/defaultpfp.webp"} />
              </Avatar>
            </AvatarGroup>
          </div>
        </div>
        <p className="font-oswald text-2xl font-semibold uppercase group-hover:text-chart-3 dark:group-hover:text-chart-1">
          {player.riotIdGameName}
        </p>
        <div>
          <span className="font-oswald font-semibold">
            {toNumberWithCommas(player.value)}
          </span>{" "}
          <span className="text-xs font-medium uppercase">
            {statList[stat]}
          </span>
        </div>
      </div>
    </Link>
  )
}
