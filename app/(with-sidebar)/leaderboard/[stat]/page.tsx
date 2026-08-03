import { LeaderboardRow } from "@/components/leaderboard-row"
import { PodiumRow } from "@/components/podium-row"
import { statList, getTopPlayersForStat, StatKey } from "./helpers"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { timestampToRelativeTime, toNumberWithCommas } from "@/lib/utils"
import { IoPodium } from "react-icons/io5"
import { fetchPlayerBannersByPuuids } from "../../actions"

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

  const banners = await fetchPlayerBannersByPuuids(
    podium.map((player) => player.puuid)
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

      <div className="col-span-2 flex flex-col gap-4">
        {podium.map((player, index) => (
          <PodiumRow
            key={player.puuid + player.createdAt}
            size="large"
            ranking={index + 1}
            stats={buildStatsProp(player.value, player.createdAt)}
            name={player.riotIdGameName}
            puuid={player.puuid}
            bannerId={banners[player.puuid] ?? 0}
          />
        ))}

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
  )
}
