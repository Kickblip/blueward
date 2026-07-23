import { cn, safeSubstring } from "@/lib/utils"
import { LobbyPresence } from "./lobby-presence"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { fetchProfilePictureByAuthId } from "@/app/(with-sidebar)/player/[pid]/actions"
import { fetchPlayerCardByPuuid } from "@/app/api/player/[puuid]/card/route"

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
    <div className="max-w-9xl mx-auto grid h-full min-h-0 w-full grid-cols-[7fr_7fr_6fr] gap-4 p-4">
      <div className="flex min-h-0 flex-col">
        <div className="flex items-center gap-2 p-2">
          <div className="size-4 rounded-xs bg-blue-500" />
          <h2 className="font-oswald text-lg font-semibold uppercase">
            Team 1
          </h2>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
          <PlayerCard player={null} team={0} />
          <PlayerCard player={null} team={0} />
          <PlayerCard player={null} team={0} />
          <PlayerCard player={null} team={0} />
          <PlayerCard player={null} team={0} />
        </div>
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="flex items-center gap-2 p-2">
          <div className="size-4 rounded-xs bg-rose-500" />
          <h2 className="font-oswald text-lg font-semibold uppercase">
            Team 2
          </h2>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
          <PlayerCard player={null} team={1} />
          <PlayerCard player={null} team={1} />
          <PlayerCard player={null} team={1} />
          <PlayerCard player={null} team={1} />
          <PlayerCard player={null} team={1} />
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto bg-secondary p-2">
        <LobbyPresence lobbyId={lobbyId} player={playerCard} />
      </div>
    </div>
  )
}

export function PlayerCard({
  player,
  team,
}: {
  player: {
    id: number
    name: string
    team: number
    bannerId: number
    offset: string
  } | null
  team: 0 | 1
}) {
  if (!player) {
    return (
      <div
        className={cn(
          `h-32 border border-l-4 bg-secondary`,
          team === 0 ? "border-l-blue-500" : "border-l-rose-500"
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden border border-l-4 bg-secondary",
        team === 0 ? "border-l-blue-500" : "border-l-rose-500"
      )}
    >
      <video
        src={`/testing${player.bannerId}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 size-full object-cover",
          player.offset
        )}
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
        <div></div>
        <h2 className="font-oswald text-4xl font-semibold text-white uppercase">
          {player.name}
        </h2>
      </div>
    </div>
  )
}
