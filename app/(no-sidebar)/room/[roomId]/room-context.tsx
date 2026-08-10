"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
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
  supabase,
  initialSnapshot,
  currentParticipant,
  viewerAuthId,
  children,
}: {
  supabase: SupabaseClient
  initialSnapshot: RoomSnapshot
  currentParticipant: RoomParticipant
  viewerAuthId: string | null
  children: ReactNode
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [selectedLobbyId, selectLobby] = useState<string | null>(null)
  const [presentParticipants, setPresentParticipants] = useState<
    RoomParticipant[]
  >([])

  useEffect(() => {
    let disposed = false

    const channel = supabase.channel(`room:${initialSnapshot.roomId}`, {
      config: {
        private: true,
        presence: {
          enabled: true,
          key: currentParticipant.id,
        },
      },
    })

    channel
      .on<RoomSnapshot>(
        "broadcast",
        { event: "room-state-changed" },
        ({ payload }) => setSnapshot(payload)
      )
      .on("presence", { event: "sync" }, () => {
        setPresentParticipants(
          Object.values(channel.presenceState<RoomParticipant>()).flatMap(
            (presences) => presences.slice(-1)
          )
        )
      })

    async function connect() {
      // Ensures either the Supabase anonymous JWT or Clerk JWT is installed
      // on the Realtime connection before joining the private channel.
      await supabase.realtime.setAuth()

      if (disposed) return

      channel.subscribe(async (status, error) => {
        if (disposed) return

        if (status === "SUBSCRIBED") {
          const trackStatus = await channel.track(currentParticipant)

          if (trackStatus !== "ok") {
            console.error("Could not track room presence:", trackStatus)
          }

          return
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setPresentParticipants([])
          console.error("Room Realtime connection failed:", error ?? status)
        }
      })
    }

    void connect().catch((error) => {
      if (!disposed) {
        console.error("Could not authenticate room Realtime:", error)
      }
    })

    return () => {
      disposed = true
      void supabase.removeChannel(channel)
    }
  }, [currentParticipant, initialSnapshot.roomId, supabase])

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
