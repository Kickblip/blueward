"use server"

import { and, count, eq, max, ne } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { lobbies, lobbyPlayers, roomParticipants, rooms } from "@/lib/schema"
import { publishRoomSnapshot } from "@/lib/room-state"
import { randomUUID } from "node:crypto"
import * as z from "zod"
import { redirect } from "next/navigation"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"

const continueAsGuestSchema = z.object({
  roomId: z.uuid("Invalid room"),
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name")
    .max(32, "Display name must be 32 characters or fewer"),
})

const lobbyParticipantSchema = z.object({
  lobbyId: z.uuid(),
  participantId: z.uuid(),
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
  const { userId: clerkUserId } = await auth()

  // Clerk always takes precedence over a leftover anonymous session.
  if (clerkUserId) {
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

  const supabase = await createSupabaseClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims

  let guestUserId: string

  if (claims) {
    if (claims.is_anonymous !== true) {
      return { error: "The current Supabase session is not anonymous" }
    }

    guestUserId = claims.sub
  } else {
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error || !data.user) {
      console.error("Anonymous sign-in failed", error)
      return { error: "Could not create a guest session" }
    }

    guestUserId = data.user.id
  }

  await db
    .insert(roomParticipants)
    .values({
      id: randomUUID(),
      roomId,
      identityKey: `supabase:${guestUserId}`,
      displayName,
      playerId: null,
    })
    .onConflictDoUpdate({
      target: [roomParticipants.roomId, roomParticipants.identityKey],
      set: {
        displayName,
        playerId: null,
      },
    })

  redirect(`/room/${roomId}`)
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

  const captains = await db
    .select({ teamId: lobbyPlayers.teamId })
    .from(lobbyPlayers)
    .where(
      and(eq(lobbyPlayers.lobbyId, lobbyId), eq(lobbyPlayers.isCaptain, true))
    )

  const hasTeam0Captain = captains.some(({ teamId }) => teamId === 0)
  const hasTeam1Captain = captains.some(({ teamId }) => teamId === 1)

  if (!hasTeam0Captain || !hasTeam1Captain) {
    throw new Error("Both teams require a captain")
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
