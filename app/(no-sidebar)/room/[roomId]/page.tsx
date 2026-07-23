import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { RoomClient } from "./room-client"

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const [{ roomId }, user] = await Promise.all([params, currentUser()])

  if (!user)
    redirect(`/signin?redirect_url=${encodeURIComponent(`/room/${roomId}`)}`)

  const playerCard = await fetchPlayerCardByPuuid(
    safeSubstring(user.privateMetadata.puuid, 0, 20)
  )

  if (!playerCard) {
    redirect("/")
  }

  return (
    <RoomClient
      roomId={roomId}
      player={{
        ...playerCard,
        avatarUrl: user.imageUrl,
      }}
    />
  )
}
