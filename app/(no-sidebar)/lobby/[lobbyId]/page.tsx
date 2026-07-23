import { safeSubstring } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"
import { LobbyClient } from "./lobby-client"

export default async function Page({
  params,
}: {
  params: Promise<{ lobbyId: string }>
}) {
  const [{ lobbyId }, user] = await Promise.all([params, currentUser()])

  if (!user)
    redirect(`/signin?redirect_url=${encodeURIComponent(`/lobby/${lobbyId}`)}`)

  const playerCard = await fetchPlayerCardByPuuid(
    safeSubstring(user.privateMetadata.puuid, 0, 20)
  )

  if (!playerCard) {
    redirect("/")
  }

  return (
    <LobbyClient
      lobbyId={lobbyId}
      player={{
        ...playerCard,
        avatarUrl: user.imageUrl,
      }}
    />
  )
}
