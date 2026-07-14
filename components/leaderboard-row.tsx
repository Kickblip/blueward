import { Card } from "./ui/card"
import Link from "next/link"
import { safeSubstring } from "@/lib/utils"

export const numColumnsMap: { [key: number]: string } = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
}

export function LeaderboardRow({
  ranking,
  stats,
  name,
  puuid,
}: {
  ranking: number
  stats: {
    [key: string]: number | string
  }
  name: string
  puuid: string
}) {
  return (
    <Link href={`/player/${safeSubstring(puuid, 0, 20)}`}>
      <Card>
        <div className="flex items-center gap-8">
          <p className="font-oswald text-xl font-semibold tabular-nums">
            {ranking}
          </p>

          <div
            className={`grid w-full ${numColumnsMap[Object.keys(stats).length + 1]}`}
          >
            <p className="font-oswald text-xl font-semibold">{name}</p>

            {Object.entries(stats).map(([statName, statValue]) => (
              <div key={statName} className="flex items-end gap-2">
                <p className="font-oswald text-xl font-semibold tabular-nums">
                  {statValue}
                </p>
                <p className="mb-1 text-xs font-semibold uppercase">
                  {statName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
