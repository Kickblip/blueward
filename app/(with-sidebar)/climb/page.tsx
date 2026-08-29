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
import { currentUser } from "@clerk/nextjs/server"
import { safeSubstring } from "@/lib/utils"
import Link from "next/link"
import { fetchAvatarUrlByAuthId } from "@/lib/avatar-url"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export default async function Page() {
  const [leaderboard, user] = await Promise.all([
    getClimbLeaderboard(),
    currentUser(),
  ])

  const metadataPuuid = user?.privateMetadata.puuid

  const signedInUserIsParticipating =
    typeof metadataPuuid === "string" &&
    leaderboard.some((player) => player.puuid === metadataPuuid)

  const leaderboardWithAvatars = await Promise.all(
    leaderboard.map(async (player) => ({
      ...player,
      avatarUrl: await fetchAvatarUrlByAuthId(player.authId),
    }))
  )

  const podium = leaderboardWithAvatars.slice(0, 3)

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh w-full">
          <div className="relative h-full w-full">
            <Image
              src="/climb/background.webp"
              alt=""
              fill
              sizes="100vw"
              className="rounded-xl object-cover opacity-80"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Card className="mb-4 flex-row items-center gap-4 overflow-visible">
          <Image
            src="/climb/title.svg"
            alt="Blueward merchandise"
            width={846}
            height={554}
            className="-my-8 -ml-10 hidden h-auto w-40 shrink-0 object-contain md:block"
          />

          <ClimbChallengeTimer initialNow={Date.now()} />

          <p className="ml-auto hidden pr-2 text-sm text-muted-foreground md:block">
            Syncs every four hours
          </p>

          {!signedInUserIsParticipating && (
            <form action={joinClimbChallenge} className="ml-auto md:ml-0">
              <Button
                type="submit"
                className="h-11 bg-rose-500 font-oswald text-base font-semibold uppercase hover:bg-rose-600 sm:text-lg"
                size="lg"
              >
                Join the challenge!
              </Button>
            </form>
          )}
        </Card>

        <div className="flex w-full flex-col items-center gap-4">
          <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-4">
            <PodiumCard variant="silver" player={podium[1]} />
            <PodiumCard variant="gold" player={podium[0]} />
            <PodiumCard variant="bronze" player={podium[2]} />
          </div>

          <div className="relative w-fit">
            <Image
              src="/podium.svg"
              alt=""
              width={186}
              height={163}
              className="h-auto w-128"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-20 -left-32 isolate z-10 hidden cursor-pointer transition-transform duration-300 hover:scale-115 hover:-rotate-3 sm:block">
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
            {leaderboardWithAvatars.slice(3).map((player, index) => (
              <Link
                key={index}
                href={`/player/${safeSubstring(player.puuid, 0, 20)}`}
                className="group"
              >
                <Card className="flex-row items-center justify-between gap-4 font-oswald text-lg font-semibold uppercase">
                  <div className="flex items-center gap-4">
                    <span className="w-6 shrink-0 text-right text-xl tabular-nums">
                      {index + 4}
                    </span>

                    <Avatar className="size-8">
                      <AvatarImage
                        src={player.avatarUrl ?? "/defaultpfp.webp"}
                        alt={`${player.riotIdGameName} profile picture`}
                      />
                    </Avatar>

                    <span className="group-hover:text-chart-3 dark:group-hover:text-chart-1">
                      {player.riotIdGameName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8">
                    <span className="text-xl italic">
                      {`${player.netWins > 0 ? "+" : ""}${25 * player.netWins}`}{" "}
                      Pts
                    </span>

                    <span>
                      {player.wins}W - {player.losses}L
                    </span>
                  </div>
                </Card>
              </Link>
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
    <Link
      href={`/player/${safeSubstring(player.puuid, 0, 20)}`}
      className="group"
    >
      <div
        className={`flex flex-col items-center ${variant !== "gold" && "pt-12"}`}
      >
        <div
          className={`relative w-full ${
            variant === "gold" ? "md:mb-14" : "md:mb-12"
          }`}
        >
          <BannerBackground bannerId={player.bannerId}>
            <div className="hidden aspect-video w-full rounded-md md:block" />
          </BannerBackground>

          <div className="relative z-10 mx-auto w-fit md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            <AvatarPodiumBorder
              src={player.avatarUrl || "/defaultpfp.webp"}
              size={48}
              variant={variant}
            />
          </div>
        </div>
        <p className="z-20 text-center font-oswald text-2xl font-semibold uppercase group-hover:text-chart-3 dark:group-hover:text-chart-1">
          {player.riotIdGameName}
        </p>
        <div>
          <span className="font-oswald font-semibold">
            {25 * player.netWins}
          </span>{" "}
          <span className="text-xs font-medium uppercase">Pts</span>
          <span className="ml-2 text-sm font-medium">
            ({player.wins}W - {player.losses}L)
          </span>
        </div>
      </div>
    </Link>
  )
}
