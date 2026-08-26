import { getClimbLeaderboard, joinClimbChallenge } from "./actions"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { AvatarPodiumBorder } from "@/components/avatar-podium-border"
import { Button } from "@/components/ui/button"
import { ClimbChallengeTimer } from "@/components/climb-challenge-timer"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BannerBackground } from "@/components/banner-background"

export default async function Page() {
  const [leaderboard] = await Promise.all([getClimbLeaderboard()])

  const podium = leaderboard.slice(0, 3)

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh w-full">
          <Image
            src="/climb/background.webp"
            alt=""
            fill
            sizes="100vw"
            className="rounded-xl object-cover opacity-80"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
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
              className="h-11 bg-rose-500 font-oswald text-lg font-semibold uppercase hover:bg-rose-600"
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
                    className="absolute inset-[10%] -z-10 rounded-full bg-indigo-950 blur-2xl"
                  />

                  {/* merch */}
                  <Image
                    src="/climb/merch.webp"
                    alt=""
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

          <div className="z-50 -mt-32 flex w-full flex-col gap-2">
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
      <BannerBackground bannerId={player.bannerId}>
        <div
          className={`relative aspect-video w-full rounded-md ${
            variant === "gold" ? "mb-14" : "mb-12"
          }`}
        >
          <div className="absolute top-full left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <AvatarPodiumBorder
              src="/defaultpfp.webp"
              size={48}
              variant={variant}
            />
          </div>
        </div>
      </BannerBackground>
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
