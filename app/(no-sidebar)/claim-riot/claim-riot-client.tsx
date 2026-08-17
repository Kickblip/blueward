"use client"

import { useEffect, useRef, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { autoClaimRiotProfile } from "./actions"

export function ClaimRiotClient({ destination }: { destination: string }) {
  const started = useRef(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (started.current) return
    started.current = true

    void (async () => {
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
  }, [destination])

  return (
    <div className="grid min-h-screen w-full place-items-center">
      {error ? (
        <p role="alert" className="text-center text-red-500">
          {error}
        </p>
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
