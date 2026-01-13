import Countdown from "@repo/ui/Countdown"
import RecentGame from "@repo/ui/RecentGame"
import PodiumRow from "@repo/ui/PodiumRow"
import LeaderboardRow from "@repo/ui/LeaderboardRow"
import { FetchRecentGames, FetchTopLadderPlayers } from "./actions"

export default async function Home() {
  const games = await FetchRecentGames()
  const players = await FetchTopLadderPlayers()

  const podium = players.slice(0, 3)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        {podium.map((player, index) => (
          <PodiumRow
            key={player.riotIdGameName}
            size={index === 0 ? "large" : "small"}
            ranking={index + 1}
            stats={{ played: player.gamesPlayed, mmr: player.mmr, winrate: player.winrate }}
            name={player.riotIdGameName}
            puuid={player.puuid}
          />
        ))}

        {players.slice(3).map((player, index) => (
          <LeaderboardRow
            key={player.riotIdGameName}
            ranking={index + 4}
            stats={{ played: player.gamesPlayed, mmr: player.mmr, winrate: player.winrate }}
            name={player.riotIdGameName}
            puuid={player.puuid}
          />
        ))}
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        <Countdown date={process.env.NEXT_PUBLIC_SEASON_END!} />
        {games.map((g) => (
          <RecentGame key={g.matchId} players={g.players} gameEndTimestamp={g.gameEndTimestamp} />
        ))}
      </div>
    </div>
  )
}
