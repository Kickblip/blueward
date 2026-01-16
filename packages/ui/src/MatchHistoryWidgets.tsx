import { epochToRelativeTime, toNumberWithCommas } from "./helpers"
import { CrystalIcon } from "./icons"
import Image from "next/image"
import { cn } from "./cn"

export function BasicStatFormat({
  title,
  subtitle,
  className,
}: {
  title: string | number
  subtitle: string | number
  className?: string
}) {
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
  mmr,
}: {
  win: boolean
  gameEndTimestamp: number
  gameDuration: number
  payout: number
  mmr: number
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-sm">
      <div className="flex items-center gap-1 text-zinc-200">
        <span className={`font-semibold uppercase ${win ? "text-blue-500" : "text-red-500"}`}>{win ? "Win" : "Loss"}</span>

        <span>
          {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <p className="text-xs text-zinc-400">{epochToRelativeTime(gameEndTimestamp)}</p>

      {/* <div className="flex items-center gap-1 mt-0.5">
        <span>+</span>
        <CrystalIcon />
        <span>{toNumberWithCommas(payout)}</span>
      </div> */}

      <p className="text-xs mt-0.5">{mmr} MMR</p>
    </div>
  )
}

export function Username({ username, className }: { username: string; className?: string }) {
  return <p className={`text-sm truncate ${className || ""}`}>{username}</p>
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

const runePaths: Record<number, string> = {
  8000: "/runes/precision.png",
  8100: "/runes/domination.png",
  8200: "/runes/sorcery.png",
  8300: "/runes/resolve.png",
  8400: "/runes/inspiration.png",
} as const

const PRIMARY_FALLBACK = "/runes/precision.png"
const SECONDARY_FALLBACK = "/runes/domination.png"

export function Runes({
  primaryTrait,
  secondaryTrait,
  size = 30,
  className,
}: {
  primaryTrait: number
  secondaryTrait: number
  size?: number
  className?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Image
        src={runePaths[primaryTrait] ?? PRIMARY_FALLBACK}
        alt=""
        width={size}
        height={size}
        className={cn("p-1", className || "")}
      />
      <Image
        src={runePaths[secondaryTrait] ?? SECONDARY_FALLBACK}
        alt=""
        width={size}
        height={size}
        className={cn("p-1", className || "")}
      />
    </div>
  )
}

export function Items({ srcs, size = 30 }: { srcs: string[]; size?: number }) {
  return (
    <div className="grid grid-cols-4">
      {srcs.map((src, index) =>
        src === "/" ? (
          <div
            key={index}
            className="aspect-square bg-zinc-950 rounded border border-zinc-800"
            style={{ width: size, height: size }}
          ></div>
        ) : (
          <Image key={index} src={src} alt="" width={size} height={size} className="aspect-square rounded" />
        ),
      )}
    </div>
  )
}
