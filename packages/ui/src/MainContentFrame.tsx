import Footer from "./Footer"
import { SOCIAL_LINK_CONFIG } from "./config"

export default function MainContentFrame({
  Navbar,
  backgroundPatternUrl,
  backgroundPatternSize,
  foregroundPatternUrl,
  foregroundPatternSize,
  children,
}: {
  Navbar: React.ReactNode
  backgroundPatternUrl?: string
  backgroundPatternSize?: number
  foregroundPatternUrl?: string
  foregroundPatternSize?: number
  children: React.ReactNode
}) {
  return (
    <div
      className="bg-zinc-900 min-h-screen flex flex-col bg-repeat"
      style={
        foregroundPatternUrl
          ? {
              backgroundImage: `url("${foregroundPatternUrl}")`,
              backgroundRepeat: "repeat",
              backgroundSize: foregroundPatternSize ? `${foregroundPatternSize}px ${foregroundPatternSize}px` : "32px 32px",
            }
          : undefined
      }
    >
      {Navbar}

      <div
        className="flex-1 mx-2 mb-2 p-4 rounded-lg bg-zinc-950 
                    border border-zinc-800 bg-repeat"
        style={
          backgroundPatternUrl
            ? {
                backgroundImage: `url("${backgroundPatternUrl}")`,
                backgroundRepeat: "repeat",
                backgroundSize: backgroundPatternSize ? `${backgroundPatternSize}px ${backgroundPatternSize}px` : "32px 32px",
              }
            : undefined
        }
      >
        <div className="w-full max-w-7xl mx-auto">{children}</div>
      </div>

      <div className="mt-2">
        <Footer config={SOCIAL_LINK_CONFIG} />
      </div>
    </div>
  )
}
