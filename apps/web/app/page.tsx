import Countdown from "@repo/ui/Countdown"
import RecentGame from "@repo/ui/RecentGame"
import PodiumRow from "@repo/ui/PodiumRow"
import LeaderboardRow from "@repo/ui/LeaderboardRow"
import { fetchRecentGames, fetchTopLadderPlayers, fetchPlayerBannersByPuuids } from "./actions"
import { SEASON_END_DATE } from "@repo/ui/config"

export default async function Home() {
  const games = await fetchRecentGames()
  const players = await fetchTopLadderPlayers()

  const podium = players.slice(0, 3)

  const banners = await fetchPlayerBannersByPuuids(podium.map((player) => player.puuid))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          {podium.map((player, index) => (
            <PodiumRow
              key={player.riotIdGameName}
              size={index === 0 ? "large" : "small"}
              ranking={index + 1}
              stats={{ mmr: player.mmr, played: player.gamesPlayed, winrate: (player.winrate * 100).toFixed(0) + "%" }}
              name={player.riotIdGameName}
              puuid={player.puuid}
              glow={"none"}
              backgroundImage={`/banners/${banners[player.puuid] ?? 0}.webp`}
            />
          ))}

          {players.slice(3).map((player, index) => (
            <LeaderboardRow
              key={player.riotIdGameName}
              ranking={index + 4}
              stats={{ mmr: player.mmr, played: player.gamesPlayed, winrate: (player.winrate * 100).toFixed(0) + "%" }}
              name={player.riotIdGameName}
              puuid={player.puuid}
            />
          ))}
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <Countdown date={SEASON_END_DATE} />
          {games.map((g) => (
            <RecentGame key={g.matchId} players={g.players} gameEndTimestamp={g.gameEndTimestamp} />
          ))}
        </div>
      </div>
    </div>
  )
}
