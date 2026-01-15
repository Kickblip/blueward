"use client"

import { useEffect, useState } from "react"

export default function RevalidateAfterImport() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const res = await fetch("/api/match/revalidate", {
        method: "POST",
        cache: "no-store",
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        if (!cancelled) setError(json?.error ?? `Revalidate failed (${res.status})`)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!error) return null

  return <div className="text-sm text-red-400">Revalidation error: {error}</div>
}
