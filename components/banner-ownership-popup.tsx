"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { BANNER_CONFIG, RARITY_COLORS, type Rarity } from "@/lib/config"
import { CrystalIcon } from "@/lib/icons"
import { toNumberWithCommas } from "@/lib/utils"

type BannerPopupProps = {
  open: boolean
  onClose: () => void
  bannerId: number | null
  rarity: Rarity | null
  owned?: boolean
  refundAmount?: number
}

export function BannerOwnershipPopup({
  open,
  onClose,
  bannerId,
  rarity,
  owned = false,
  refundAmount = 0,
}: BannerPopupProps) {
  if (!bannerId || !rarity) return null

  const banner = BANNER_CONFIG[bannerId as keyof typeof BANNER_CONFIG]
  if (!banner) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-[calc(100%-2rem)] max-w-2xl gap-0 bg-transparent p-0 text-white ring-0 sm:max-w-2xl"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
          style={{
            background: RARITY_COLORS[rarity],
            opacity: 0.45,
          }}
        />

        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
          <Image
            src={`/banners/webp/${bannerId}.webp`}
            alt={banner.name}
            fill
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {owned && (
            <>
              <div className="absolute top-4 left-4 px-3 py-1 font-oswald text-3xl font-semibold uppercase">
                Owned
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 font-oswald text-3xl font-semibold">
                +<CrystalIcon size={32} />
                {toNumberWithCommas(refundAmount)}
              </div>
            </>
          )}

          <div className="absolute bottom-4 left-4">
            <DialogTitle className="font-oswald text-5xl font-semibold uppercase">
              {banner.name}
            </DialogTitle>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
