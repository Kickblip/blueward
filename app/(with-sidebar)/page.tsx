import { RecentGame } from "@/components/recent-game"
import {
  fetchRecentGames,
  fetchTopLadderPlayers,
  fetchPlayerBannersByPuuids,
} from "./actions"
import { PodiumRow } from "@/components/podium-row"
import { LeaderboardRow } from "@/components/leaderboard-row"

import Link from "next/link"
import { ClimbChallengeBanner } from "@/components/climb-challenge-banner"

export default async function Home() {
  const [games, players] = await Promise.all([
    fetchRecentGames(),
    fetchTopLadderPlayers(),
  ])

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
        <Link href="/climb">
          <ClimbChallengeBanner />
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
