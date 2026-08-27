"use client"

import { useState } from "react"
import { RiPencilFill } from "react-icons/ri"
import Image from "next/image"
import { BANNER_CONFIG } from "@/lib/config"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

export function BannerSelector({
  playerBanners,
  puuid,
}: {
  playerBanners: number[]
  puuid: string
}) {
  const [open, setOpen] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const router = useRouter()

  const banners = playerBanners.flatMap((id) => {
    const banner = BANNER_CONFIG[id as keyof typeof BANNER_CONFIG]
    return banner ? [{ id, ...banner }] : []
  })

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon-lg"
          className="absolute top-2 right-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
        >
          <RiPencilFill className="size-5 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-6xl">
        <DialogTitle className="font-oswald text-lg font-semibold uppercase">
          Banner Select
        </DialogTitle>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />

                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                  {isSaving ? (
                    <Spinner className="mx-auto my-0.5" />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-white">
                        {banner.name}
                      </p>
                      {banner.description && (
                        <p className="text-xs text-zinc-200">
                          {banner.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
