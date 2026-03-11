"use client"

import { useState } from "react"
import { mutate } from "swr"
import Image from "next/image"
import { CrystalIcon } from "@repo/ui/icons"
import { toNumberWithCommas } from "@repo/ui/helpers"
import { BANNER_CONFIG, RARITY_PRICES } from "@repo/ui/config"
import BannerOwnershipPopup from "./BannerOwnershipPopup"

export default function PurchaseableBannerCard({ bannerId }: { bannerId: number }) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const banner = BANNER_CONFIG[bannerId as keyof typeof BANNER_CONFIG]
  const price = RARITY_PRICES[banner.rarity]

  async function handlePurchase() {
    if (isPurchasing) return

    setIsPurchasing(true)
    setError(null)

    try {
      const res = await fetch("/api/shop/banners/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bannerId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error ?? "Failed to purchase banner")
        return
      }

      await mutate("/api/shop/balance", { balance: data.balance }, false)
      setIsConfirming(false)
      setShowPopup(true)
    } catch (error) {
      console.error("Banner purchase failed:", error)
      setError("Failed to purchase banner")
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <>
      <div className="flex cursor-pointer flex-col gap-2">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md">
          <button
            type="button"
            onClick={() => {
              if (isPurchasing) return
              setError(null)
              setIsConfirming(true)
            }}
            disabled={isPurchasing}
            className="absolute inset-0 z-0 text-left disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Image src={`/banners/webp/${bannerId}.webp`} alt={banner.name} fill className="object-cover" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

            <div className="absolute bottom-0 left-0 z-10 flex flex-col gap-1 p-4">
              <div className="flex items-center gap-1">
                <CrystalIcon size={20} />
                <p className="font-oswald text-lg font-semibold">{toNumberWithCommas(price)}</p>
              </div>
              <h2 className="font-oswald text-3xl font-semibold uppercase text-white">{banner.name}</h2>
            </div>

            <div className="absolute right-0 top-0 z-10">
              <Image src="/horizons.png" alt="Horizons set logo" width={100} height={80} />
            </div>
          </button>

          {isConfirming && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 p-4">
              <div className="w-full max-w-xs rounded-md bg-zinc-950 border border-zinc-800 p-4 text-center">
                <p className="font-oswald text-2xl font-semibold uppercase">Buy Banner?</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Purchase <span className="text-white">{banner.name}</span> for{" "}
                  <span className="text-white">{toNumberWithCommas(price)}</span>?
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    disabled={isPurchasing}
                    className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm transition hover:bg-zinc-800 cursor-pointer disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="flex-1 rounded-md border border-blue-400 bg-blue-600 px-3 py-2 text-sm transition hover:bg-sky-400 cursor-pointer disabled:opacity-60"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-sm text-red-300">{error}</div>}
      </div>

      <BannerOwnershipPopup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        bannerId={bannerId}
        rarity={banner.rarity}
        owned={false}
        refundAmount={0}
      />
    </>
  )
}
