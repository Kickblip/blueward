"use server"

import * as Ably from "ably"
import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  lobbies,
  lobbyPlayers,
  players,
  roomParticipants,
  rooms,
} from "@/lib/schema"
import {
  fetchPlayerCardByPuuid,
  type PlayerCard,
} from "@/app/api/player/[puuid]/card/route"
import { safeSubstring } from "./utils"

export type RoomParticipant = {
  id: string
  displayName: string
  player: PlayerCard | null
  roles: NonNullable<PlayerCard["lobbyRoles"]>
  rank: PlayerCard["lobbyRank"]
}

export type RoomSnapshot = {
  roomId: string
  ownerAuthId: string
  lobbies: {
    id: string
    ordinal: number
    phase: "OPEN" | "DRAFTING" | "READY" | "CLOSED"
    draftPickIndex: number
    players: {
      player: RoomParticipant
      teamId: 0 | 1
      isCaptain: boolean
    }[]
  }[]
}

export async function getRoomSnapshot(
  roomId: string
): Promise<RoomSnapshot | null> {
  const [[room], roomLobbies, assignedParticipants] = await Promise.all([
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

        participantId: roomParticipants.id,
        displayName: roomParticipants.displayName,

        playerPuuid: players.puuid,
      })
      .from(lobbyPlayers)
      .innerJoin(
        roomParticipants,
        eq(lobbyPlayers.participantId, roomParticipants.id)
      )
      .leftJoin(players, eq(roomParticipants.playerId, players.id))
      .where(eq(roomParticipants.roomId, roomId)),
  ])

  if (!room) return null

  const hydratedAssignments = await Promise.all(
    assignedParticipants.map(
      async ({ participantId, displayName, playerPuuid, ...assignment }) => {
        const player =
          playerPuuid === null
            ? null
            : await fetchPlayerCardByPuuid(safeSubstring(playerPuuid, 0, 20))

        if (playerPuuid !== null && !player) {
          throw new Error(`Assigned Riot player ${playerPuuid} not found`)
        }

        return {
          ...assignment,
          player: {
            id: participantId,
            displayName,
            player,
            roles: player?.lobbyRoles ?? [],
            rank: player?.lobbyRank ?? null,
          },
        }
      }
    )
  )

  return {
    roomId,
    ownerAuthId: room.ownerAuthId,
    lobbies: roomLobbies.map((lobby) => ({
      ...lobby,
      players: hydratedAssignments
        .filter(({ lobbyId }) => lobbyId === lobby.id)
        .map(({ player, teamId, isCaptain }) => ({
          player,
          teamId: teamId as 0 | 1,
          isCaptain,
        })),
    })),
  }
}

const ably = new Ably.Rest({
  key: process.env.ABLY_PUBLISH_KEY!,
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
