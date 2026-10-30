import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import * as z from "zod"
import { getGuestSession } from "@/lib/guest-session"
import { getSpacetimeRoom, spacetimeRoomBanned } from "@/lib/spacetime/server"
import { ErrorMessage } from "@/components/error-message"
import { RoomClient } from "./room-client"
import { RoomEntryDialog } from "./room-entry-dialog"

const title = "Join Lobby | BLUEWARD"

export const metadata: Metadata = {
  title,
  openGraph: {
    title,
    images: ["/og-image-room.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    images: ["/og-image-room.jpg"],
  },
}

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const parsed = z.uuid().safeParse((await params).roomId)
  if (!parsed.success) notFound()

  const roomId = parsed.data.toLowerCase()
  const room = await getSpacetimeRoom(roomId)

  if (!room) notFound()

  const user = await currentUser()

  if (user && (await spacetimeRoomBanned(roomId, user.id)))
    return <ErrorMessage message="You are banned from this room" />

  if (!user && (room.forceSignIn || !(await getGuestSession()))) {
    return <RoomEntryDialog roomId={roomId} forceSignIn={room.forceSignIn} />
  }

  return <RoomClient roomId={roomId} viewerAuthId={user?.id ?? null} />
}
