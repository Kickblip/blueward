"use client"

import Loading from "@repo/ui/Loading"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { BsSearch } from "react-icons/bs"

export default function Search() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Array<{ riotIdGameName: string; puuid: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

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
  }, [isOpen])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!isOpen) return
    if (!debouncedQuery) {
      setResults([])
      return
    }

    if (debouncedQuery.length < 3) {
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

        const data: Array<{ riotIdGameName: string; puuid: string }> = await res.json()
        setResults(data)
      } catch (err) {
        if ((err as any)?.name !== "AbortError") console.error(err)
      } finally {
        setIsLoading(false)
      }
    })()

    return () => controller.abort()
  }, [debouncedQuery, isOpen])

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-center rounded-lg p-3 border-zinc-800 bg-zinc-950 text-zinc-200"
      >
        <BsSearch size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="search-overlay"
            className="fixed inset-0 z-50"
            initial="closed"
            animate="open"
            exit="closed"
            onMouseDown={() => setIsOpen(false)}
          >
            <motion.div
              className="absolute inset-0 cursor-default bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            />

            <motion.div
              className="absolute left-0 right-0 top-0"
              variants={{
                closed: { y: -24, opacity: 0 },
                open: { y: 0, opacity: 1 },
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="mx-auto w-full max-w-3xl pt-4 px-6" onMouseDown={(e) => e.stopPropagation()}>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <BsSearch className="text-zinc-400" size={16} />

                    <form className="flex w-full items-center">
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search players..."
                        className="w-full text-sm placeholder:text-zinc-400 text-zinc-200 focus:outline-none"
                      />
                    </form>
                  </div>

                  {(results.length !== 0 || isLoading) && (
                    <div className="max-h-[60vh] overflow-auto px-2 pb-2">
                      {isLoading && (
                        <div className="flex justify-center py-4">
                          <Loading />
                        </div>
                      )}

                      {!isLoading && results.length === 0 && debouncedQuery && (
                        <div className="py-4 text-center text-sm text-zinc-500">No results found</div>
                      )}

                      {!isLoading &&
                        results.map(({ riotIdGameName, puuid }) => (
                          <Link
                            href={`/player/${puuid.substring(0, 20)}`}
                            key={puuid}
                            className="block w-full rounded-lg px-4 py-2 hover:bg-zinc-800 cursor-pointer"
                          >
                            <div className="text-zinc-200">{riotIdGameName}</div>
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
