"use client"

import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react"
import { useChannel, usePresence, usePresenceListener } from "ably/react"
import type { RoomParticipant, RoomSnapshot } from "@/lib/room-state"

type ParticipantPreferences = Pick<RoomParticipant, "roles" | "rank">

type RoomContextValue = RoomSnapshot & {
  isOwner: boolean
  currentParticipant: RoomParticipant
  activeLobby: RoomSnapshot["lobbies"][number] | null
  presentParticipants: RoomParticipant[]
  participantPool: RoomParticipant[]
  selectLobby: (id: string) => void
  updateCurrentParticipant: (
    preferences: ParticipantPreferences
  ) => Promise<void>
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
  const [participant, setParticipant] = useState(currentParticipant)
  const participantRef = useRef(currentParticipant)

  const { updateStatus } = usePresence<RoomParticipant>(
    undefined,
    currentParticipant
  )

  async function updateCurrentParticipant(preferences: ParticipantPreferences) {
    const nextParticipant = {
      ...participantRef.current,
      ...preferences,
    }

    participantRef.current = nextParticipant
    setParticipant(nextParticipant)

    await updateStatus(nextParticipant)
  }

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

  participantsById.set(participant.id, participant)

  const presentParticipants = Array.from(participantsById.values())

  const lobbies = snapshot.lobbies.map((lobby) => ({
    ...lobby,
    players: lobby.players.map((assignment) => ({
      ...assignment,
      player: participantsById.get(assignment.player.id) ?? assignment.player,
    })),
  }))

  const activeLobby =
    lobbies.find(({ id }) => id === selectedLobbyId) ?? lobbies[0] ?? null

  const assignedParticipantIds = new Set(
    lobbies.flatMap((lobby) => lobby.players.map(({ player }) => player.id))
  )

  const participantPool = presentParticipants.filter(
    ({ id }) => !assignedParticipantIds.has(id)
  )

  const isOwner = viewerAuthId !== null && snapshot.ownerAuthId === viewerAuthId

  return (
    <RoomContext.Provider
      value={{
        ...snapshot,
        lobbies,
        isOwner,
        currentParticipant: participant,
        activeLobby,
        presentParticipants,
        participantPool,
        selectLobby,
        updateCurrentParticipant,
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
