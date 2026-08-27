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
  variant = "default",
}: {
  ranking: number
  stats: {
    [key: string]: number | string
  }
  name: string
  puuid: string
  variant?: "default" | "highlighted"
}) {
  return (
    <Link href={`/player/${safeSubstring(puuid, 0, 20)}`}>
      <Card
        className={
          variant === "highlighted"
            ? "border-chart-5 bg-chart-3 text-white dark:border-chart-1 dark:bg-chart-2"
            : ""
        }
      >
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
