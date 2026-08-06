import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { RoomClient } from "./room-client"
import { notFound, redirect } from "next/navigation"
import { RoomEntryDialog } from "./room-entry-dialog"
import { randomUUID } from "node:crypto"
import { db } from "@/lib/db"
import { getRoomSnapshot, type RoomParticipant } from "@/lib/room-state"
import { roomParticipants } from "@/lib/schema"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { and, eq } from "drizzle-orm"

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const [{ roomId }, clerkUser] = await Promise.all([params, currentUser()])

  const initialSnapshot = await getRoomSnapshot(roomId)

  if (!initialSnapshot) {
    notFound()
  }

  let participant: RoomParticipant
  let viewerAuthId: string | null = null

  if (clerkUser) {
    const playerCard = await fetchPlayerCardByPuuid(
      safeSubstring(clerkUser.privateMetadata.puuid, 0, 20)
    )

    if (!playerCard) {
      redirect("/")
    }

    const displayName = playerCard.riotIdGameName

    const [{ id }] = await db
      .insert(roomParticipants)
      .values({
        id: randomUUID(),
        roomId,
        identityKey: `clerk:${clerkUser.id}`,
        displayName,
        playerId: playerCard.id,
      })
      .onConflictDoUpdate({
        target: [roomParticipants.roomId, roomParticipants.identityKey],
        set: {
          displayName,
          playerId: playerCard.id,
        },
      })
      .returning({ id: roomParticipants.id })

    participant = {
      id,
      displayName,
      player: {
        ...playerCard,
        avatarUrl: clerkUser.imageUrl,
      },
    }

    viewerAuthId = clerkUser.id
  } else {
    const supabase = await createSupabaseClient()
    const { data, error } = await supabase.auth.getClaims()
    const claims = data?.claims

    if (
      error ||
      !claims ||
      claims.is_anonymous !== true ||
      typeof claims.sub !== "string"
    ) {
      return <RoomEntryDialog roomId={roomId} />
    }

    const [guestParticipant] = await db
      .select({
        id: roomParticipants.id,
        displayName: roomParticipants.displayName,
      })
      .from(roomParticipants)
      .where(
        and(
          eq(roomParticipants.roomId, roomId),
          eq(roomParticipants.identityKey, `supabase:${claims.sub}`)
        )
      )
      .limit(1)

    if (!guestParticipant) {
      return <RoomEntryDialog roomId={roomId} />
    }

    participant = {
      id: guestParticipant.id,
      displayName: guestParticipant.displayName,
      player: null,
    }
  }

  return (
    <RoomClient
      initialSnapshot={initialSnapshot}
      viewerAuthId={viewerAuthId}
      participant={participant}
    />
  )
}
