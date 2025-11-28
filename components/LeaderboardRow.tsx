import Card from "./ui/Card"
import Link from "next/link"

export default function LeaderboardRow({
  ranking,
  winrate,
  played,
  mmr,
  name,
}: {
  ranking: number
  winrate: number
  played: number
  mmr: number
  name: string
}) {
  return (
    <Link href="/player/12345">
      <Card>
        <div className="flex items-center gap-8">
          <p className="font-oswald font-semibold text-xl tabular-nums">{ranking}</p>

          <div className="grid grid-cols-4 w-full">
            <p className="font-oswald font-semibold text-xl">{name}</p>

            <div className="flex items-end gap-2">
              <p className="font-oswald font-semibold text-xl tabular-nums">{played}</p>
              <p className="text-xs font-semibold uppercase mb-1">Played</p>
            </div>

            <div className="flex items-end gap-2">
              <p className="font-oswald font-semibold text-xl tabular-nums">{winrate}%</p>
              <p className="text-xs font-semibold uppercase mb-1">Winrate</p>
            </div>

            <div className="flex items-end gap-2">
              <p className="font-oswald font-semibold text-xl tabular-nums">{mmr}</p>
              <p className="text-xs font-semibold uppercase mb-1">MMR</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
