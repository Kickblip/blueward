import { cn } from "@/lib/cn"

type Glow = "light" | "heavy" | "none"
type GlowColor = "blue" | "red"

type GlowingCardProps = {
  children: React.ReactNode
  className?: string
  glow?: Glow
  glowColor?: GlowColor
  backgroundImage?: string
}

const BASE = "flex flex-col gap-2 p-3 rounded-md border backdrop-blur-md transition-all duration-200 bg-cover"

const NO_GLOW = "bg-zinc-900 border-zinc-800"

const BORDER: Record<GlowColor, string> = {
  blue: "border-blue-400/40",
  red: "border-red-400/40",
}

const GRADIENT: Record<GlowColor, string> = {
  blue: "bg-blue-500/10 hover:bg-blue-500/20 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent",
  red: "bg-red-500/10 hover:bg-red-500/20 bg-gradient-to-r from-red-500/20 via-red-400/10 to-transparent",
}

const SHADOW: Record<Exclude<Glow, "none">, Record<GlowColor, string>> = {
  light: {
    blue: "shadow-[0_0_10px_rgba(59,130,246,0.45)] hover:shadow-[0_0_20px_rgba(59,130,246,0.75)]",
    red: "shadow-[0_0_10px_rgba(239,68,68,0.45)] hover:shadow-[0_0_20px_rgba(239,68,68,0.75)]",
  },
  heavy: {
    blue: "shadow-[0_0_25px_rgba(59,130,246,0.45)] hover:shadow-[0_0_30px_rgba(59,130,246,0.75)]",
    red: "shadow-[0_0_25px_rgba(239,68,68,0.45)] hover:shadow-[0_0_30px_rgba(239,68,68,0.75)]",
  },
}

export default function GlowingCard({
  children,
  className,
  glow = "light",
  glowColor = "blue",
  backgroundImage,
}: GlowingCardProps) {
  const glowClasses = glow === "none" ? NO_GLOW : cn(BORDER[glowColor], GRADIENT[glowColor], SHADOW[glow][glowColor])

  const style = backgroundImage ? ({ backgroundImage: `url(${backgroundImage})` } as React.CSSProperties) : undefined

  return (
    <div className={cn(BASE, glowClasses, className ? className : "")} style={style}>
      {children}
    </div>
  )
}
