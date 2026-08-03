"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useChannel, usePresence, usePresenceListener } from "ably/react"
import type { RoomParticipant, RoomSnapshot } from "@/lib/room-state"

type RoomContextValue = RoomSnapshot & {
  isOwner: boolean
  activeLobby: RoomSnapshot["lobbies"][number] | null
  presentParticipants: RoomParticipant[]
  participantPool: RoomParticipant[]
  selectLobby: (id: string) => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomProvider({
  initialSnapshot,
  currentParticipant,
  viewerAuthId,
  children,
}: {
  initialSnapshot: RoomSnapshot
  currentParticipant: RoomParticipant
  viewerAuthId: string | null
  children: ReactNode
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [selectedLobbyId, selectLobby] = useState<string | null>(null)

  usePresence<RoomParticipant>(undefined, currentParticipant)

  const { presenceData } = usePresenceListener<RoomParticipant>()

  useChannel({}, "room-state-changed", ({ data }) => {
    setSnapshot(data as RoomSnapshot)
  })

  const participantsById = new Map<string, RoomParticipant>()

  for (const { clientId, data } of presenceData) {
    if (!clientId || !data) continue

    participantsById.set(clientId, {
      ...data,
      id: clientId,
    })
  }

  const presentParticipants = Array.from(participantsById.values())

  const activeLobby =
    snapshot.lobbies.find(({ id }) => id === selectedLobbyId) ??
    snapshot.lobbies[0] ??
    null

  const assignedParticipantIds = new Set(
    snapshot.lobbies.flatMap((lobby) =>
      lobby.players.map(({ player }) => player.id)
    )
  )

  const participantPool = presentParticipants.filter(
    ({ id }) => !assignedParticipantIds.has(id)
  )

  const isOwner = viewerAuthId !== null && snapshot.ownerAuthId === viewerAuthId

  return (
    <RoomContext.Provider
      value={{
        ...snapshot,
        isOwner,
        activeLobby,
        presentParticipants,
        participantPool,
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
