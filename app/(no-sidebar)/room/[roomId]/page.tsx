import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { RoomClient } from "./room-client"
import { notFound, redirect } from "next/navigation"
import { getRoomSnapshot } from "@/lib/room-state"

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const [{ roomId }, user] = await Promise.all([params, currentUser()])

  if (!user)
    redirect(`/signin?redirect_url=${encodeURIComponent(`/room/${roomId}`)}`)

  const [playerCard, initialSnapshot] = await Promise.all([
    fetchPlayerCardByPuuid(safeSubstring(user.privateMetadata.puuid, 0, 20)),
    getRoomSnapshot(roomId),
  ])

  if (!playerCard) {
    redirect("/")
  }

  if (!initialSnapshot) {
    notFound()
  }

  return (
    <RoomClient
      initialSnapshot={initialSnapshot}
      viewerAuthId={user.id}
      player={{
        ...playerCard,
        avatarUrl: user.imageUrl,
      }}
    />
  )
}
