"use client"

import { useEffect, useMemo, useState } from "react"
import Card from "@repo/ui/Card"

type MarketStatus = "OPEN" | "LOCKED" | "RESOLVED" | "CANCELLED"
type ResolvedOutcome = "OUTCOME_1" | "OUTCOME_2" | null

type Market = {
  id: number
  title: string
  status: MarketStatus
  locksAt: string | null
  resolvedAt: string | null
  resolvedOutcome: ResolvedOutcome
  outcomes: [
    {
      key: 1
      title: string
      popularity: number
      volume: number
      orders: { name: string; amount: number }[]
    },
    {
      key: 2
      title: string
      popularity: number
      volume: number
      orders: { name: string; amount: number }[]
    },
  ]
}

const getDisplayStatus = ({ status, locksAt }: Market, nowMs: number): MarketStatus =>
  status === "RESOLVED" || status === "CANCELLED" ? status : locksAt && new Date(locksAt).getTime() <= nowMs ? "LOCKED" : "OPEN"

export default function AdminClient() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [nowMs, setNowMs] = useState(Date.now())
  const [form, setForm] = useState({ title: "", outcome1Title: "", outcome2Title: "" })

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const loadMarkets = async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true)
      setError(null)

      const res = await fetch("/api/predictions/markets/get", { cache: "no-store" })
      const data = (await res.json()) as { markets?: Market[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to load markets")

      setMarkets(data.markets ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load markets")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const mutate = async (key: string, url: string, options?: RequestInit, fallback = "Request failed") => {
    try {
      setBusyKey(key)
      setError(null)

      const res = await fetch(url, options)
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? fallback)

      await loadMarkets()
    } catch (err) {
      setError(err instanceof Error ? err.message : fallback)
    } finally {
      setBusyKey(null)
    }
  }

  useEffect(() => {
    void loadMarkets()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const sortedMarkets = useMemo(
    () => markets.filter((m) => m.status !== "CANCELLED" && m.status !== "RESOLVED").sort((a, b) => b.id - a.id),
    [markets],
  )

  const createMarket = async () => {
    const title = form.title.trim()
    const outcome1Title = form.outcome1Title.trim()
    const outcome2Title = form.outcome2Title.trim()

    if (!title || !outcome1Title || !outcome2Title) {
      setError("Fill in the market title and both outcomes")
      return
    }

    if (outcome1Title === outcome2Title) {
      setError("Outcomes must be different")
      return
    }

    try {
      setIsCreating(true)
      setError(null)

      const res = await fetch("/api/predictions/markets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, outcome1Title, outcome2Title }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to create market")

      setForm({ title: "", outcome1Title: "", outcome2Title: "" })
      await loadMarkets()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create market")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="grid gap-3 rounded-md border border-zinc-700 bg-zinc-900 p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase">Admin Tools</h2>
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="rounded-md px-2 py-1 text-xs font-semibold uppercase hover:text-zinc-400 transition-colors duration-200"
        >
          {isCollapsed ? "Open" : "Close"}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            {[
              ["title", "Market title"],
              ["outcome1Title", "Outcome 1"],
              ["outcome2Title", "Outcome 2"],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                value={form[key as keyof typeof form]}
                onChange={setField(key as keyof typeof form)}
                placeholder={placeholder}
                className="rounded-md bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
            ))}

            <button
              type="button"
              onClick={() => void createMarket()}
              disabled={isCreating}
              className="rounded-md px-3 py-2 text-sm transition-colors duration-200 bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>

          {error && <div className="mt-2 rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</div>}

          {isLoading ? (
            <div className="p-3 text-sm text-white/60">Loading markets...</div>
          ) : sortedMarkets.length === 0 ? (
            <div className="p-3 text-sm text-white/60">No open markets found</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sortedMarkets.map((market) => {
                const status = getDisplayStatus(market, nowMs)
                const canResolve = status === "OPEN" || status === "LOCKED"
                const isResolved = status === "RESOLVED"
                const isCancelled = status === "CANCELLED"

                return (
                  <Card key={market.id} className="flex-row justify-between">
                    <div className="flex flex-col items-start text-sm font-semibold text-white">
                      <span>{market.title}</span>
                      <span className="text-xs">{status}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {[1, 2].map((outcome) => {
                        const key = `resolve-${market.id}-${outcome}`
                        return (
                          <button
                            key={outcome}
                            type="button"
                            onClick={() =>
                              void mutate(
                                key,
                                `/api/predictions/markets/${market.id}/resolve`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    resolvedOutcome: outcome === 1 ? "OUTCOME_1" : "OUTCOME_2",
                                  }),
                                },
                                "Failed to resolve market",
                              )
                            }
                            disabled={!canResolve || busyKey !== null}
                            className={`rounded-md px-2 py-1 text-xs transition-colors duration-200 disabled:opacity-40 ${
                              outcome === 1 ? "bg-blue-500/40 hover:bg-blue-500" : "bg-rose-500/40 hover:bg-rose-500"
                            }`}
                          >
                            {busyKey === key ? "Resolving..." : `Resolve ${outcome}`}
                          </button>
                        )
                      })}

                      <button
                        type="button"
                        onClick={() =>
                          void mutate(
                            `cancel-${market.id}`,
                            `/api/predictions/markets/${market.id}/cancel`,
                            { method: "POST" },
                            "Failed to cancel market",
                          )
                        }
                        disabled={isResolved || isCancelled || busyKey !== null}
                        className="rounded-md bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600 disabled:opacity-40"
                      >
                        {busyKey === `cancel-${market.id}` ? "Cancelling..." : "Cancel"}
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
