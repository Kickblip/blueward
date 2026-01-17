"use client"

import Loading from "@repo/ui/Loading"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useState, useEffect, useRef, useMemo } from "react"
import { BsSearch } from "react-icons/bs"
import { useRouter } from "next/navigation"
import { statList } from "@/app/leaderboard/[stat]/helpers"
import { IoPodium } from "react-icons/io5"
import { FaUserGroup } from "react-icons/fa6"
import { safeSubstring } from "@repo/ui/helpers"

type PlayerResult = { riotIdGameName: string; puuid: string; riotIdTagline: string; authId: string }

type RecentItem =
  | { type: "player"; puuid: string; riotIdGameName: string; riotIdTagline?: string }
  | { type: "leaderboard"; slug: string; label: string }

const RECENTS_KEY = "blueward.search.recents"
const MAX_RECENTS = 12

function safeReadRecents(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean) as RecentItem[]
  } catch {
    return []
  }
}

function safeWriteRecents(items: RecentItem[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(items))
  } catch {
    // privacy / quota error, do nothing
  }
}

export function SearchButton() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<PlayerResult[]>([])
  const [recents, setRecents] = useState<RecentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    setQuery("")
    setDebouncedQuery("")
    setResults([])
    setIsLoading(false)
    setRecents(safeReadRecents())
  }, [isOpen])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!isOpen) return
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      return
    }

    const controller = new AbortController()

    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/search/players?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Search failed: ${res.status}`)

        const data: PlayerResult[] = await res.json()
        setResults(data)
      } catch (err) {
        if ((err as any)?.name !== "AbortError") console.error(err)
      } finally {
        setIsLoading(false)
      }
    })()

    return () => controller.abort()
  }, [debouncedQuery, isOpen])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.shiftKey && e.key.toLowerCase() === "k")) return

      const el = e.target as HTMLElement | null
      const tag = el?.tagName?.toLowerCase()
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || el?.isContentEditable
      if (isTyping && !isOpen) return

      e.preventDefault()
      setIsOpen((v) => !v)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  const shouldShowRecents = debouncedQuery.length < 2

  const addRecent = (item: RecentItem) => {
    setRecents((prev) => {
      const next = [
        item,
        ...prev.filter((x) => {
          if (item.type !== x.type) return true
          if (item.type === "player") return (x as any).puuid !== item.puuid
          return (x as any).slug !== item.slug
        }),
      ].slice(0, MAX_RECENTS)

      safeWriteRecents(next)
      return next
    })
  }

  const clearRecents = () => {
    setRecents([])
    try {
      localStorage.removeItem(RECENTS_KEY)
    } catch {}
  }

  const leaderboardResults = useMemo(() => {
    if (debouncedQuery.length < 2) return []
    const q = debouncedQuery.toLowerCase()
    return Object.entries(statList)
      .filter(([, label]) => label.toLowerCase().includes(q))
      .slice(0, 8) as Array<[string, string]>
  }, [debouncedQuery])

  const navigateTo = (path: string, recent?: RecentItem) => {
    if (recent) addRecent(recent)
    setIsOpen(false)
    router.push(path)
  }

  const goToTopResult = () => {
    const topPlayer = results[0]
    const topLb = leaderboardResults[0]

    if (topPlayer) {
      navigateTo(`/player/${safeSubstring(topPlayer.puuid, 0, 20)}`, {
        type: "player",
        puuid: topPlayer.puuid,
        riotIdGameName: topPlayer.riotIdGameName,
        riotIdTagline: topPlayer.riotIdTagline,
      })
      return
    }

    if (topLb) {
      const [slug, label] = topLb
      navigateTo(`/leaderboard/${slug}`, { type: "leaderboard", slug, label })
      return
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-center gap-3 rounded-xl pl-3 p-1.5 border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 transition-colors duration-200"
      >
        <BsSearch size={12} />
        <span className="text-sm text-zinc-200 font-medium">Search Blueward</span>
        <span className="text-xs uppercase tracking-wider text-zinc-200 border border-blue-500 bg-blue-600 px-3 py-0.5 rounded-md">
          Shift + K
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="search-overlay"
            className="fixed inset-0 z-50 font-roboto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setIsOpen(false)}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 cursor-default bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            />

            {/* center container */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center px-6"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="w-full max-w-xl" onMouseDown={(e) => e.stopPropagation()}>
                <div className="rounded-2xl border-3 border-zinc-800 bg-zinc-900">
                  {/* input */}
                  <div className="flex items-center gap-3 px-4 py-2 m-2 rounded-lg border border-zinc-700 bg-zinc-800">
                    <BsSearch className="text-zinc-400" size={16} />

                    <form
                      className="flex w-full items-center"
                      onSubmit={(e) => {
                        e.preventDefault()
                        goToTopResult()
                      }}
                    >
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Blueward..."
                        className="w-full text-sm placeholder:text-zinc-400 text-zinc-200 focus:outline-none bg-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            goToTopResult()
                          }
                          if (e.key === "Escape") setIsOpen(false)
                        }}
                      />
                    </form>
                  </div>

                  {/* recents */}
                  {shouldShowRecents && recents.length > 0 && (
                    <div className="px-3 pb-2">
                      <div className="flex items-center justify-between px-2 pb-2">
                        <span className="text-xs uppercase tracking-wider text-zinc-500">Recent searches</span>
                        <button
                          type="button"
                          onClick={clearRecents}
                          className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="max-h-[45vh] overflow-auto">
                        {recents.slice(0, 8).map((item) => {
                          if (item.type === "leaderboard") {
                            return (
                              <button
                                key={`lb:${item.slug}`}
                                type="button"
                                className="w-full flex items-center justify-between rounded-lg px-4 py-2 font-semibold hover:bg-zinc-800 cursor-pointer border border-zinc-900 hover:border-zinc-700 text-left"
                                onClick={() => navigateTo(`/leaderboard/${item.slug}`, item)}
                              >
                                <div className="flex items-center gap-2 text-zinc-200">
                                  <IoPodium className="text-zinc-400" size={14} />
                                  <span className="text-sm">Top {item.label}</span>
                                </div>
                                <span className="text-xs text-zinc-500">Recent</span>
                              </button>
                            )
                          }

                          return (
                            <button
                              key={`p:${item.puuid}`}
                              type="button"
                              className="w-full flex items-center justify-between rounded-lg px-4 py-2 font-semibold hover:bg-zinc-800 cursor-pointer border border-zinc-900 hover:border-zinc-700 text-left"
                              onClick={() => navigateTo(`/player/${safeSubstring(item.puuid, 0, 20)}`, item)}
                            >
                              <div className="flex items-center gap-2 text-zinc-200">
                                <FaUserGroup className="text-zinc-400" size={14} />
                                <span className="text-sm">
                                  {item.riotIdGameName}
                                  {item.riotIdTagline ? <span className="text-zinc-500">#{item.riotIdTagline}</span> : null}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-500">Recent</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* results */}
                  {(results.length !== 0 || leaderboardResults.length !== 0 || isLoading || debouncedQuery.length > 2) && (
                    <div className="max-h-[60vh] overflow-auto px-2 pb-2">
                      {isLoading && (
                        <div className="flex justify-center py-4">
                          <Loading />
                        </div>
                      )}

                      {!isLoading && results.length === 0 && debouncedQuery.length > 2 && leaderboardResults.length === 0 && (
                        <div className="py-4 text-center text-sm text-zinc-500">No results found</div>
                      )}

                      {!isLoading &&
                        results.map(({ riotIdGameName, puuid, riotIdTagline }) => (
                          <Link
                            href={`/player/${safeSubstring(puuid, 0, 20)}`}
                            key={puuid}
                            className="w-full flex items-center justify-between rounded-lg px-4 py-2 font-semibold hover:bg-zinc-800 cursor-pointer border border-zinc-900 hover:border-zinc-700 hover:text-blue-400 text-zinc-200"
                            onClick={(e) => {
                              e.preventDefault()
                              navigateTo(`/player/${safeSubstring(puuid, 0, 20)}`, {
                                type: "player",
                                puuid,
                                riotIdGameName,
                                riotIdTagline,
                              })
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <FaUserGroup className="text-zinc-400" size={14} />
                              <span className="text-sm">
                                {riotIdGameName}
                                {riotIdTagline ? <span className="text-zinc-500">#{riotIdTagline}</span> : null}
                              </span>
                            </div>

                            <span className="text-xs text-zinc-500">Player</span>
                          </Link>
                        ))}

                      {!isLoading &&
                        leaderboardResults.map(([slug, label]) => (
                          <Link
                            href={`/leaderboard/${slug}`}
                            key={slug}
                            className="w-full flex items-center justify-between rounded-lg px-4 py-2 font-semibold hover:bg-zinc-800 cursor-pointer border border-zinc-900 hover:border-zinc-700 hover:text-blue-400 text-zinc-200"
                            onClick={(e) => {
                              e.preventDefault()
                              navigateTo(`/leaderboard/${slug}`, { type: "leaderboard", slug, label })
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <IoPodium className="text-zinc-400" size={14} />
                              <span className="text-sm">Top {label}</span>
                            </div>

                            <span className="text-xs text-zinc-500">Leaderboard</span>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
