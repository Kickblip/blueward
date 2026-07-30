"use client"

import { cn, safeSubstring } from "@/lib/utils"
import { PlayerCard as PlayerCardType } from "@/app/api/player/[puuid]/card/route"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { Realtime } from "ably"
import { AblyProvider, ChannelProvider } from "ably/react"
import { useEffect, useState } from "react"
import { RoomSnapshot } from "@/lib/room-state"
import { RoomProvider, useRoom } from "./room-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BannerBackground } from "@/components/banner-background"
import { LevelBadge } from "@/components/level-badge"
import { EllipsisIcon } from "lucide-react"
import { FaTrash } from "react-icons/fa6"
import { PiCrownSimpleFill } from "react-icons/pi"
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaUser,
  FaCheckCircle,
} from "react-icons/fa"
import Link from "next/link"
import { AdSlot } from "@/components/ad-slot"
import { movePlayerToTeam } from "./actions"

export function RoomClient({
  initialSnapshot,
  viewerAuthId,
  player,
}: {
  initialSnapshot: RoomSnapshot
  viewerAuthId: string
  player: PlayerCardType
}) {
  const roomId = initialSnapshot.roomId
  const channel = `room:${roomId}`
  const [client, setClient] = useState<Realtime | null>(null)

  useEffect(() => {
    const realtime = new Realtime({
      authUrl: `/api/ably/token?roomId=${encodeURIComponent(roomId)}`,
    })

    setClient(realtime)
    return () => realtime.close()
  }, [roomId])

  if (!client) return <aside>Connecting…</aside>

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channel}>
        <RoomProvider
          initialSnapshot={initialSnapshot}
          currentPlayer={player}
          viewerAuthId={viewerAuthId}
        >
          <RoomContents />
        </RoomProvider>
      </ChannelProvider>
    </AblyProvider>
  )
}

function RoomContents() {
  const { activeLobby, playerPool, isOwner } = useRoom()

  const team1Players =
    activeLobby?.players.filter(({ teamId }) => teamId === 0) ?? []

  const team2Players =
    activeLobby?.players.filter(({ teamId }) => teamId === 1) ?? []

  return (
    <main className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <Toolbar />

      <section className="min-h-0 overflow-y-auto">
        <div className="max-w-9xl mx-auto grid h-full min-h-0 w-full grid-cols-[7fr_7fr_6fr] grid-rows-[minmax(0,1fr)_90px] gap-4 p-4">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 p-2">
              <div className="size-4 rounded-xs bg-blue-500" />
              <h2 className="font-oswald text-lg font-semibold uppercase">
                Team 1
              </h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
              {Array.from({ length: 5 }, (_, index) => {
                const assignment = team1Players[index]

                return (
                  <PlayerCard
                    key={assignment?.player.id ?? `team-1-slot-${index}`}
                    player={assignment?.player ?? null}
                    team={0}
                    useOwnerView={isOwner}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 p-2">
              <div className="size-4 rounded-xs bg-rose-500" />
              <h2 className="font-oswald text-lg font-semibold uppercase">
                Team 2
              </h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
              {Array.from({ length: 5 }, (_, index) => {
                const assignment = team2Players[index]

                return (
                  <PlayerCard
                    key={assignment?.player.id ?? `team-2-slot-${index}`}
                    player={assignment?.player ?? null}
                    team={1}
                    useOwnerView={isOwner}
                  />
                )
              })}
            </div>
          </div>

          <div className="row-span-2 min-h-0 overflow-y-auto bg-secondary p-2">
            {playerPool.map((player) => (
              <PoolCard
                key={player.puuid}
                player={player}
                useOwnerView={isOwner}
              />
            ))}
          </div>

          <AdSlot name="lobby-bottom" className="col-span-2 h-[90px] w-full" />
        </div>
      </section>

      <Footer />
    </main>
  )
}

export function PoolCard({
  player,
  useOwnerView,
}: {
  player: PlayerCardType
  useOwnerView: boolean
}) {
  return (
    <BannerBackground bannerId={player.bannerId}>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
        <div className="flex h-full flex-col justify-between gap-2 p-2">
          <div className="flex items-center justify-between gap-2">
            <LevelBadge experience={player.experience} />

            <PlayerDropdownMenu useOwnerView={useOwnerView} player={player} />
          </div>
          <h2 className="font-oswald text-4xl font-semibold text-white uppercase">
            {player.riotIdGameName}
          </h2>
        </div>
      </div>
    </BannerBackground>
  )
}

export function PlayerCard({
  player,
  team,
  useOwnerView,
}: {
  player: PlayerCardType | null
  team: 0 | 1
  useOwnerView: boolean
}) {
  if (!player) {
    return (
      <div
        className={cn(
          `h-32 border border-l-4 bg-secondary`,
          team === 0 ? "border-l-blue-500" : "border-l-rose-500"
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden border border-l-4 bg-secondary",
        team === 0 ? "border-l-blue-500" : "border-l-rose-500"
      )}
    >
      <BannerBackground bannerId={player.bannerId}>
        <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
          <div className="flex items-center justify-between gap-2">
            <LevelBadge experience={player.experience} />
            <PlayerDropdownMenu useOwnerView={useOwnerView} player={player} />
          </div>
          <h2 className="font-oswald text-4xl font-semibold text-white uppercase">
            {player.riotIdGameName}
          </h2>
        </div>
      </BannerBackground>
    </div>
  )
}

export function PlayerDropdownMenu({
  useOwnerView,
  player,
}: {
  useOwnerView: boolean
  player: PlayerCardType
}) {
  const { activeLobby } = useRoom()

  function move(teamId: 0 | 1) {
    if (!activeLobby) return

    void movePlayerToTeam(activeLobby.id, player.id, teamId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon-sm">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Player</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link
              href={`/player/${safeSubstring(player.puuid, 0, 20)}`}
              target="_blank"
            >
              <FaUser className="text-chart-3 dark:text-chart-1" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FaCheckCircle className="text-chart-3 dark:text-chart-1" />
            Draft Player
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {useOwnerView && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!activeLobby}
                onSelect={() => move(0)}
              >
                <FaArrowCircleLeft className="text-chart-3 dark:text-chart-1" />
                Move to Team 1
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!activeLobby}
                onSelect={() => move(1)}
              >
                <FaArrowCircleRight className="text-chart-3 dark:text-chart-1" />
                Move to Team 2
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Danger</DropdownMenuLabel>
              <DropdownMenuItem variant="destructive">
                <PiCrownSimpleFill />
                Make Owner
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <FaTrash />
                Kick Player
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
