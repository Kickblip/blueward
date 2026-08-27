import { RecentGame } from "@/components/recent-game"
import {
  fetchRecentGames,
  fetchTopLadderPlayers,
  fetchPlayerBannersByPuuids,
  fetchLeaderboardPositionByPuuid,
} from "./actions"
import { PodiumRow } from "@/components/podium-row"
import { LeaderboardRow } from "@/components/leaderboard-row"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { safeSubstring } from "@/lib/utils"

export default async function Home() {
  const user = await currentUser()
  const metadataPuuid = user?.privateMetadata.puuid
  const puuid = typeof metadataPuuid === "string" ? metadataPuuid : null

  const [games, players, leaderboardPosition] = await Promise.all([
    fetchRecentGames(),
    fetchTopLadderPlayers(),
    puuid ? fetchLeaderboardPositionByPuuid(puuid) : null,
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
            }}
            name={player.riotIdGameName}
            puuid={player.puuid}
            bannerId={banners[player.puuid]}
          />
        ))}

        {players.slice(3).map((player, index) => (
          <LeaderboardRow
            key={player.riotIdGameName}
            variant={user && player.puuid === puuid ? "highlighted" : "default"}
            ranking={index + 4}
            stats={{
              mmr: player.mmr,
              played: player.gamesPlayed,
            }}
            name={player.riotIdGameName}
            puuid={player.puuid}
          />
        ))}

        {user && leaderboardPosition && leaderboardPosition.position > 15 && (
          <LeaderboardRow
            variant="highlighted"
            ranking={leaderboardPosition.position}
            stats={{
              mmr: leaderboardPosition.mmr,
              played: leaderboardPosition.gamesPlayed,
            }}
            name={leaderboardPosition.riotIdGameName}
            puuid={puuid!}
          />
        )}
      </div>
      <div className="invisible col-span-1 flex flex-col gap-4 md:visible">
        <Link href="/climb">
          <div className="relative h-[17rem] w-full overflow-hidden rounded-md border border-blue-300/70 shadow-[0_0_28px_rgba(59,130,246,0.55)]">
            <Image
              src="/climb/banner.webp"
              alt=""
              fill
              sizes="(min-width: 1280px) 416px, (min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 z-10 p-2">
              <Button
                size="lg"
                className="w-full bg-zinc-300 px-4 font-oswald text-xl font-semibold text-zinc-800 uppercase opacity-90 hover:bg-zinc-200 hover:text-zinc-800"
              >
                Go to leaderboard
              </Button>
            </div>
          </div>
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
