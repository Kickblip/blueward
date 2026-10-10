"use client"

import { createContext, useContext } from "react"
import type { DbConnection } from "@/lib/spacetime/module_bindings"
import type { RoomParticipant, RoomSnapshot } from "@/lib/room-types"

export type RoomContextValue = RoomSnapshot & {
  isOwner: boolean
  currentParticipant: RoomParticipant
  activeLobby: RoomSnapshot["lobbies"][number] | null
  presentParticipants: RoomParticipant[]
  participantPool: RoomParticipant[]
  selectLobby: (id: string) => void
  actions: DbConnection["reducers"]
}

export const RoomContext = createContext<RoomContextValue | null>(null)

export function useRoom() {
  const room = useContext(RoomContext)
  if (!room) throw new Error("useRoom must be used inside RoomProvider")
  return room
}
