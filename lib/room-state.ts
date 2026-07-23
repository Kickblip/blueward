import "server-only"

import * as Ably from "ably"
import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { lobbies, lobbyPlayers, players, rooms } from "@/lib/schema"

export type RoomSnapshot = {
  roomId: string
  ownerAuthId: string
  lobbies: {
    id: string
    ordinal: number
    phase: "OPEN" | "DRAFTING" | "READY" | "CLOSED"
    draftPickIndex: number
    players: {
      player: {
        id: number
        bannerId: number
        riotIdGameName: string
        riotIdTagline: string
        avatarUrl: string | null
      }
      teamId: 0 | 1
      isCaptain: boolean
    }[]
  }[]
}

export async function getRoomSnapshot(
  roomId: string
): Promise<RoomSnapshot | null> {
  const [[room], roomLobbies, assignedPlayers] = await Promise.all([
    db
      .select({
        ownerAuthId: rooms.ownerAuthId,
      })
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1),

    db
      .select({
        id: lobbies.id,
        ordinal: lobbies.ordinal,
        phase: lobbies.phase,
        draftPickIndex: lobbies.draftPickIndex,
      })
      .from(lobbies)
      .where(eq(lobbies.roomId, roomId))
      .orderBy(asc(lobbies.ordinal)),

    db
      .select({
        lobbyId: lobbyPlayers.lobbyId,
        teamId: lobbyPlayers.teamId,
        isCaptain: lobbyPlayers.isCaptain,
        player: {
          id: players.id,
          bannerId: players.bannerId,
          riotIdGameName: players.riotIdGameName,
          riotIdTagline: players.riotIdTagline,
        },
      })
      .from(lobbyPlayers)
      .innerJoin(players, eq(lobbyPlayers.playerId, players.id))
      .where(eq(lobbyPlayers.roomId, roomId)),
  ])

  if (!room) return null

  return {
    roomId,
    ownerAuthId: room.ownerAuthId,
    lobbies: roomLobbies.map((lobby) => ({
      ...lobby,
      players: assignedPlayers
        .filter((assignment) => assignment.lobbyId === lobby.id)
        .map(({ player, teamId, isCaptain }) => ({
          player: {
            ...player,
            avatarUrl: null,
          },
          teamId: teamId as 0 | 1,
          isCaptain,
        })),
    })),
  }
}

const ably = new Ably.Rest({
  key: process.env.ABLY_TOKEN_ISSUER_KEY!,
})

export async function publishRoomSnapshot(roomId: string) {
  const snapshot = await getRoomSnapshot(roomId)

  if (!snapshot) {
    throw new Error("Room not found")
  }

  await ably.channels
    .get(`room:${roomId}`)
    .publish("room-state-changed", snapshot)

  return snapshot
}
