import { cn } from "@/lib/utils"

const players = [
  {
    id: 1,
    name: "Kickball",
    team: 0,
    bannerId: 1,
    offset: "object-[center_20%]",
  },
  {
    id: 2,
    name: "KillShot",
    team: 0,
    bannerId: 2,
    offset: "object-[center_20%]",
  },
  { id: 3, name: "Keshi", team: 0, bannerId: 3, offset: "object-[center_20%]" },
  { id: 4, name: "naP", team: 0, bannerId: 4, offset: "object-[center_75%]" },
  {
    id: 5,
    name: "Kujojacob",
    team: 0,
    bannerId: 5,
    offset: "object-[center_50%]",
  },
  {
    id: 6,
    name: "Eleoraphant",
    team: 1,
    bannerId: 6,
    offset: "object-[center_60%]",
  },
  { id: 7, name: "Ethan", team: 1, bannerId: 7, offset: "object-[center_60%]" },
  {
    id: 8,
    name: "Jake848484",
    team: 1,
    bannerId: 8,
    offset: "object-[center_40%]",
  },
  { id: 9, name: "Saigo", team: 1, bannerId: 9, offset: "object-[center_30%]" },
  {
    id: 10,
    name: "FIGGYISYUMMY",
    team: 1,
    bannerId: 1,
    offset: "object-[center_20%]",
  },
]

export default function Page() {
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
          <PlayerCard player={players[0]} team={0} />
          <PlayerCard player={players[1]} team={0} />
          <PlayerCard player={players[2]} team={0} />
          <PlayerCard player={players[3]} team={0} />
          <PlayerCard player={players[4]} team={0} />
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
          <PlayerCard player={players[5]} team={1} />
          <PlayerCard player={players[6]} team={1} />
          <PlayerCard player={players[7]} team={1} />
          <PlayerCard player={players[8]} team={1} />
          <PlayerCard player={players[9]} team={1} />
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto bg-secondary p-2">
        {/* Team 2 */}
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
