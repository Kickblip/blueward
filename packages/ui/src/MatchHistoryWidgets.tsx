import { toRelativeTime, toNumberWithCommas } from "./helpers"
import CrystalIcon from "./CrystalIcon"
import Image from "next/image"
import { cn } from "./cn"

export function BasicStatFormat({ title, subtitle, className }: { title: string; subtitle: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className || "")}>
      <p>{title}</p>
      <p className="text-xs text-zinc-400 font-normal">{subtitle}</p>
    </div>
  )
}

export function ImageWithLabel({
  src,
  label,
  size,
  className,
}: {
  src: string
  label: string
  size?: number
  className?: string
}) {
  return (
    <div className={cn("relative", className || "")}>
      <Image src={src} alt={label} width={size || 45} height={size || 45} className="rounded" />
      <div
        className="absolute bottom-0 left-0 p-0.5 -ml-1 -mb-1
                  text-xs bg-zinc-950 rounded-sm"
      >
        {label}
      </div>
    </div>
  )
}

export function MatchMetadata({
  win,
  gameEndTimestamp,
  gameDuration,
  payout,
}: {
  win: boolean
  gameEndTimestamp: number
  gameDuration: number
  payout: number
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-sm">
      <div className="flex items-center gap-1 text-zinc-200">
        <span className={`font-semibold uppercase ${win ? "text-blue-500" : "text-red-500"}`}>{win ? "Win" : "Loss"}</span>

        <span>
          {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <p className="text-xs text-zinc-400">{toRelativeTime(gameEndTimestamp * 1000)}</p>

      <div className="flex items-center gap-1 mt-0.5">
        <span>+</span>
        <CrystalIcon />
        <span>{toNumberWithCommas(payout)}</span>
      </div>
    </div>
  )
}

export function Username({ username, className }: { username: string; className?: string }) {
  return <p className={`text-sm truncate ${className || ""}`}>{username}</p>
}

export function GoldEarned({
  goldEarned,
  gameDuration,
  className,
}: {
  goldEarned: number
  gameDuration: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className || "")}>
      <p>{toNumberWithCommas(goldEarned)}</p>
      <p className="text-xs text-zinc-400">{(goldEarned / (gameDuration / 60)).toFixed(1)}/min</p>
    </div>
  )
}

export function ChampionIconAndLevel({
  src,
  championLevel,
  championName,
  size = 45,
}: {
  src: string
  championLevel: number
  championName: string
  size?: number
}) {
  return (
    <div className="relative">
      <Image src={src} alt={championName} width={size} height={size} className="rounded" />
      <div
        className="absolute bottom-0 left-0 p-0.5 -ml-1 -mb-1
                  text-xs bg-zinc-950 rounded-sm"
      >
        {championLevel}
      </div>
    </div>
  )
}

export function SummonerSpells({ spells, size = 30 }: { spells: number[]; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {spells.map((spell, index) => (
        <Image key={index} src={`/spells/${spell}.png`} alt="" width={size} height={size} className="rounded" />
      ))}
    </div>
  )
}

const runePaths = {
  8000: "/runes/precision.png",
  8100: "/runes/domination.png",
  8200: "/runes/sorcery.png",
  8300: "/runes/resolve.png",
  8400: "/runes/inspiration.png",
}
type RuneTraitId = keyof typeof runePaths

export function Runes({
  primaryTrait,
  secondaryTrait,
  size = 30,
  className,
}: {
  primaryTrait: RuneTraitId
  secondaryTrait: RuneTraitId
  size?: number
  className?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Image src={runePaths[primaryTrait]} alt="" width={size} height={size} className={cn("p-1", className || "")} />
      <Image src={runePaths[secondaryTrait]} alt="" width={size} height={size} className={cn("p-1", className || "")} />
    </div>
  )
}

export function Items({ srcs, size = 30 }: { srcs: string[]; size?: number }) {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {srcs.map((src, index) => (
        <Image key={index} src={src} alt="" width={size} height={size} className="rounded" />
      ))}
    </div>
  )
}

export function WardAndVisionScore({ src, visionScore, size = 35 }: { src: string; visionScore: number; size?: number }) {
  return (
    <div className="relative mx-auto">
      <Image src={src} alt="" width={size} height={size} className="rounded" />
      <div
        className="absolute bottom-0 left-0 p-0.5 -ml-1 -mb-1
                  text-xs bg-zinc-950 rounded-sm"
      >
        {visionScore}
      </div>
    </div>
  )
}

export function KDA({
  kills,
  deaths,
  assists,
  className,
}: {
  kills: number
  deaths: number
  assists: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className || "")}>
      <p>
        {kills} / {deaths} / {assists}
      </p>
      <p className="text-xs text-zinc-400">{((kills + assists) / Math.max(1, deaths)).toFixed(1)} KDA</p>
    </div>
  )
}

export function CS({ cs, gameDuration, className }: { cs: number; gameDuration: number; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className || "")}>
      <span>{cs} CS</span>
      <p className="text-xs text-zinc-400">{(cs / (gameDuration / 60)).toFixed(1)}/min</p>
    </div>
  )
}

export function TotalDamage({
  totalDamage,
  gameDuration,
  className,
}: {
  totalDamage: number
  gameDuration: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className || "")}>
      <span>{toNumberWithCommas(totalDamage)}</span>
      <p className="text-xs text-zinc-400">{(totalDamage / (gameDuration / 60)).toFixed(1)}/min</p>
    </div>
  )
}

export function DamageBar({
  magicDamage,
  physicalDamage,
  trueDamage,
  totalDamage,
  gameDuration,
  className,
}: {
  magicDamage: number
  physicalDamage: number
  trueDamage: number
  totalDamage: number
  gameDuration: number
  className?: string
}) {
  const damageColors = {
    magic: "bg-blue-500",
    physical: "bg-rose-500",
    true: "bg-zinc-200",
  }

  return (
    <div className="flex flex-col gap-1 col-span-2">
      <div className={`flex justify-between text-sm ${className || ""}`}>
        <div className="flex items-center gap-1">
          <span className={`inline-block h-3 w-3 rounded-sm ${damageColors.magic}`} />
          <span>{toNumberWithCommas(magicDamage)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`inline-block h-3 w-3 rounded-sm ${damageColors.physical}`} />
          <span>{toNumberWithCommas(physicalDamage)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`inline-block h-3 w-3 rounded-sm ${damageColors.true}`} />
          <span>{toNumberWithCommas(trueDamage)}</span>
        </div>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded">
        {[magicDamage, physicalDamage, trueDamage].map((v, i) => (
          <div
            key={i}
            className={`${Object.values(damageColors)[i]} transition-all duration-300`}
            style={{ width: `${(v / Math.max(1, totalDamage)) * 100}%` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between w-full">
        <p className="text-xs text-zinc-400">{toNumberWithCommas(totalDamage)} total</p>
        <p className="text-xs text-zinc-400">{(totalDamage / (gameDuration / 60)).toFixed(1)} /min</p>
      </div>
    </div>
  )
}
