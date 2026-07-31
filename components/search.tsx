"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { statList } from "@/app/(with-sidebar)/leaderboard/[stat]/helpers"
import { IoPodium } from "react-icons/io5"
import { FaUserGroup } from "react-icons/fa6"
import { safeSubstring } from "@/lib/utils"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"
import { Search } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

type PlayerResult = {
  riotIdGameName: string
  puuid: string
  riotIdTagline: string
}

type RecentItem =
  | {
      type: "player"
      puuid: string
      riotIdGameName: string
      riotIdTagline?: string
    }
  | { type: "leaderboard"; slug: string; label: string }

const RECENTS_KEY = "blueward.search.recents"
const MAX_RECENTS = 8

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
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<PlayerResult[]>([])
  const [recents, setRecents] = useState<RecentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setQuery("")
      setDebouncedQuery("")
      setResults([])
      setIsLoading(false)
      setRecents(safeReadRecents())
    }

    setOpen(nextOpen)
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!open) return
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      return
    }

    const controller = new AbortController()

    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch(
          `/api/search/players?q=${encodeURIComponent(debouncedQuery)}`,
          {
            signal: controller.signal,
          }
        )
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
  }, [debouncedQuery, open])

  const shouldShowRecents = debouncedQuery.length < 2

  const addRecent = (item: RecentItem) => {
    setRecents((prev) => {
      const itemKey = item.type === "player" ? item.puuid : item.slug

      const next = [
        item,
        ...prev.filter(
          (x) =>
            x.type !== item.type ||
            (x.type === "player" ? x.puuid : x.slug) !== itemKey
        ),
      ].slice(0, MAX_RECENTS)

      safeWriteRecents(next)
      return next
    })
  }

  const leaderboardResults = Object.entries(statList)
    .filter(
      ([, label]) =>
        debouncedQuery.length >= 2 &&
        label.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
    .slice(0, 8)

  const navigateTo = (path: string, recent: RecentItem) => {
    addRecent(recent)
    setOpen(false)
    router.push(path)
  }

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        size="lg"
        variant="secondary"
        aria-label="Search"
      >
        <Search className="size-3.5" strokeWidth={2.8} />
        <span className="font-oswald text-sm uppercase">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search for something..."
          />
          <CommandList>
            {shouldShowRecents && recents.length > 0 && (
              <CommandGroup heading="Recents">
                {recents.map((item) =>
                  item.type === "leaderboard" ? (
                    <CommandItem
                      key={`leaderboard:${item.slug}`}
                      onSelect={() =>
                        navigateTo(`/leaderboard/${item.slug}`, item)
                      }
                    >
                      <IoPodium
                        className="text-chart-3 dark:text-chart-1"
                        size={14}
                      />
                      <span>Top {item.label}</span>
                    </CommandItem>
                  ) : (
                    <CommandItem
                      key={`player:${item.puuid}`}
                      onSelect={() =>
                        navigateTo(
                          `/player/${safeSubstring(item.puuid, 0, 20)}`,
                          item
                        )
                      }
                    >
                      <FaUserGroup
                        className="text-chart-3 dark:text-chart-1"
                        size={14}
                      />
                      <span>
                        {item.riotIdGameName}
                        {item.riotIdTagline && `#${item.riotIdTagline}`}
                      </span>
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            )}

            {!shouldShowRecents && isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}

            {!shouldShowRecents &&
              !isLoading &&
              results.length === 0 &&
              leaderboardResults.length === 0 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}

            {!shouldShowRecents && !isLoading && results.length > 0 && (
              <CommandGroup heading="Players">
                {results.map(({ riotIdGameName, riotIdTagline, puuid }) => (
                  <CommandItem
                    key={puuid}
                    value={`player:${puuid}`}
                    onSelect={() =>
                      navigateTo(`/player/${safeSubstring(puuid, 0, 20)}`, {
                        type: "player",
                        puuid,
                        riotIdGameName,
                        riotIdTagline,
                      })
                    }
                  >
                    <FaUserGroup className="text-chart-3 dark:text-chart-1" />
                    <span>
                      {riotIdGameName}#{riotIdTagline}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!shouldShowRecents &&
              !isLoading &&
              results.length > 0 &&
              leaderboardResults.length > 0 && <CommandSeparator />}

            {!shouldShowRecents &&
              !isLoading &&
              leaderboardResults.length > 0 && (
                <CommandGroup heading="Leaderboards">
                  {leaderboardResults.map(([slug, label]) => (
                    <CommandItem
                      key={slug}
                      value={`leaderboard:${slug}`}
                      onSelect={() =>
                        navigateTo(`/leaderboard/${slug}`, {
                          type: "leaderboard",
                          slug,
                          label,
                        })
                      }
                    >
                      <IoPodium className="text-chart-3 dark:text-chart-1" />
                      <span>Top {label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
