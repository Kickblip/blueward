import LeaderboardRow from "@repo/ui/LeaderboardRow"
import PodiumRow from "@repo/ui/PodiumRow"
import { statList, getTopPlayersForStat, StatKey } from "./helpers"
import Link from "next/link"
import Card from "@repo/ui/Card"
import { timestampToRelativeTime } from "@repo/ui/helpers"

export async function generateStaticParams() {
  return Object.keys(statList).map((stat) => ({ stat }))
}

export default async function Leaderboard({ params }: { params: Promise<{ stat: StatKey }> }) {
  const { stat } = await params

  const limit = 15
  const players = await getTopPlayersForStat(stat, limit)
  const podium = players.slice(0, 3)

  const buildStatsProp = (value: number, createdAt: string) => ({
    [statList[stat]]: value,
    date: timestampToRelativeTime(createdAt),
  })

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Card title="Leaderboards" subtitle="Select a leaderboard to view">
            <></>
          </Card>
          {Object.entries(statList).map(([slug, label]) => (
            <Link
              href={`/leaderboard/${slug}`}
              key={slug}
              className={`
                font-semibold text-md
                ${slug === stat ? "text-blue-400" : "hover:text-blue-400 transition-colors duration-200"}    
            `}
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
            glow="none"
            size="large"
            ranking={index + 1}
            stats={buildStatsProp(player.value, player.createdAt)}
            name={player.riotIdGameName}
            puuid={player.puuid}
            championName={player.championName}
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
