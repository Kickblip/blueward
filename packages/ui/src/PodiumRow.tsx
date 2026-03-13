import Link from "next/link"
import { numColumnsMap } from "./LeaderboardRow"
import { safeSubstring } from "./helpers"
import Card from "./Card"

export default function PodiumRow({
  ranking,
  stats,
  name,
  puuid,
  backgroundImage,
  size,
}: {
  ranking: number
  stats: {
    [key: string]: string | number
  }
  name: string
  puuid: string
  backgroundImage: string
  size: "large" | "small"
}) {
  return (
    <Link href={`/player/${safeSubstring(puuid, 0, 20)}`}>
      <Card className="flex-col gap-2 bg-cover" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div
          className={`flex flex-col justify-between
                      ${size === "large" ? "h-42 md:h-60" : ""}
                      ${size === "small" ? "h-32 md:h-42" : ""}`}
        >
          <div className={`grid ${numColumnsMap[Object.keys(stats).length]}`}>
            {Object.entries(stats).map(([statName, statValue]) => (
              <div className="flex flex-col" key={statName}>
                <h3 className="text-xs font-semibold uppercase">{statName}</h3>
                <p
                  className={`font-oswald font-semibold tabular-nums
                          ${size === "large" ? "text-3xl md:text-5xl" : ""}
                          ${size === "small" ? "text-2xl md:text-3xl" : ""}`}
                >
                  {statValue}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-5">
            <p
              className={`font-oswald scale-y-150 font-semibold tabular-nums 
                      ${size === "large" ? "text-5xl md:text-7xl" : ""}
                      ${size === "small" ? "text-3xl md:text-5xl" : ""}`}
            >
              {name}
            </p>

            <p
              className={`font-oswald font-semibold opacity-80
                      ${size === "large" ? "text-5xl md:text-7xl" : ""}
                      ${size === "small" ? "text-3xl md:text-5xl" : ""}`}
            >
              #{ranking}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
