"use server"

import { and, count, eq, ne } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { lobbies, lobbyPlayers, rooms } from "@/lib/schema"
import { publishRoomSnapshot } from "@/lib/room-state"

export async function movePlayerToTeam(
  lobbyId: string,
  playerId: number,
  teamId: 0 | 1
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (
    !lobbyId ||
    !Number.isInteger(playerId) ||
    playerId < 1 ||
    (teamId !== 0 && teamId !== 1)
  ) {
    throw new Error("Invalid move")
  }

  const [lobby] = await db
    .select({ roomId: lobbies.roomId })
    .from(lobbies)
    .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
    .where(and(eq(lobbies.id, lobbyId), eq(rooms.ownerAuthId, userId)))
    .limit(1)

  if (!lobby) {
    throw new Error("Lobby not found or unauthorized")
  }

  const [{ teamSize }] = await db
    .select({ teamSize: count() })
    .from(lobbyPlayers)
    .where(
      and(
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.teamId, teamId),
        ne(lobbyPlayers.playerId, playerId)
      )
    )

  if (teamSize >= 5) {
    throw new Error("Team is full")
  }

  await db
    .insert(lobbyPlayers)
    .values({
      roomId: lobby.roomId,
      lobbyId,
      playerId,
      teamId,
    })
    .onConflictDoUpdate({
      target: [lobbyPlayers.roomId, lobbyPlayers.playerId],
      set: {
        lobbyId,
        teamId,
      },
    })

  await publishRoomSnapshot(lobby.roomId)
}

export async function makePlayerCaptain(lobbyId: string, playerId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!lobbyId || !Number.isInteger(playerId) || playerId < 1) {
    throw new Error("Invalid player")
  }

  const [assignment] = await db
    .select({
      roomId: lobbies.roomId,
      teamId: lobbyPlayers.teamId,
    })
    .from(lobbyPlayers)
    .innerJoin(lobbies, eq(lobbies.id, lobbyPlayers.lobbyId))
    .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
    .where(
      and(
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.playerId, playerId),
        eq(rooms.ownerAuthId, userId)
      )
    )
    .limit(1)

  if (!assignment) {
    throw new Error("Player not found or unauthorized")
  }

  await db.transaction(async (tx) => {
    // Replace the current captain for this team.
    await tx
      .update(lobbyPlayers)
      .set({ isCaptain: false })
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobbyId),
          eq(lobbyPlayers.teamId, assignment.teamId),
          eq(lobbyPlayers.isCaptain, true)
        )
      )

    await tx
      .update(lobbyPlayers)
      .set({ isCaptain: true })
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobbyId),
          eq(lobbyPlayers.playerId, playerId)
        )
      )
  })

  await publishRoomSnapshot(assignment.roomId)
}

export async function demotePlayerCaptain(lobbyId: string, playerId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!lobbyId || !Number.isInteger(playerId) || playerId < 1) {
    throw new Error("Invalid player")
  }

  const [lobby] = await db
    .select({ roomId: lobbies.roomId })
    .from(lobbies)
    .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
    .where(and(eq(lobbies.id, lobbyId), eq(rooms.ownerAuthId, userId)))
    .limit(1)

  if (!lobby) {
    throw new Error("Lobby not found or unauthorized")
  }

  await db
    .update(lobbyPlayers)
    .set({ isCaptain: false })
    .where(
      and(
        eq(lobbyPlayers.roomId, lobby.roomId),
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.playerId, playerId),
        eq(lobbyPlayers.isCaptain, true)
      )
    )

  await publishRoomSnapshot(lobby.roomId)
}

export async function returnPlayerToPool(lobbyId: string, playerId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!lobbyId || !Number.isInteger(playerId) || playerId < 1) {
    throw new Error("Invalid player")
  }

  const [lobby] = await db
    .select({ roomId: lobbies.roomId })
    .from(lobbies)
    .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
    .where(and(eq(lobbies.id, lobbyId), eq(rooms.ownerAuthId, userId)))
    .limit(1)

  if (!lobby) {
    throw new Error("Lobby not found or unauthorized")
  }

  await db
    .delete(lobbyPlayers)
    .where(
      and(
        eq(lobbyPlayers.roomId, lobby.roomId),
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.playerId, playerId)
      )
    )

  await publishRoomSnapshot(lobby.roomId)
}
