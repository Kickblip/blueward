import { cn } from "@/lib/cn"

export default function GlowingCard({
  children,
  className,
  glow = "light",
}: {
  children: React.ReactNode
  className?: string
  glow?: "light" | "heavy"
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-md border border-blue-400/40 " +
          "bg-blue-500/10 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent " +
          "transition-all duration-200 " +
          `backdrop-blur-md ${
            glow === "light" ? "shadow-[0_0_10px_rgba(59,130,246,0.45)]" : "shadow-[0_0_25px_rgba(59,130,246,0.45)]"
          } ` +
          `hover:bg-blue-500/20 ${
            glow === "light" ? "hover:shadow-[0_0_20px_rgba(59,130,246,0.75)]" : "hover:shadow-[0_0_30px_rgba(59,130,246,0.75)]"
          } `,
        className ? className : "",
      )}
    >
      {children}
    </div>
  )
}
