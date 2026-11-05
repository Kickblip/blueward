"use server"

import { randomUUID } from "node:crypto"
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import * as z from "zod"
import {
  getGuestSession,
  guestDisplayNameSchema,
  saveGuestSession,
} from "@/lib/guest-session"
import type { RoomParticipant } from "@/lib/room-types"
import {
  callRoomService,
  getSpacetimeRoom,
  spacetimeRoomBanned,
} from "@/lib/spacetime/server"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { safeSubstring } from "@/lib/utils"

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

  const room = await getSpacetimeRoom(roomId)

  if (!room) return { error: "This room no longer exists" }

  if (room.forceSignIn) return { error: "Sign in to join this room" }

  await saveGuestSession(displayName)
  redirect(`/room/${roomId}`)
}

export async function issueRoomTicket(
  roomId: string,
  clientIdentity: string,
  refresh: boolean,
  expectedAuthId: string | null
): Promise<{ ticket: string } | { error: string }> {
  const input = roomTicketSchema.parse({
    roomId,
    clientIdentity,
    refresh,
    expectedAuthId,
  })
  const user = await currentUser()

  if ((user?.id ?? null) !== input.expectedAuthId)
    return { error: "Your sign-in changed. Reload the room" }

  const room = await getSpacetimeRoom(input.roomId)

  if (!room) return { error: "This room no longer exists" }

  if (room.forceSignIn && !user) return { error: "Sign in to join this room" }

  if (user && (await spacetimeRoomBanned(input.roomId, user.id)))
    return { error: "You are banned from this room" }

  let identityKey: string
  let displayName: string
  let profile: RoomParticipant["player"] = null
  let expiresAtMs = Date.now() + 10 * 60 * 1000

  if (user) {
    const puuid = user.privateMetadata.puuid

    const player =
      typeof puuid === "string"
        ? await fetchPlayerCardByPuuid(safeSubstring(puuid, 0, 20))
        : null

    if (!player || player.authId !== user.id)
      redirect(
        `/claim-riot?next=${encodeURIComponent(`/room/${input.roomId}`)}`
      )

    const playerClubs = player.clubMemberships
      .map(({ club }) => club)
      .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
      .slice(0, 3)
      .map(({ tag, iconId, name }) => ({ tag, iconId, name }))

    identityKey = `clerk:${user.id}`
    displayName = player.riotIdGameName
    profile = {
      id: player.id,
      puuid: player.puuid,
      riotIdGameName: player.riotIdGameName,
      riotIdTagline: player.riotIdTagline,
      experience: player.experience,
      bannerId: player.bannerId,
      clubs: playerClubs,
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
