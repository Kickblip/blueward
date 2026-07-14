"use client"

import { useState } from "react"
import Image from "next/image"
import { BANNER_CONFIG, ROLL_PRICE, HORIZONS_SET_LIST } from "@/lib/config"
import { CrystalIcon } from "@/lib/icons"
import { toNumberWithCommas } from "@/lib/utils"

export function FeaturedBanner() {
  const [isOpen, setIsOpen] = useState(false)

  const banner =
    BANNER_CONFIG[HORIZONS_SET_LIST.featured as keyof typeof BANNER_CONFIG]

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative col-span-1 aspect-[2/1] w-full cursor-pointer overflow-hidden rounded-md border border-red-300 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-transform duration-200 hover:scale-[1.02] md:col-span-2"
      >
        <Image
          src={`/banners/webp/${HORIZONS_SET_LIST.featured}.webp`}
          alt=""
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

        <div className="absolute top-0 left-0 z-10 flex flex-col gap-1 p-4">
          <div className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1">
            <p className="text-xs font-semibold uppercase">One roll</p>
            <div className="mx-2 h-3 w-0.5 rounded-full bg-zinc-700" />
            <CrystalIcon size={14} />
            <p className="font-oswald text-xs font-semibold uppercase">
              {toNumberWithCommas(ROLL_PRICE)}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 z-10 p-4">
          <p className="text-sm font-semibold uppercase">
            New Legendary Limited Banner available in Horizons
          </p>
          <h2 className="font-oswald text-7xl font-semibold text-white uppercase">
            {banner.name}
          </h2>
        </div>

        <div className="invisible absolute right-2 bottom-2 z-10 md:visible">
          <Image
            src="/horizons.png"
            alt="Horizons set logo"
            width={200}
            height={80}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-zinc-800 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Close
              </button>

              <div className="flex items-center gap-4">
                <h3 className="font-oswald text-4xl font-semibold text-white uppercase">
                  Available Banners
                </h3>
                <div className="h-12 w-0.5 rounded-full bg-zinc-600" />
                <Image
                  src="/horizons.png"
                  alt="Horizons set logo"
                  width={130}
                  height={80}
                />
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              {(
                ["ultimate", "legendary", "epic", "rare", "common"] as const
              ).map((rarity) => {
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
                      <h4 className="font-oswald text-2xl font-semibold text-white uppercase">
                        {rarity}
                      </h4>
                      <div className="h-px flex-1 bg-zinc-800" />
                      <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                        {banners.length} Banner{banners.length === 1 ? "" : "s"}
                      </p>
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
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
