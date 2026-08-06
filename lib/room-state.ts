"use server"

import { createClient } from "@supabase/supabase-js"
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

const supabasePublisher = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

export async function publishRoomSnapshot(roomId: string) {
  const snapshot = await getRoomSnapshot(roomId)

  if (!snapshot) {
    throw new Error("Room not found")
  }

  const channel = supabasePublisher.channel(`room:${roomId}`, {
    config: {
      private: true,
    },
  })

  try {
    const result = await channel.httpSend("room-state-changed", snapshot)

    if (!result.success) {
      throw new Error(`Could not publish room snapshot: ${result.error}`)
    }
  } finally {
    await supabasePublisher.removeChannel(channel)
  }

  return snapshot
}
