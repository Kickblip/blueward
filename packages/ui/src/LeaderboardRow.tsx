import Card from "./Card"
import Link from "next/link"

export const numColumnsMap: { [key: number]: string } = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
}

export default function LeaderboardRow({
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
    <Link href={`/player/${puuid.substring(0, 20)}`}>
      <Card>
        <div className="flex items-center gap-8">
          <p className="font-oswald font-semibold text-xl tabular-nums">{ranking}</p>

          <div className={`w-full grid ${numColumnsMap[Object.keys(stats).length + 1]}`}>
            <p className="font-oswald font-semibold text-xl">{name}</p>

            {Object.entries(stats).map(([statName, statValue]) => (
              <div key={statName} className="flex items-end gap-2">
                <p className="font-oswald font-semibold text-xl tabular-nums">{statValue}</p>
                <p className="text-xs font-semibold uppercase mb-1">{statName}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
