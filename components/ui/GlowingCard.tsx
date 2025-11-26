import { cn } from "@/lib/cn"

export default function GlowingCard({
  children,
  className,
  glow = "light",
  backgroundImage,
}: {
  children: React.ReactNode
  className?: string
  glow?: "light" | "heavy"
  backgroundImage?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-md border border-blue-400/40 " +
          "" +
          "transition-all duration-200 " +
          (backgroundImage
            ? "bg-cover bg-center" // if theres an image url, use it as background without gradient
            : "bg-blue-500/10 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent") + // if theres no image, use a gradient
          `backdrop-blur-md ${
            glow === "light" ? "shadow-[0_0_10px_rgba(59,130,246,0.45)]" : "shadow-[0_0_25px_rgba(59,130,246,0.45)]"
          } ` + // glow level just changes the shadow size
          `hover:bg-blue-500/20 ${
            glow === "light" ? "hover:shadow-[0_0_20px_rgba(59,130,246,0.75)]" : "hover:shadow-[0_0_30px_rgba(59,130,246,0.75)]"
          } `,
        className ? className : "", // allow custom classes/overrides
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {children}
    </div>
  )
}
