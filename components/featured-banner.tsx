"use client"

import { useState } from "react"
import Image from "next/image"
import { BANNER_CONFIG, ROLL_PRICE, HORIZONS_SET_LIST } from "@/lib/config"
import { CrystalIcon } from "@/lib/icons"
import { toNumberWithCommas } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HiMiniArchiveBox } from "react-icons/hi2"

export function FeaturedBanner() {
  const [isOpen, setIsOpen] = useState(false)

  const banner =
    BANNER_CONFIG[HORIZONS_SET_LIST.featured as keyof typeof BANNER_CONFIG]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative col-span-2 aspect-[2/1] w-full cursor-pointer overflow-hidden rounded-md border border-chart-1 shadow-lg shadow-chart-1">
          {/* <Image
            src={`/banners/webp/${HORIZONS_SET_LIST.featured}.webp`}
            alt=""
            fill
            className="object-cover"
          /> */}
          <video
            src={`/testing.mp4`}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

          <div className="absolute top-0 left-0 z-10 flex flex-col gap-1 p-4">
            <div className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1">
              <HiMiniArchiveBox className="size-4 text-chart-3 dark:text-chart-1" />
              <p className="font-oswald text-sm font-semibold uppercase">
                View Set list
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 z-10 p-4">
            <p className="text-sm font-semibold text-white uppercase">
              New Legendary Limited Banner available in Horizons
            </p>
            <h2 className="font-oswald text-7xl font-semibold text-white uppercase">
              {banner.name}
            </h2>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="font-oswald text-4xl font-semibold uppercase">
            Available Banners
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-6 py-6">
          {(["ultimate", "legendary", "epic", "rare", "common"] as const).map(
            (rarity) => {
              const banners = Array.from(
                new Set([
                  ...HORIZONS_SET_LIST.rollable,
                  HORIZONS_SET_LIST.featured,
                ])
              )
                .map((id) => ({
                  id,
                  ...BANNER_CONFIG[id as keyof typeof BANNER_CONFIG],
                }))
                .filter((banner) => banner.rarity === rarity)

              if (banners.length === 0) return null

              return (
                <div key={rarity} className="mb-8 last:mb-0">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={[
                        "h-3 w-3 rounded-full",
                        rarity === "ultimate" && "bg-yellow-300",
                        rarity === "legendary" && "bg-red-400",
                        rarity === "epic" && "bg-purple-400",
                        rarity === "rare" && "bg-sky-400",
                        rarity === "common" && "bg-lime-500",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <h4 className="font-oswald text-2xl font-semibold uppercase">
                      {rarity}
                    </h4>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {banners.map((banner) => {
                      const isHiddenUltimate = banner.rarity === "ultimate"

                      return (
                        <div
                          key={banner.id}
                          className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900"
                        >
                          <div className="relative aspect-[2/1] overflow-hidden">
                            {isHiddenUltimate ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_60%)] opacity-30" />
                                <div className="text-center">
                                  <p className="font-oswald text-6xl font-bold tracking-[0.12em] text-white/90 uppercase">
                                    ???
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <Image
                                src={`/banners/compressed/${banner.id}.webp`}
                                alt={banner.name}
                                fill
                                className="object-cover transition-transform duration-300"
                              />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                            <div className="absolute inset-x-0 bottom-0 p-3">
                              <p className="line-clamp-2 font-oswald text-lg leading-tight font-semibold text-white uppercase">
                                {banner.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
