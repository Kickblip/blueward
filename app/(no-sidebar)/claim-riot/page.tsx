"use client"

import { useEffect, useRef, useState } from "react"
import { autoClaimRiotProfile } from "./actions"
import { Spinner } from "@/components/ui/spinner"

export default function Page() {
  const started = useRef(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (started.current) return
    started.current = true

    void (async () => {
      const requested =
        new URLSearchParams(window.location.search).get("next") ?? "/"

      const next = new URL(requested, window.location.origin)
      const destination =
        next.origin === window.location.origin
          ? `${next.pathname}${next.search}${next.hash}`
          : "/"

      try {
        const result = await autoClaimRiotProfile()

        if (!result.ok) {
          setError(result.message)
          return
        }

        window.location.replace(destination)
      } catch {
        setError("Could not claim your Riot profile.")
      }
    })()
  }, [])

  return (
    <div className="grid min-h-screen w-full place-items-center">
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="font-oswald font-semibold uppercase">
            Claiming your profile...
          </p>
        </div>
      )}
    </div>
  )
}
