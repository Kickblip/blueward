import { RecentGame } from "@/components/recent-game"
import { PodiumRow } from "@/components/podium-row"
import { LeaderboardRow } from "@/components/leaderboard-row"
import {
  fetchRecentGames,
  fetchTopLadderPlayers,
  fetchPlayerBannersByPuuids,
} from "./actions"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default async function Home() {
  const games = await fetchRecentGames()
  const players = await fetchTopLadderPlayers()

  const podium = players.slice(0, 3)

  const banners = await fetchPlayerBannersByPuuids(
    podium.map((player) => player.puuid)
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="col-span-2 flex flex-col gap-4">
        {podium.map((player, index) => (
          <PodiumRow
            key={player.riotIdGameName}
            size={index === 0 ? "large" : "small"}
            ranking={index + 1}
            stats={{
              mmr: player.mmr,
              played: player.gamesPlayed,
              winrate: (player.winrate * 100).toFixed(0) + "%",
            }}
            name={player.riotIdGameName}
            puuid={player.puuid}
            bannerId={banners[player.puuid]}
          />
        ))}

        {players.slice(3).map((player, index) => (
          <LeaderboardRow
            key={player.riotIdGameName}
            ranking={index + 4}
            stats={{
              mmr: player.mmr,
              played: player.gamesPlayed,
              winrate: (player.winrate * 100).toFixed(0) + "%",
            }}
            name={player.riotIdGameName}
            puuid={player.puuid}
          />
        ))}
      </div>
      <div className="invisible col-span-1 flex flex-col gap-4 md:visible">
        <Link href="/predictions">
          <Card className="cursor-pointer flex-row items-center justify-center gap-2 border-blue-400 bg-blue-950 transition-colors duration-200 hover:border-blue-300">
            <Image src="/stonks.webp" alt="" width={96} height={96} />
            <div className="flex flex-col gap-1 pr-8 text-center">
              <h3 className="font-oswald text-5xl font-semibold uppercase">
                Predictions
              </h3>
              <p className="text-xs text-zinc-300">
                Guess the outcomes of upcoming matches and win crystals!
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/shop">
          <Card className="cursor-pointer flex-row items-center justify-center gap-2 border-yellow-400 bg-yellow-950 transition-colors duration-200 hover:border-yellow-300">
            <Image
              src="/horizons.png"
              alt="Horizons set logo"
              width={150}
              height={80}
            />
            <div className="flex flex-col gap-1 text-center">
              <h3 className="font-oswald text-xl font-semibold uppercase">
                New Banner Collection
              </h3>
              <p className="text-xs text-zinc-300">
                Check out Horizons: the first collection of limited-edition
                season banners!
              </p>
            </div>
          </Card>
        </Link>

        {games.map((g) => (
          <RecentGame
            key={g.matchId}
            players={g.players}
            gameEndTimestamp={g.gameEndTimestamp}
          />
        ))}
      </div>
    </div>
  )
}
