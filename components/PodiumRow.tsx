import Link from "next/link"
import GlowingCard from "./ui/GlowingCard"

export default function PodiumRow({
  ranking,
  winrate,
  played,
  mmr,
  name,
  championKey,
  size,
}: {
  ranking: number
  winrate: number
  played: number
  mmr: number
  name: string
  championKey?: string
  size: "large" | "small"
}) {
  return (
    <Link href="/player/12345">
      <GlowingCard
        backgroundImage={
          championKey ? `${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/centered/${championKey}_0.jpg` : undefined
        }
      >
        <div
          className={`flex flex-col justify-between
                      ${size === "large" ? "h-50" : ""}
                      ${size === "small" ? "h-36" : ""}`}
        >
          <div className="grid grid-cols-3">
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase">Winrate</h3>
              <p
                className={`font-oswald font-semibold tabular-nums
                          ${size === "large" ? "text-5xl" : ""}
                          ${size === "small" ? "text-3xl" : ""}`}
              >
                {winrate}%
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase">Played</h3>
              <p
                className={`font-oswald font-semibold tabular-nums
                          ${size === "large" ? "text-5xl" : ""}
                          ${size === "small" ? "text-3xl" : ""}`}
              >
                {played}
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase">MMR</h3>
              <p
                className={`font-oswald font-semibold tabular-nums
                          ${size === "large" ? "text-5xl" : ""}
                          ${size === "small" ? "text-3xl" : ""}`}
              >
                {mmr}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <p
              className={`font-oswald scale-y-150 font-semibold tabular-nums 
                      ${size === "large" ? "text-7xl" : ""}
                      ${size === "small" ? "text-5xl" : ""}`}
            >
              {name}
            </p>

            <p
              className={`font-oswald font-semibold opacity-50
                      ${size === "large" ? "text-7xl" : ""}
                      ${size === "small" ? "text-5xl" : ""}`}
            >
              #{ranking}
            </p>
          </div>
        </div>
      </GlowingCard>
    </Link>
  )
}
