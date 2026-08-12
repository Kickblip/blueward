"use client"

import { useEffect } from "react"
import type {
  BracketsViewer as BracketsViewerInstance,
  ViewerData,
} from "brackets-viewer"
import "brackets-viewer/dist/brackets-viewer.min.css"
import type { CSSProperties } from "react"

declare global {
  interface Window {
    bracketsViewer: BracketsViewerInstance
  }
}

export function BracketViewer({ data }: { data: ViewerData }) {
  useEffect(() => {
    let cancelled = false

    async function renderBracket() {
      // @ts-ignore -- the package omits declarations for its browser bundle
      await import("brackets-viewer/dist/brackets-viewer.min.js")

      if (cancelled) return

      await window.bracketsViewer.render(data, {
        selector: "#bracket-test",
        clear: true,
      })
    }

    void renderBracket().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [data])

  return (
    <div className="overflow-x-auto">
      <div className="overflow-x-auto">
        <div
          id="bracket-test"
          aria-label="Tournament bracket"
          className="brackets-viewer p-0! font-sans! [&_.opponents]:shadow-sm [&_.opponents]:transition-colors [&_h1]:font-oswald! [&_h1]:font-semibold! [&_h1]:uppercase [&_h2]:font-oswald! [&_h3]:font-oswald!"
          style={
            {
              "--primary-background": "var(--background)",
              "--secondary-background": "var(--muted)",
              "--match-background": "var(--card)",

              "--font-color": "var(--foreground)",
              "--label-color": "var(--muted-foreground)",
              "--hint-color": "var(--muted-foreground)",

              "--border-color": "var(--border)",
              "--border-hover-color": "var(--ring)",
              "--border-selected-color": "var(--primary)",
              "--connector-color": "var(--border)",

              "--win-color": "var(--chart-2)",
              "--loss-color": "var(--destructive)",

              "--match-border-radius": "var(--radius)",
              "--match-width": "18rem",
              "--round-margin": "3rem",
              "--text-size": "0.875rem",
            } as CSSProperties
          }
        />
      </div>
    </div>
  )
}
