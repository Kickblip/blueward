"use client"

import { useMemo, useState } from "react"
import { FaPencilAlt, FaLock } from "react-icons/fa"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { BANNER_CONFIG } from "@/app/player/[pid]/config"
import Loading from "@repo/ui/Loading"
import { useRouter } from "next/navigation"

export default function BannerSelector({ playerBanners, puuid }: { playerBanners: number[]; puuid: string }) {
  const [open, setOpen] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const router = useRouter()

  const banners = useMemo(() => {
    const owned = new Set(playerBanners)
    return Object.entries(BANNER_CONFIG)
      .map(([id, banner]) => {
        const bannerId = Number(id)
        return { id: bannerId, name: banner.name, owned: owned.has(bannerId) }
      })
      .sort((a, b) => Number(b.owned) - Number(a.owned) || a.id - b.id)
  }, [playerBanners])

  async function selectBanner(bannerId: number) {
    try {
      setSavingId(bannerId)

      const res = await fetch(`/api/player/${puuid}/banner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerId }),
      })

      if (!res.ok) throw new Error(await res.text())

      setOpen(false)
      router.refresh()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 bg-zinc-900 p-2 rounded border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors duration-200"
      >
        <FaPencilAlt className="text-zinc-200" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <button className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="Close modal" />

            <motion.div
              className="relative w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900 p-4 grid grid-cols-3 gap-4"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {banners.map((banner) => {
                const disabled = !banner.owned || savingId !== null
                const isSaving = savingId === banner.id

                return (
                  <button
                    key={banner.id}
                    className="group relative overflow-hidden rounded aspect-[2/1] cursor-pointer disabled:cursor-not-allowed"
                    disabled={disabled}
                    onClick={() => banner.owned && selectBanner(banner.id)}
                    title={!banner.owned ? "Locked" : "Select banner"}
                  >
                    <Image
                      src={`/banners/${banner.id}.webp`}
                      alt={banner.name}
                      fill
                      className={[
                        "object-cover transition-transform duration-200",
                        banner.owned ? "group-hover:scale-105" : "brightness-50",
                        isSaving ? "brightness-75" : "",
                      ].join(" ")}
                      sizes="(max-width: 1024px) 33vw, 420px"
                    />

                    <div className="absolute inset-x-0 bottom-0 pb-2">
                      <div className="w-full bg-black/60 px-2 py-1">
                        {isSaving ? (
                          <div className="flex items-center justify-center p-0.5">
                            <Loading size="small" />
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-zinc-100 truncate">{banner.name}</p>
                        )}
                      </div>
                    </div>

                    {!banner.owned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black/50 p-3">
                          <FaLock className="text-zinc-100" />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
