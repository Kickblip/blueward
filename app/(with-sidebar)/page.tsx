import { RecentGame } from "@/components/recent-game"

import { LeaderboardRow } from "@/components/leaderboard-row"
import {
  fetchRecentGames,
  fetchTopLadderPlayers,
  fetchPlayerBannersByPuuids,
} from "./actions"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { AvatarPodiumBorder } from "@/components/avatar-podium-border"

export default async function Home() {
  const games = await fetchRecentGames()
  const players = await fetchTopLadderPlayers()

  const podium = players.slice(0, 3)

  const banners = await fetchPlayerBannersByPuuids(
    podium.map((player) => player.puuid)
  )

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh w-full">
          <Image
            src="/background.jpg"
            alt=""
            fill
            sizes="100vw"
            className="rounded-xl object-cover"
          />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-4">
          {/* {podium.map((player, index) => (
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
        ))} */}

          <div className="relative isolate z-10 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-3">
            {/* glow */}
            <div
              aria-hidden="true"
              className="absolute inset-[15%] -z-10 rounded-full bg-white/80 blur-2xl"
            />

            {/* merch */}
            <Image
              src="/climb/merch.png"
              alt="Blueward merchandise"
              width={200}
              height={200}
              className="block h-auto w-36"
            />
          </div>

          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
            <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
              <PodiumCard variant="silver" />
              <PodiumCard variant="gold" />
              <PodiumCard variant="bronze" />
            </div>

            <Image src="/podium.svg" alt="" width={512} height={512} />

            <Card className="-mt-40 h-96 w-full">
              <></>
            </Card>
          </div>

          <div className="z-30 flex flex-col gap-2">
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
    </>
  )
}

function PodiumCard({ variant }: { variant: "gold" | "silver" | "bronze" }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${variant !== "gold" && "pt-16"}`}
    >
      <div className="relative mb-6 aspect-video w-full">
        <Image
          src={`/banners/compressed/5.webp`}
          alt=""
          fill
          className="rounded-md object-cover"
        />

        <div className="absolute top-full left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <AvatarPodiumBorder
            src={"/defaultpfp.webp"}
            size={48}
            variant={variant}
          />
        </div>
      </div>
      <p className="font-oswald text-2xl font-semibold uppercase group-hover:text-chart-3 dark:group-hover:text-chart-1">
        Kickball
      </p>
      <div>
        <span className="font-oswald font-semibold">+200</span>{" "}
        <span className="text-xs font-medium uppercase">LP</span>
      </div>
    </div>
  )
}
