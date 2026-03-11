"use client"

import { useMemo, useState } from "react"
import { FaPencilAlt } from "react-icons/fa"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { BANNER_CONFIG } from "@repo/ui/config"
import Loading from "@repo/ui/Loading"
import { useRouter } from "next/navigation"

export default function BannerSelector({ playerBanners, puuid }: { playerBanners: number[]; puuid: string }) {
  const [open, setOpen] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const router = useRouter()

  const banners = useMemo(() => {
    return playerBanners
      .map((id) => {
        const banner = BANNER_CONFIG[id as keyof typeof BANNER_CONFIG]
        if (!banner) return null
        return {
          id,
          name: banner.name,
          description: banner.description,
        }
      })
      .filter((banner): banner is NonNullable<typeof banner> => banner !== null)
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

  if (!banners.length) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 rounded border border-zinc-800 bg-zinc-900 p-2 hover:bg-zinc-800"
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
              className="relative grid max-h-[90vh] overflow-y-auto w-full max-w-6xl grid-cols-3 gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {banners.map((banner) => {
                const isSaving = savingId === banner.id

                return (
                  <button
                    key={banner.id}
                    className="group relative aspect-[2/1] overflow-hidden rounded"
                    disabled={savingId !== null}
                    onClick={() => selectBanner(banner.id)}
                  >
                    <Image
                      src={`/banners/compressed/${banner.id}.webp`}
                      alt={banner.name}
                      fill
                      className={`object-cover transition-transform duration-200 group-hover:scale-105 ${
                        isSaving ? "brightness-75" : ""
                      }`}
                      sizes="(max-width: 1024px) 33vw, 420px"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                      {isSaving ? (
                        <div className="flex justify-center p-0.5">
                          <Loading size="small" />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-zinc-100">{banner.name}</p>
                          {banner.description ? <p className="text-xs text-zinc-300">{banner.description}</p> : null}
                        </>
                      )}
                    </div>
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
