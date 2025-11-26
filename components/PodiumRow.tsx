import Link from "next/link"
import GlowingCard from "./ui/GlowingCard"

export default function PodiumRow({
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
    <Link href="/">
      <GlowingCard>
        <div
          className={`flex flex-col justify-between
                      ${ranking === 1 ? "h-50" : ""}
                      ${ranking === 2 || ranking === 3 ? "h-36" : ""}`}
        >
          <div className="grid grid-cols-3">
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase">Winrate</h3>
              <p
                className={`font-oswald font-semibold tabular-nums
                          ${ranking === 1 ? "text-5xl" : ""}
                          ${ranking === 2 || ranking === 3 ? "text-3xl" : ""}`}
              >
                {winrate}%
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase">Played</h3>
              <p
                className={`font-oswald font-semibold tabular-nums
                          ${ranking === 1 ? "text-5xl" : ""}
                          ${ranking === 2 || ranking === 3 ? "text-3xl" : ""}`}
              >
                {played}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase">MMR</h3>
              <p
                className={`font-oswald font-semibold tabular-nums
                          ${ranking === 1 ? "text-5xl" : ""}
                          ${ranking === 2 || ranking === 3 ? "text-3xl" : ""}`}
              >
                {mmr}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <p
              className={`font-oswald scale-y-150 font-semibold tabular-nums 
                      ${ranking === 1 ? "text-7xl" : ""}
                      ${ranking === 2 || ranking === 3 ? "text-5xl" : ""}`}
            >
              {name}
            </p>

            <p
              className={`font-oswald font-semibold opacity-50
                      ${ranking === 1 ? "text-7xl" : ""}
                      ${ranking === 2 || ranking === 3 ? "text-5xl" : ""}`}
            >
              #{ranking}
            </p>
          </div>
        </div>
      </GlowingCard>
    </Link>
  )
}
