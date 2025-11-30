import Card from "@/components/ui/Card"
import Image from "next/image"

const items = [23, 29, 31, 37, 41, 43]
const summonerSpells = [1, 2]
const championKey = "Olaf"
const kills = 10
const deaths = 2
const assists = 8
const cs = 150
const gameDuration = 1800
const ward = 12
const totalDamage = 25000
const championLevel = 15
const username = "Mrbob21"
const tag = "#1234"

/**
 * Returns a widget displaying:
 * - Champion played
 * - Champion level
 * - Username and tag
 * - KDA
 * - CS and CS per minute (CSPM)
 * - Items
 * - Summoner spells
 * - Ward type
 */

export default function ParticipantPerformanceWidget() {
  return (
    <Card>
      <div className="grid grid-cols-6 gap-4">
        <div className="relative">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${championKey}_0.jpg`}
            alt={`${championKey}`}
            width={40}
            height={40}
            className="rounded"
          />
          <div className={`absolute bottom-0 -mb-2 flex justify-center w-5 h-5 text-xs bg-zinc-950 rounded-sm`}>
            {championLevel}
          </div>
        </div>

        <Column title={username} subtitle={tag} />

        <Column
          title={`${kills}/${deaths}/${assists}`}
          subtitle={`(${((kills + assists) / Math.max(1, deaths)).toFixed(2)} KDA)`}
        />

        <Column title={`${cs}`} subtitle={`(${((cs / gameDuration) * 60).toFixed(1)} CS/min)`} />
      </div>
    </Card>
  )
}

export function Column({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-zinc-400">{subtitle}</p>
    </div>
  )
}
