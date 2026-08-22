"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { BANNER_CONFIG, RARITY_COLORS, type Rarity } from "@/lib/config"
import { CrystalIcon } from "@/lib/icons"
import { toNumberWithCommas } from "@/lib/utils"
import { CardBody, CardContainer, CardItem } from "./ui/3d-card"
import { BannerBackground } from "./banner-background"

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

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -z-20 size-[80rem] -translate-x-1/2 -translate-y-1/2 animate-spin opacity-25 mix-blend-screen blur-md [animation-duration:30s] motion-reduce:animate-none"
          style={{
            background: `repeating-conic-gradient(
                transparent 0deg 9deg,
                ${RARITY_COLORS[rarity]} 9deg 13deg,
                transparent 13deg 24deg
              )`,
            maskImage: "radial-gradient(circle, black 0 48%, transparent 76%)",
          }}
        />

        <CardContainer
          containerClassName="-mx-32 -my-12 w-[calc(100%+16rem)] px-32 py-12"
          className="w-full"
        >
          <CardBody className="relative h-auto w-full">
            <CardItem className="w-full" translateZ={30}>
              <BannerBackground bannerId={bannerId}>
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              </BannerBackground>
            </CardItem>

            {owned && (
              <>
                <CardItem
                  className="absolute top-4 left-4 font-oswald text-3xl font-semibold uppercase"
                  translateZ={40}
                >
                  Owned
                </CardItem>

                <CardItem
                  className="absolute top-4 right-4 flex items-center gap-1 font-oswald text-3xl font-semibold"
                  translateZ={40}
                >
                  +<CrystalIcon size={32} />
                  {toNumberWithCommas(refundAmount)}
                </CardItem>
              </>
            )}

            <CardItem className="absolute bottom-4 left-4" translateZ={50}>
              <DialogTitle className="font-oswald text-5xl font-semibold uppercase">
                {banner.name}
              </DialogTitle>
            </CardItem>
          </CardBody>
        </CardContainer>
      </DialogContent>
    </Dialog>
  )
}
