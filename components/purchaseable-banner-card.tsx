"use client"

import { useState } from "react"
import { mutate } from "swr"
import Image from "next/image"
import { CrystalIcon } from "@/lib/icons"
import { toNumberWithCommas } from "@/lib/utils"
import { BANNER_CONFIG, RARITY_PRICES } from "@/lib/config"
import { BannerOwnershipPopup } from "./banner-ownership-popup"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import { toast } from "sonner"

export function PurchaseableBannerCard({ bannerId }: { bannerId: number }) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const banner = BANNER_CONFIG[bannerId as keyof typeof BANNER_CONFIG]
  const price = RARITY_PRICES[banner.rarity]

  async function handlePurchase() {
    if (isPurchasing) return

    setIsPurchasing(true)

    try {
      const res = await fetch("/api/shop/banners/purchase", {
        method: "POST",
        body: JSON.stringify({ bannerId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to purchase banner")
      }

      await mutate("/api/shop/balance", { balance: data.balance }, false)

      setIsDialogOpen(false)
      setShowPopup(true)
    } catch (error) {
      toast.error("Something went wrong while purchasing your banner", {
        position: "top-center",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <>
      <div className="flex cursor-pointer flex-col gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md">
              <Image
                src={`/banners/compressed/${bannerId}.webp`}
                alt={banner.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

              <div className="absolute bottom-0 left-0 z-10 flex flex-col gap-1 p-4">
                <div className="flex items-center gap-1">
                  <CrystalIcon size={20} />
                  <p className="font-oswald text-lg font-semibold text-white">
                    {toNumberWithCommas(price)}
                  </p>
                </div>
                <h2 className="font-oswald text-3xl font-semibold text-white uppercase">
                  {banner.name}
                </h2>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-oswald text-lg font-semibold uppercase">
                Confirm Purchase
              </DialogTitle>
            </DialogHeader>
            <p className="">
              Purchase <span className="font-semibold">{banner.name}</span> for{" "}
              <span className="font-semibold">{toNumberWithCommas(price)}</span>
              ?
            </p>

            <Button
              size="lg"
              disabled={isPurchasing}
              onClick={handlePurchase}
              className="w-full font-oswald font-semibold uppercase"
            >
              {isPurchasing ? <Spinner /> : "Buy it!"}
            </Button>
          </DialogContent>
        </Dialog>
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
