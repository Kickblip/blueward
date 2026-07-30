"use server"

import { and, count, eq } from "drizzle-orm"
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
      and(eq(lobbyPlayers.lobbyId, lobbyId), eq(lobbyPlayers.teamId, teamId))
    )

  if (teamSize >= 5) {
    throw new Error("Team is full")
  }

  await db.insert(lobbyPlayers).values({
    roomId: lobby.roomId,
    lobbyId,
    playerId,
    teamId,
  })

  await publishRoomSnapshot(lobby.roomId)
}
