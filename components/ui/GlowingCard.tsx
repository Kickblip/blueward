import { cn } from "@/lib/cn"

export default function GlowingCard({
  children,
  className,
  glow = "light",
  glowColor = "blue",
  backgroundImage,
}: {
  children: React.ReactNode
  className?: string
  glow?: "light" | "heavy"
  glowColor?: "blue" | "red"
  backgroundImage?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-md border backdrop-blur-md transition-all duration-200 " +
          (glowColor === "blue" ? "border-blue-400/40 unstable:border-red-400/40 " : "border-red-400/40 ") +
          (backgroundImage
            ? "bg-cover " // if theres an image url, use it as background without gradient
            : glowColor === "blue"
            ? "hover:bg-blue-500/20 bg-blue-500/10 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent unstable:hover:bg-red-500/20 unstable:bg-red-500/10 unstable:bg-gradient-to-r unstable:from-red-500/20 unstable:via-red-400/10 unstable:to-transparent " // blue gradient
            : "hover:bg-red-500/20 bg-red-500/10 bg-gradient-to-r from-red-500/20 via-red-400/10 to-transparent ") + // red gradient
          `${
            glow === "light"
              ? glowColor === "blue"
                ? "shadow-[0_0_10px_rgba(59,130,246,0.45)] hover:shadow-[0_0_20px_rgba(59,130,246,0.75)] unstable:shadow-[0_0_10px_rgba(239,68,68,0.45)] unstable:hover:shadow-[0_0_20px_rgba(239,68,68,0.75)] " // light blue
                : "shadow-[0_0_10px_rgba(239,68,68,0.45)] hover:shadow-[0_0_20px_rgba(239,68,68,0.75)] " // light red
              : glowColor === "blue"
              ? "shadow-[0_0_25px_rgba(59,130,246,0.45)] hover:shadow-[0_0_30px_rgba(59,130,246,0.75)] unstable:shadow-[0_0_25px_rgba(239,68,68,0.45)] unstable:hover:shadow-[0_0_30px_rgba(239,68,68,0.75)] " // heavy blue
              : "shadow-[0_0_25px_rgba(239,68,68,0.45)] hover:shadow-[0_0_30px_rgba(239,68,68,0.75)] " // heavy red
          }`,
        className ? className : "",
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {children}
    </div>
  )
}
