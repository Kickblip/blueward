"use server"

import { and, count, eq, isNull, max, ne } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import {
  lobbies,
  lobbyPlayers,
  players,
  rankEnum,
  roleEnum,
  roomParticipants,
  rooms,
} from "@/lib/schema"
import { publishRoomSnapshot, type RoomParticipant } from "@/lib/room-state"
import { randomUUID } from "node:crypto"
import * as z from "zod"
import { redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { DRAFT_PICK_ORDER } from "@/lib/draft"
import {
  getGuestSession,
  guestDisplayNameSchema,
  saveGuestSession,
} from "@/lib/guest-session"

const continueAsGuestSchema = z.object({
  roomId: z.uuid("Invalid room"),
  displayName: guestDisplayNameSchema,
})

const lobbyParticipantSchema = z.object({
  lobbyId: z.uuid(),
  participantId: z.uuid(),
})

const draftPickAdjustmentSchema = z.object({
  lobbyId: z.uuid(),
  direction: z.union([z.literal(-1), z.literal(1)]),
})

const lobbyRoleSchema = z.enum(roleEnum.enumValues).exclude(["FILL"])
const lobbyRankSchema = z.enum(rankEnum.enumValues)

const lobbyPreferencesSchema = z.object({
  roomId: z.uuid(),
  roles: z
    .array(lobbyRoleSchema)
    .max(5)
    .refine((roles) => new Set(roles).size === roles.length, {
      message: "Roles must be unique",
    }),
  rank: lobbyRankSchema.nullable(),
})

type ContinueAsGuestState = {
  error?: string
}

export async function continueAsGuest(
  _previousState: ContinueAsGuestState,
  formData: FormData
): Promise<ContinueAsGuestState> {
  const result = continueAsGuestSchema.safeParse({
    roomId: formData.get("roomId"),
    displayName: formData.get("displayName"),
  })

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Invalid guest information",
    }
  }

  const { roomId, displayName } = result.data
  const { userId } = await auth()

  if (userId) {
    redirect(`/room/${roomId}`)
  }

  const [room] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1)

  if (!room) {
    return { error: "This room no longer exists" }
  }

  await saveGuestSession(displayName)

  redirect(`/room/${roomId}`)
}

export async function saveLobbyPreferences(
  roomId: string,
  preferences: Pick<RoomParticipant, "roles" | "rank">
) {
  const result = lobbyPreferencesSchema.safeParse({
    roomId,
    ...preferences,
  })

  if (!result.success) {
    throw new Error("Invalid lobby preferences")
  }

  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const [participant] = await db
    .select({
      playerId: players.id,
      puuid: players.puuid,
    })
    .from(roomParticipants)
    .innerJoin(players, eq(players.id, roomParticipants.playerId))
    .where(
      and(
        eq(roomParticipants.roomId, result.data.roomId),
        eq(roomParticipants.identityKey, `clerk:${userId}`),
        eq(players.authId, userId)
      )
    )
    .limit(1)

  if (!participant) {
    throw new Error("Player is not a participant in this room")
  }

  await db
    .update(players)
    .set({
      lobbyRoles: result.data.roles,
      lobbyRank: result.data.rank,
    })
    .where(eq(players.id, participant.playerId))

  updateTag(`player-card:${participant.puuid.slice(0, 20)}`)

  await publishRoomSnapshot(result.data.roomId)
}

export async function moveParticipantToTeam(
  lobbyId: string,
  participantId: string,
  teamId: 0 | 1
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const result = lobbyParticipantSchema.safeParse({
    lobbyId,
    participantId,
  })

  if (!result.success || (teamId !== 0 && teamId !== 1)) {
    throw new Error("Invalid move")
  }

  const [target] = await db
    .select({ roomId: lobbies.roomId })
    .from(lobbies)
    .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
    .innerJoin(
      roomParticipants,
      and(
        eq(roomParticipants.id, participantId),
        eq(roomParticipants.roomId, lobbies.roomId)
      )
    )
    .where(and(eq(lobbies.id, lobbyId), eq(rooms.ownerAuthId, userId)))
    .limit(1)

  if (!target) {
    throw new Error("Lobby, participant, or permission not found")
  }

  const [{ teamSize }] = await db
    .select({ teamSize: count() })
    .from(lobbyPlayers)
    .where(
      and(
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.teamId, teamId),
        ne(lobbyPlayers.participantId, participantId)
      )
    )

  if (teamSize >= 5) {
    throw new Error("Team is full")
  }

  await db
    .insert(lobbyPlayers)
    .values({
      lobbyId,
      participantId,
      teamId,
    })
    .onConflictDoUpdate({
      target: lobbyPlayers.participantId,
      set: {
        lobbyId,
        teamId,
      },
    })

  await publishRoomSnapshot(target.roomId)
}

