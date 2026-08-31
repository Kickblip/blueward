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
import { cn, safeSubstring } from "@/lib/utils"
import Link from "next/link"
import { fetchAvatarUrlByAuthId } from "@/lib/avatar-url"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IoIosGift } from "react-icons/io"
import { BsPatchQuestionFill } from "react-icons/bs"

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
            alt=""
            width={846}
            height={554}
            className="-my-8 -ml-10 hidden h-auto w-40 shrink-0 object-contain md:block"
          />

          <ClimbChallengeTimer initialNow={Date.now()} />

          <p className="ml-auto hidden pr-2 text-sm text-muted-foreground md:block">
            Syncs every hour
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
        <div className="-mt-4 flex w-full items-center justify-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="font-oswald font-semibold uppercase"
                variant="secondary"
              >
                <IoIosGift className="text-chart-3 dark:text-chart-1" />
                View Prizes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-oswald font-semibold uppercase">
                  Available Prizes
                </DialogTitle>
              </DialogHeader>

              <Image
                src="/climb/prizes.webp"
                alt=""
                width={600}
                height={400}
                className="mx-auto"
              />

              <div className="space-y-5 text-sm">
                <section>
                  <h3 className="mb-2 font-semibold">Prize Pool A</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>1 Epic skin (up to 1350 RP value)</li>
                    <li>Season 3: Act 1 Pass</li>
                    <li>575 RP credit</li>
                    <li>Convert to 5 Prize Pool B prizes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold">Prize Pool B</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>1 Skin Orb</li>
                    <li>Hextech Chest and Key</li>
                    <li>Summoner Icon</li>
                    <li>Into the Sanctum Bundle (limit 1 per account)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold">1st Place</h3>
                  <p>
                    Select 1 prize from Prize Pool A and 2 prizes from Prize
                    Pool B. Additionally, win 200,000 Blueward Crystals and an
                    exclusive Climb Challenge banner on Blueward.
                  </p>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold">2nd and 3rd Place</h3>
                  <p>
                    Select 1 prize from Prize Pool A and 1 prize from Prize Pool
                    B. Additionally, win 150,000 Blueward Crystals and an
                    exclusive Climb Challenge banner on Blueward.
                  </p>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold">4th and 5th Place</h3>
                  <p>
                    Select 2 prizes from Prize Pool B. Additionally, win 45,000
                    Blueward Crystals.
                  </p>
                </section>

                <section>
                  <h3 className="mb-1 font-semibold">
                    Team Liquid Merch Raffle
                  </h3>
                  <p>
                    Earn 1 raffle ticket for every 5 games played. Three winners
                    will be drawn at the end of the tournament. Each winner may
                    select one item from the available merch, including hoodies,
                    jerseys, and hats. The same player cannot win twice.
                  </p>
                </section>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="font-oswald font-semibold uppercase"
                variant="secondary"
              >
                <BsPatchQuestionFill className="text-chart-3 dark:text-chart-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-oswald font-semibold uppercase">
                  Details and Definitions
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 text-sm">
                <section>
                  <h3 className="mb-1 font-semibold">Challenge Period</h3>
                  <p>
                    The Fall Climb Challenge runs from{" "}
                    <strong>Monday, August 31 at 5:00 PM CST</strong> through{" "}
                    <strong>Monday, September 14 at 11:59 PM CST</strong>.
                  </p>
                  <p className="mt-2">
                    Games that end after the cutoff are not eligible for points.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold">Scoring</h3>
                  <p className="mb-2">
                    Points are awarded for Ranked Solo/Duo games played during
                    the challenge:
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      <strong>Win:</strong> +25 points
                    </li>
                    <li>
                      <strong>Loss:</strong> −25 points
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold">Winstreak Bonus</h3>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>A winstreak begins after 3 consecutive wins.</li>
                    <li>
                      Wins during an active winstreak receive a 1.4× point
                      multiplier, increasing the reward from +25 to +35 points
                      per win.
                    </li>
                    <li>
                      Wins earned before the winstreak do not receive the bonus.
                    </li>
                    <li>
                      A loss ends the bonus and resets the streak counter.
                    </li>
                    <li>
                      Winstreaks obtained before the challenge may carry into
                      the challenge period.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold">
                    Decayed or Inactive High-Elo Accounts
                  </h3>
                  <p>
                    Some accounts may be flagged as decayed or inactive high-elo
                    accounts. These players are still welcome to participate but
                    will receive a 0.8× multiplier on points earned from wins
                    while continuing to lose the full number of points for
                    losses.
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      <strong>Win:</strong> 0.8× points
                    </li>
                    <li>
                      <strong>Loss:</strong> 1.0× points
                    </li>
                    <li>
                      Debuffed accounts will be marked on the leaderboard.
                    </li>
                    <li>
                      The debuff may be removed after the player completes a
                      sufficient number of games.
                    </li>
                  </ul>
                </section>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
              <TooltipContent className="text-center">
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
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="w-6 shrink-0 text-right text-xl tabular-nums">
                      {index + 4}
                    </span>

                    <Avatar className="size-8">
                      <AvatarImage
                        src={player.avatarUrl ?? "/defaultpfp.webp"}
                        alt={`${player.riotIdGameName} profile picture`}
                      />
                    </Avatar>

                    <span className="text-sm group-hover:text-chart-3 sm:text-lg dark:group-hover:text-chart-1">
                      {player.riotIdGameName}
                    </span>

                    {player.inactive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-0.5">
                            <Image
                              src="/climb/ice.webp"
                              alt=""
                              width={24}
                              height={24}
                              className="hidden sm:block"
                            />
                            <span className="font-oswald text-xs font-semibold text-chart-2 sm:text-sm dark:text-chart-1">
                              0.8x
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Decayed account penalty</TooltipContent>
                      </Tooltip>
                    )}

                    {player.hotStreak && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-0.5">
                            <Image
                              src="/climb/fire.webp"
                              alt=""
                              width={24}
                              height={24}
                              className="mb-0.5 hidden sm:block"
                            />
                            <span className="font-oswald text-xs font-semibold text-red-500 sm:text-sm dark:text-red-400">
                              1.4x
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Winstreak point bonus</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8">
                    <span
                      className={cn(
                        "text-sm italic sm:text-xl",
                        player.points > 0
                          ? "text-chart-3 dark:text-chart-1"
                          : player.points < 0
                            ? "text-rose-500"
                            : ""
                      )}
                    >
                      {`${player.points > 0 ? "+" : ""}${player.points}`} Pts
                    </span>

                    <span className="text-xs sm:text-lg">
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
          <span className="font-oswald font-semibold text-yellow-400">
            {player.points}
          </span>{" "}
          <span className="text-xs font-medium uppercase">Pts</span>
          <span className="ml-2 text-sm font-medium">
            ({player.wins}W - {player.losses}L)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {player.inactive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5">
                  <Image src="/climb/ice.webp" alt="" width={24} height={24} />
                  <span className="font-oswald text-sm font-semibold text-chart-2 dark:text-chart-1">
                    0.8x
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Decayed account penalty</TooltipContent>
            </Tooltip>
          )}

          {player.hotStreak && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mr-0.5 flex items-center gap-0.5">
                  <Image
                    src="/climb/fire.webp"
                    alt=""
                    width={22}
                    height={22}
                    className="mb-0.5"
                  />
                  <span className="font-oswald text-sm font-semibold text-red-200">
                    1.4x
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Winstreak point bonus</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </Link>
  )
}
