"use client"

import { cn } from "@/lib/utils"
import { PlayerCard as PlayerCardType } from "@/app/api/player/[puuid]/card/route"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { Realtime } from "ably"
import {
  AblyProvider,
  usePresence,
  usePresenceListener,
  ChannelProvider,
} from "ably/react"
import { useEffect, useState } from "react"

export function LobbyClient({
  lobbyId,
  player,
}: {
  lobbyId: string
  player: PlayerCardType
}) {
  const channel = `lobby:${lobbyId}`
  const [client, setClient] = useState<Realtime | null>(null)

  useEffect(() => {
    const realtime = new Realtime({
      authUrl: `/api/ably/token?lobbyId=${encodeURIComponent(lobbyId)}`,
    })

    setClient(realtime)
    return () => realtime.close()
  }, [lobbyId])

  if (!client) return <aside>Connecting…</aside>

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channel}>
        <LobbyContents player={player} />
      </ChannelProvider>
    </AblyProvider>
  )
}

function LobbyContents({ player }: { player: PlayerCardType }) {
  usePresence<PlayerCardType>(undefined, player)

  const { presenceData } = usePresenceListener<PlayerCardType>()

  const activePlayers = Array.from(
    new Map(presenceData.map(({ clientId, data }) => [clientId, data])).values()
  )

  return (
    <main className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <Toolbar activePlayers={activePlayers} />

      <section className="min-h-0 overflow-y-auto">
        <div className="max-w-9xl mx-auto grid h-full min-h-0 w-full grid-cols-[7fr_7fr_6fr] gap-4 p-4">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 p-2">
              <div className="size-4 rounded-xs bg-blue-500" />
              <h2 className="font-oswald text-lg font-semibold uppercase">
                Team 1
              </h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
              <PlayerCard player={null} team={0} />
              <PlayerCard player={null} team={0} />
              <PlayerCard player={null} team={0} />
              <PlayerCard player={null} team={0} />
              <PlayerCard player={null} team={0} />
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
              <PlayerCard player={null} team={1} />
              <PlayerCard player={null} team={1} />
              <PlayerCard player={null} team={1} />
              <PlayerCard player={null} team={1} />
              <PlayerCard player={null} team={1} />
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto bg-secondary p-2">
            {/* <LobbyPresence lobbyId={lobbyId} player={player} /> */}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export function PlayerCard({
  player,
  team,
}: {
  player: PlayerCardType | null
  team: 0 | 1
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
      <video
        src={`/testing${player.bannerId}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
        <div></div>
        <h2 className="font-oswald text-4xl font-semibold text-white uppercase">
          {player.riotIdGameName}
        </h2>
      </div>
    </div>
  )
}