export async function makeParticipantCaptain(
  lobbyId: string,
  participantId: string
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const result = lobbyParticipantSchema.safeParse({
    lobbyId,
    participantId,
  })

  if (!result.success) {
    throw new Error("Invalid participant")
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
        eq(lobbyPlayers.participantId, participantId),
        eq(rooms.ownerAuthId, userId)
      )
    )
    .limit(1)

  if (!assignment) {
    throw new Error("Participant not found or unauthorized")
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
          eq(lobbyPlayers.participantId, participantId)
        )
      )
  })

  await publishRoomSnapshot(assignment.roomId)
}

export async function demoteParticipantCaptain(
  lobbyId: string,
  participantId: string
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const result = lobbyParticipantSchema.safeParse({
    lobbyId,
    participantId,
  })

  if (!result.success) {
    throw new Error("Invalid participant")
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
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.participantId, participantId),
        eq(lobbyPlayers.isCaptain, true)
      )
    )

  await publishRoomSnapshot(lobby.roomId)
}

export async function returnParticipantToPool(
  lobbyId: string,
  participantId: string
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const result = lobbyParticipantSchema.safeParse({
    lobbyId,
    participantId,
  })

  if (!result.success) {
    throw new Error("Invalid participant")
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
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.participantId, participantId)
      )
    )

  await publishRoomSnapshot(lobby.roomId)
}

export async function draftParticipant(lobbyId: string, participantId: string) {
  const result = lobbyParticipantSchema.safeParse({
    lobbyId,
    participantId,
  })

  if (!result.success) {
    throw new Error("Invalid draft pick")
  }

  const { userId } = await auth()
  const guest = userId ? null : await getGuestSession()

  const identityKey = userId
    ? `clerk:${userId}`
    : guest
      ? `guest:${guest.id}`
      : null

  if (!identityKey) {
    throw new Error("Unauthorized")
  }

  const roomId = await db.transaction(async (tx) => {
    const [lobby] = await tx
      .select({
        roomId: lobbies.roomId,
        phase: lobbies.phase,
        draftPickIndex: lobbies.draftPickIndex,
      })
      .from(lobbies)
      .where(eq(lobbies.id, result.data.lobbyId))
      .limit(1)
      .for("update")

    if (!lobby || lobby.phase !== "DRAFTING") {
      throw new Error("Lobby is not drafting")
    }

    const pickingTeam = DRAFT_PICK_ORDER[lobby.draftPickIndex]

    if (pickingTeam === undefined) {
      throw new Error("Draft is already complete")
    }

    const [captain] = await tx
      .select({ id: roomParticipants.id })
      .from(lobbyPlayers)
      .innerJoin(
        roomParticipants,
        and(
          eq(roomParticipants.id, lobbyPlayers.participantId),
          eq(roomParticipants.roomId, lobby.roomId)
        )
      )
      .where(
        and(
          eq(lobbyPlayers.lobbyId, result.data.lobbyId),
          eq(lobbyPlayers.teamId, pickingTeam),
          eq(lobbyPlayers.isCaptain, true),
          eq(roomParticipants.identityKey, identityKey)
        )
      )
      .limit(1)

    if (!captain) {
      throw new Error("It is not your turn to pick")
    }

    const [target] = await tx
      .select({ id: roomParticipants.id })
      .from(roomParticipants)
      .leftJoin(
        lobbyPlayers,
        eq(lobbyPlayers.participantId, roomParticipants.id)
      )
      .where(
        and(
          eq(roomParticipants.id, result.data.participantId),
          eq(roomParticipants.roomId, lobby.roomId),
          isNull(lobbyPlayers.participantId)
        )
      )
      .limit(1)

    if (!target) {
      throw new Error("Player is not available")
    }

    const [{ teamSize }] = await tx
      .select({ teamSize: count() })
      .from(lobbyPlayers)
      .where(
        and(
          eq(lobbyPlayers.lobbyId, result.data.lobbyId),
          eq(lobbyPlayers.teamId, pickingTeam)
        )
      )

    if (teamSize >= 5) {
      throw new Error("Team is full")
    }

    await tx.insert(lobbyPlayers).values({
      lobbyId: result.data.lobbyId,
      participantId: target.id,
      teamId: pickingTeam,
    })

    const nextPickIndex = lobby.draftPickIndex + 1

    await tx
      .update(lobbies)
      .set({
        draftPickIndex: nextPickIndex,
        phase: nextPickIndex === DRAFT_PICK_ORDER.length ? "READY" : "DRAFTING",
      })
      .where(eq(lobbies.id, result.data.lobbyId))

    return lobby.roomId
  })

  await publishRoomSnapshot(roomId)
}

