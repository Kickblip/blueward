import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { RoomClient } from "./room-client"
import { notFound, redirect } from "next/navigation"
import { getGuestSession } from "@/lib/guest-session"
import { RoomEntryDialog } from "./room-entry-dialog"
import { randomUUID } from "node:crypto"
import { db } from "@/lib/db"
import { getRoomSnapshot, type RoomParticipant } from "@/lib/room-state"
import { roomParticipants } from "@/lib/schema"

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const [{ roomId }, user] = await Promise.all([params, currentUser()])
  const initialSnapshot = await getRoomSnapshot(roomId)

  if (!initialSnapshot) {
    notFound()
  }

  let identityKey: string
  let displayName: string
  let player: RoomParticipant["player"]

  if (user) {
    const playerCard = await fetchPlayerCardByPuuid(
      safeSubstring(user.privateMetadata.puuid, 0, 20)
    )

    if (!playerCard) {
      redirect("/")
    }

    identityKey = `clerk:${user.id}`
    displayName = playerCard.riotIdGameName
    player = {
      ...playerCard,
      avatarUrl: user.imageUrl,
    }
  } else {
    const guest = await getGuestSession()

    if (!guest) {
      return <RoomEntryDialog roomId={roomId} />
    }

    identityKey = `guest:${guest.id}`
    displayName = guest.displayName
    player = null
  }

  const playerId = player?.id ?? null

  const [{ id }] = await db
    .insert(roomParticipants)
    .values({
      id: randomUUID(),
      roomId,
      identityKey,
      displayName,
      playerId,
    })
    .onConflictDoUpdate({
      target: [roomParticipants.roomId, roomParticipants.identityKey],
      set: {
        displayName,
        playerId,
      },
    })
    .returning({ id: roomParticipants.id })

  const participant: RoomParticipant = {
    id,
    displayName,
    player,
    roles: player?.lobbyRoles ?? [],
    rank: player?.lobbyRank ?? null,
  }

  return (
    <RoomClient
      initialSnapshot={initialSnapshot}
      viewerAuthId={user?.id ?? null}
      participant={participant}
    />
  )
}
