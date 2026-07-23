"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useChannel, usePresence, usePresenceListener } from "ably/react"
import type { PlayerCard } from "@/app/api/player/[puuid]/card/route"
import type { RoomSnapshot } from "@/lib/room-state"

type RoomContextValue = RoomSnapshot & {
  isOwner: boolean
  activeLobby: RoomSnapshot["lobbies"][number] | null
  presentPlayers: PlayerCard[]
  playerPool: PlayerCard[]
  selectLobby: (id: string) => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomProvider({
  initialSnapshot,
  currentPlayer,
  viewerAuthId,
  children,
}: {
  initialSnapshot: RoomSnapshot
  currentPlayer: PlayerCard
  viewerAuthId: string
  children: ReactNode
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [selectedLobbyId, selectLobby] = useState<string | null>(null)

  usePresence<PlayerCard>(undefined, currentPlayer)

  const { presenceData } = usePresenceListener<PlayerCard>()

  useChannel({}, "room-state-changed", ({ data }) => {
    setSnapshot(data as RoomSnapshot)
  })

  const presentPlayers = Array.from(
    new Map(presenceData.map(({ clientId, data }) => [clientId, data])).values()
  )

  const activeLobby =
    snapshot.lobbies.find(({ id }) => id === selectedLobbyId) ??
    snapshot.lobbies[0] ??
    null

  const assignedPlayerIds = new Set(
    snapshot.lobbies.flatMap((lobby) =>
      lobby.players.map(({ player }) => player.id)
    )
  )

  const playerPool = presentPlayers.filter(
    ({ id }) => !assignedPlayerIds.has(id)
  )

  return (
    <RoomContext.Provider
      value={{
        ...snapshot,
        isOwner: snapshot.ownerAuthId === viewerAuthId,
        activeLobby,
        presentPlayers,
        playerPool,
        selectLobby,
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const room = useContext(RoomContext)

  if (!room) {
    throw new Error("useRoom must be used inside RoomProvider")
  }

  return room
}
