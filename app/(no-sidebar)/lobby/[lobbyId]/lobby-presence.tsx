"use client"

import * as Ably from "ably"
import { useEffect, useMemo, useState } from "react"
import {
  AblyProvider,
  usePresence,
  usePresenceListener,
  ChannelProvider,
} from "ably/react"
import { PlayerCard } from "@/app/api/player/[puuid]/card/route"

export function LobbyPresence({
  lobbyId,
  player,
}: {
  lobbyId: string
  player: PlayerCard
}) {
  const [client, setClient] = useState<Ably.Realtime | null>(null)

  useEffect(() => {
    const realtime = new Ably.Realtime({
      authUrl: `/api/ably/token?lobbyId=${encodeURIComponent(lobbyId)}`,
    })

    setClient(realtime)

    return () => realtime.close()
  }, [lobbyId])

  if (!client) {
    return <aside className="bg-secondary p-4">Connecting…</aside>
  }

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={`lobby:${lobbyId}`}>
        <UserPool lobbyId={lobbyId} player={player} />
      </ChannelProvider>
    </AblyProvider>
  )
}

function UserPool({
  lobbyId,
  player,
}: {
  lobbyId: string
  player: PlayerCard
}) {
  const channel = `lobby:${lobbyId}`

  usePresence(channel, player)

  const { presenceData } = usePresenceListener(channel)

  const users = useMemo(
    () =>
      Array.from(
        new Map(
          presenceData.map((presence) => [presence.clientId, presence])
        ).values()
      ),
    [presenceData]
  )

  return (
    <aside className="min-h-0 overflow-y-auto bg-secondary p-4">
      <div className="mb-4">
        <h2 className="font-oswald text-lg font-semibold uppercase">
          User pool ({users.length})
        </h2>

        <input
          readOnly
          value={typeof window === "undefined" ? "" : window.location.href}
          className="mt-2 w-full"
          aria-label="Lobby share link"
        />
      </div>

      <ul className="space-y-2">
        {users.map((presence) => {
          const data = presence.data as PlayerCard

          return <li key={presence.clientId}>{data.riotIdGameName}</li>
        })}
      </ul>
    </aside>
  )
}
