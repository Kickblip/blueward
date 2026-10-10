"use server"

import { randomUUID } from "node:crypto"
import { auth, currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import * as z from "zod"
import { db } from "@/lib/db"
import {
  getGuestSession,
  guestDisplayNameSchema,
  saveGuestSession,
} from "@/lib/guest-session"
import type { RoomParticipant } from "@/lib/room-types"
import { players } from "@/lib/schema"
import { callRoomService, spacetimeRoomExists } from "@/lib/spacetime/server"

const continueAsGuestSchema = z.object({
  roomId: z.uuid("Invalid room").toLowerCase(),
  displayName: guestDisplayNameSchema,
})

const roomTicketSchema = z.object({
  roomId: z.uuid().toLowerCase(),
  clientIdentity: z.string().regex(/^[0-9a-f]{64}$/),
  refresh: z.boolean(),
  expectedAuthId: z.string().nullable(),
})

type ContinueAsGuestState = { error?: string }

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

  if (userId) redirect(`/room/${roomId}`)

  if (!(await spacetimeRoomExists(roomId)))
    return { error: "This room no longer exists" }

  await saveGuestSession(displayName)
  redirect(`/room/${roomId}`)
}

export async function issueRoomTicket(
  roomId: string,
  clientIdentity: string,
  refresh: boolean,
  expectedAuthId: string | null
): Promise<{ ticket: string }> {
  const input = roomTicketSchema.parse({
    roomId,
    clientIdentity,
    refresh,
    expectedAuthId,
  })
  const user = await currentUser()
  if ((user?.id ?? null) !== input.expectedAuthId)
    throw new Error("Your sign-in changed. Reload the room")
  let identityKey: string
  let displayName: string
  let profile: RoomParticipant["player"] = null
  let expiresAtMs = Date.now() + 10 * 60 * 1000

  if (user) {
    const [player] = await db
      .select({
        id: players.id,
        puuid: players.puuid,
        riotIdGameName: players.riotIdGameName,
        riotIdTagline: players.riotIdTagline,
        experience: players.experience,
        bannerId: players.bannerId,
      })
      .from(players)
      .where(eq(players.authId, user.id))
      .limit(1)

    if (!player)
      redirect(
        `/claim-riot?next=${encodeURIComponent(`/room/${input.roomId}`)}`
      )

    identityKey = `clerk:${user.id}`
    displayName = player.riotIdGameName
    profile = {
      ...player,
      avatarUrl: z
        .url({ protocol: /^https$/ })
        .max(2048)
        .parse(user.imageUrl),
    }
  } else {
    const guest = await getGuestSession()
    if (!guest)
      throw new Error("Your guest session expired. Join the room again")

    identityKey = `guest:${guest.id}`
    displayName = guest.displayName
    expiresAtMs = Math.min(expiresAtMs, guest.expiresAt)
  }

  const ticket = randomUUID()
  await callRoomService("issue_ticket", {
    ...input,
    ticket,
    identityKey,
    displayName,
    profileJson: profile ? JSON.stringify(profile) : null,
    expiresAtMs,
  })
  return { ticket }
}
