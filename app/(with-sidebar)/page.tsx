import { RecentGame } from "@/components/recent-game"
import {
  fetchRecentGames,
  getClimbLeaderboard,
  joinClimbChallenge,
} from "./actions"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { AvatarPodiumBorder } from "@/components/avatar-podium-border"
import { Button } from "@/components/ui/button"
import { ClimbChallengeTimer } from "@/components/climb-challenge-timer"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default async function Home() {
  const [games, leaderboard] = await Promise.all([
    fetchRecentGames(),
    getClimbLeaderboard(),
  ])

  const podium = leaderboard.slice(0, 3)

  // const players = await fetchTopLadderPlayers()
  // const podium = players.slice(0, 3)
  // const banners = await fetchPlayerBannersByPuuids(
  //   podium.map((player) => player.puuid)
  // )

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh w-full">
          <Image
            src="/background.png"
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

          <Card className="mb-4 flex-row items-center gap-4 overflow-visible">
            <Image
              src="/climb/title.svg"
              alt="Blueward merchandise"
              width={160}
              height={160}
              className="-my-8 -ml-10 shrink-0 object-contain"
            />

            <ClimbChallengeTimer initialNow={Date.now()} />

            <p className="ml-auto text-sm text-muted-foreground">
              Syncs every hour
            </p>

            <form action={joinClimbChallenge}>
              <Button
                type="submit"
                className="h-12 font-oswald text-lg font-semibold uppercase"
                size="lg"
              >
                Join the challenge!
              </Button>
            </form>
          </Card>

          <div className="flex w-full flex-col items-center gap-4">
            <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-4">
              <PodiumCard variant="silver" player={podium[1]} />
              <PodiumCard variant="gold" player={podium[0]} />
              <PodiumCard variant="bronze" player={podium[2]} />
            </div>

            <div className="relative w-fit">
              <Image src="/podium.svg" alt="" width={512} height={512} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-20 -left-32 isolate z-10 cursor-pointer transition-transform duration-300 hover:scale-115 hover:-rotate-3">
                    {/* glow */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-[10%] -z-10 rounded-full bg-white/80 blur-2xl"
                    />

                    {/* merch */}
                    <Image
                      src="/climb/merch.png"
                      alt="Blueward merchandise"
                      width={200}
                      height={200}
                      className="block h-auto w-50"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-center text-lg">
                  Earn raffle tickets for Team Liquid merch by playing!
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="z-50 -mt-40 flex w-full flex-col gap-2">
              {leaderboard.slice(3).map((player, index) => (
                <Card
                  key={index}
                  className="flex-row items-center justify-between gap-4 font-oswald text-lg font-semibold uppercase"
                >
                  <div className="flex items-center gap-8">
                    <span className="text-xl italic">
                      {`${player.netWins > 0 ? "+" : ""}${25 * player.netWins}`}{" "}
                      Pts
                    </span>

                    <span>{player.riotIdGameName}</span>
                  </div>

                  <div className="flex items-center gap-8">
                    <span>
                      {player.wins}W - {player.losses}L
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="invisible col-span-1 flex flex-col gap-4 md:visible">
          <Link href="/shop">
            <div className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-md border border-blue-400 bg-blue-500 transition-colors duration-200 hover:border-blue-300">
              <Image src="/stonks.webp" alt="" width={96} height={96} />
              <div className="flex flex-col gap-1 pr-8 text-center">
                <h3 className="font-oswald text-5xl font-semibold text-white uppercase">
                  New Shop
                </h3>
                <p className="text-sm text-white/75">
                  Animated banners and bigger wheels!
                </p>
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
    </>
  )
}

function PodiumCard({
  variant,
  player,
}: {
  variant: "gold" | "silver" | "bronze"
  player: any
}) {
  return (
    <div
      className={`flex flex-col items-center ${variant !== "gold" && "pt-12"}`}
    >
      <div
        className={`relative aspect-video w-full ${variant === "gold" ? "mb-14" : "mb-12"}`}
      >
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
      <p className="z-20 font-oswald text-2xl font-semibold uppercase group-hover:text-chart-3 dark:group-hover:text-chart-1">
        {player.riotIdGameName}
      </p>
      <div>
        <span className="font-oswald font-semibold">{25 * player.netWins}</span>{" "}
        <span className="text-xs font-medium uppercase">Pts</span>
        <span className="ml-2 text-sm font-medium">
          ({player.wins}W - {player.losses}L)
        </span>
      </div>
    </div>
  )
}
