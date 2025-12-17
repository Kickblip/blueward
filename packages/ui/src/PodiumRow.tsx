import Link from "next/link"
import GlowingCard from "./GlowingCard"
import { numColumnsMap } from "./LeaderboardRow"

export default function PodiumRow({
  ranking,
  stats,
  name,
  championKey,
  size,
  glow = "light",
}: {
  ranking: number
  stats: {
    [key: string]: string | number
  }
  name: string
  championKey?: string
  size: "large" | "small"
  glow?: "light" | "heavy" | "none"
}) {
  return (
    <Link href="/player/12345">
      <GlowingCard
        backgroundImage={
          championKey ? `${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/centered/${championKey}_0.jpg` : undefined
        }
        glow={glow}
      >
        <div
          className={`flex flex-col justify-between
                      ${size === "large" ? "h-50" : ""}
                      ${size === "small" ? "h-36" : ""}`}
        >
          <div className={`grid ${numColumnsMap[Object.keys(stats).length]}`}>
            {Object.entries(stats).map(([statName, statValue]) => (
              <div className="flex flex-col" key={statName}>
                <h3 className="text-xs font-semibold uppercase">{statName}</h3>
                <p
                  className={`font-oswald font-semibold tabular-nums
                          ${size === "large" ? "text-5xl" : ""}
                          ${size === "small" ? "text-3xl" : ""}`}
                >
                  {statValue}
                </p>
              </div>
            ))}
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
