import { BannerRoll } from "@/components/banner-roll"
import { BANNER_SETS } from "@/lib/config"
import { PurchaseableBannerCard } from "@/components/purchaseable-banner-card"
import { ShopTitleSvg } from "@/lib/icons"

export default function Page() {
  return (
    <div className="flex w-full flex-col">
      <div className="grid grid-cols-1 gap-4 pb-12 md:grid-cols-3">
        <div className="col-span-3 pb-12">
          <BannerRoll variant="halloween" />
        </div>

        <div className="col-span-1 flex flex-col items-center gap-8 py-4 md:col-span-3 md:flex-row">
          <ShopTitleSvg className={BANNER_SETS.halloween.accentClassName} />

          <p className="font-oswald text-3xl font-semibold uppercase">
            Purchase without rolling
          </p>
        </div>

        {BANNER_SETS.halloween.buyable.map((bannerId) => (
          <PurchaseableBannerCard key={bannerId} bannerId={bannerId} />
        ))}
      </div>

      <p className="z-30 mt-4 text-center text-xs">
        The Blueward shop is provided as a free, for-fun service. Blueward
        crystals are not purchaseable, transferrable, or exchangable for and in
        any way with real money. They can only be earned through gameplay.
      </p>
    </div>
  )
}
