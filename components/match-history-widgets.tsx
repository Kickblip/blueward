import Image from "next/image"
import { cn, epochToRelativeTime } from "@/lib/utils"

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
    <div
      className={cn(
        "flex flex-col items-center gap-1 font-semibold",
        className || ""
      )}
    >
      <p>{title}</p>
      <p className="text-xs font-normal text-muted-foreground">{subtitle}</p>
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
      <Image
        src={src}
        alt={label}
        width={size || 45}
        height={size || 45}
        className="rounded"
      />
      <div className="absolute bottom-0 left-0 -mb-1 -ml-1 rounded-xs bg-foreground p-0.5 text-xs font-bold text-background dark:bg-background dark:text-foreground">
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
      <div className="flex items-center gap-1">
        <span
          className={`font-bold uppercase ${win ? "text-blue-500" : "text-red-500"}`}
        >
          {win ? "Win" : "Loss"}
        </span>

        <span className="font-semibold">
          {Math.floor(gameDuration / 60)}:
          {(gameDuration % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {epochToRelativeTime(gameEndTimestamp)}
      </p>

      {/* <div className="flex items-center gap-1 mt-0.5">
        <span>+</span>
        <CrystalIcon />
        <span>{toNumberWithCommas(payout)}</span>
      </div> */}

      <p className="mt-0.5 text-xs font-medium">{mmr} MMR</p>
    </div>
  )
}

export function Username({
  username,
  className,
}: {
  username: string
  className?: string
}) {
  return <p className={`truncate text-sm ${className || ""}`}>{username}</p>
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
      <Image
        src={src}
        alt={championName}
        width={size}
        height={size}
        className="rounded"
      />
      <div className="absolute bottom-0 left-0 -mb-1 -ml-1 rounded-xs bg-foreground p-0.5 text-xs font-bold text-background dark:bg-background dark:text-foreground">
        {championLevel}
      </div>
    </div>
  )
}

export function SummonerSpells({
  spells,
  size = 30,
}: {
  spells: number[]
  size?: number
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {spells.map((spell, index) => (
        <Image
          key={index}
          src={`/spells/${spell}.png`}
          alt=""
          width={size}
          height={size}
          className="rounded"
        />
      ))}
    </div>
  )
}

const runePaths: Record<number, string> = {
  8000: "/runes/precision.png",
  8100: "/runes/domination.png",
  8200: "/runes/sorcery.png",
  8300: "/runes/inspiration.png",
  8400: "/runes/resolve.png",
} as const
// https://darkintaqt.com/blog/perk-ids

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
        src={`/runes/keystones/${primaryTrait}.webp`}
        alt=""
        width={size}
        height={size}
        className={cn("", className || "")}
      />
      <Image
        src={runePaths[secondaryTrait] ?? SECONDARY_FALLBACK}
        alt=""
        width={size}
        height={size}
        className={cn("p-0.5", className || "")}
      />
    </div>
  )
}

export function Items({ srcs, size = 30 }: { srcs: string[]; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="grid grid-cols-3 gap-0.5">
        {srcs
          .slice(0, 6)
          .map((src, index) =>
            src === "/" ? (
              <div
                key={index}
                className="aspect-square rounded border"
                style={{ width: size, height: size }}
              ></div>
            ) : (
              <Image
                key={index}
                src={src}
                alt=""
                width={size}
                height={size}
                className="aspect-square rounded-xs"
              />
            )
          )}
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        {srcs
          .slice(6, 8)
          .map((src, index) =>
            src === "/" ? (
              <div
                key={index}
                className="aspect-square rounded border"
                style={{ width: size, height: size }}
              ></div>
            ) : (
              <Image
                key={index}
                src={src}
                alt=""
                width={size}
                height={size}
                className="aspect-square rounded-xs"
              />
            )
          )}
      </div>
    </div>
  )
}
