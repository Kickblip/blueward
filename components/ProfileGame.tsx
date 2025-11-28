import GlowingCard from "@/components/ui/GlowingCard"
import Image from "next/image"

const items = [23, 29, 31, 37, 41, 43]
const summonerSpells = [1, 2]
const championKey = "Olaf"
const date = 1764350287
const kills = 10
const deaths = 2
const assists = 8
const cs = 150
const gameDuration = 1800
const ward = 12
const visionScore = 20
const totalDamage = 25000
const magicDamage = 5000
const physicalDamage = 18000
const trueDamage = 2000
const gameMode = "Classic"

function timeAgo(msSinceEpoch: number): string {
  const diffMs = Date.now() - msSinceEpoch

  const seconds = Math.floor(diffMs / 1_000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

  if (days) return rtf.format(-days, "day") // “2 days ago”
  if (hours) return rtf.format(-hours, "hour") // “an hour ago”
  if (minutes) return rtf.format(-minutes, "minute")
  return rtf.format(-seconds, "second") // “just now”
}

export default function ProfileGame({ win }: { win: boolean }) {
  return (
    <GlowingCard glowColor={win ? "blue" : "red"}>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <p>{gameMode}</p>
          <p className="text-sm opacity-60">{timeAgo(date * 1000)}</p>
          <div className="flex items-center gap-1">
            <p className={`font-semibold uppercase ${win ? "text-blue-500" : "text-red-500"}`}>{win ? "Win" : "Loss"}</p>
            <p className="opacity-60">|</p>
            <p className="opacity-60">
              {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        <Image
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${championKey}_0.jpg`}
          alt=""
          width={40}
          height={40}
        />
      </div>
    </GlowingCard>
  )
}