export async function adjustDraftPickIndex(lobbyId: string, direction: -1 | 1) {
  const result = draftPickAdjustmentSchema.safeParse({
    lobbyId,
    direction,
  })

  if (!result.success) {
    throw new Error("Invalid draft adjustment")
  }

  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const adjustment = await db.transaction(async (tx) => {
    const [lobby] = await tx
      .select({
        roomId: lobbies.roomId,
        draftPickIndex: lobbies.draftPickIndex,
      })
      .from(lobbies)
      .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
      .where(
        and(
          eq(lobbies.id, result.data.lobbyId),
          eq(lobbies.phase, "DRAFTING"),
          eq(rooms.ownerAuthId, userId)
        )
      )
      .limit(1)
      .for("update")

    if (!lobby) {
      throw new Error("Draft not found or unauthorized")
    }

    const draftPickIndex = Math.max(
      0,
      Math.min(
        DRAFT_PICK_ORDER.length - 1,
        lobby.draftPickIndex + result.data.direction
      )
    )

    if (draftPickIndex === lobby.draftPickIndex) {
      return {
        roomId: lobby.roomId,
        changed: false,
      }
    }

    await tx
      .update(lobbies)
      .set({ draftPickIndex })
      .where(eq(lobbies.id, result.data.lobbyId))

    return {
      roomId: lobby.roomId,
      changed: true,
    }
  })

  if (adjustment.changed) {
    await publishRoomSnapshot(adjustment.roomId)
  }
}

export async function startDraft(lobbyId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!lobbyId) {
    throw new Error("Invalid lobby")
  }

  const [lobby] = await db
    .select({
      roomId: lobbies.roomId,
      phase: lobbies.phase,
    })
    .from(lobbies)
    .innerJoin(rooms, eq(rooms.id, lobbies.roomId))
    .where(and(eq(lobbies.id, lobbyId), eq(rooms.ownerAuthId, userId)))
    .limit(1)

  if (!lobby) {
    throw new Error("Lobby not found or unauthorized")
  }

  if (lobby.phase !== "OPEN") {
    throw new Error("Draft has already started")
  }

  const assignments = await db
    .select({
      teamId: lobbyPlayers.teamId,
      isCaptain: lobbyPlayers.isCaptain,
    })
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId))

  const hasTeam0Captain = assignments.some(
    ({ teamId, isCaptain }) => teamId === 0 && isCaptain
  )

  const hasTeam1Captain = assignments.some(
    ({ teamId, isCaptain }) => teamId === 1 && isCaptain
  )

  if (assignments.length !== 2 || !hasTeam0Captain || !hasTeam1Captain) {
    throw new Error("Draft must start with exactly two captains")
  }

  const [startedLobby] = await db
    .update(lobbies)
    .set({
      phase: "DRAFTING",
      draftPickIndex: 0,
    })
    .where(and(eq(lobbies.id, lobbyId), eq(lobbies.phase, "OPEN")))
    .returning({ id: lobbies.id })

  if (!startedLobby) {
    throw new Error("Draft has already started")
  }

  await publishRoomSnapshot(lobby.roomId)
}

export async function createLobby(roomId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!roomId) {
    throw new Error("Invalid room")
  }

  const lobbyId = randomUUID()

  await db.transaction(async (tx) => {
    // Serialize lobby creation within this room.
    const [room] = await tx
      .select({ id: rooms.id })
      .from(rooms)
      .where(and(eq(rooms.id, roomId), eq(rooms.ownerAuthId, userId)))
      .limit(1)
      .for("update")

    if (!room) {
      throw new Error("Room not found or unauthorized")
    }

    const [{ lastOrdinal }] = await tx
      .select({ lastOrdinal: max(lobbies.ordinal) })
      .from(lobbies)
      .where(eq(lobbies.roomId, roomId))

    await tx.insert(lobbies).values({
      id: lobbyId,
      roomId,
      ordinal: (lastOrdinal ?? 0) + 1,
    })
  })

  await publishRoomSnapshot(roomId)

  return lobbyId
}
