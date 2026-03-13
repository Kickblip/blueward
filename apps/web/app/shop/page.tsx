import Image from "next/image"
import BannerRoll from "@/components/BannerRoll"
import { HORIZONS_SET_LIST } from "@repo/ui/config"
import FeaturedBanner from "@/components/FeaturedBanner"
import PurchaseableBannerCard from "@/components/PurchaseableBannerCard"

export default function Shop() {
  return (
    <div className="flex flex-col w-full">
      <p className="z-30 text-xs text-center text-zinc-400 mb-4">
        The Blueward shop is provided as a free, for-fun service. Blueward crystals are not purchaseable, transferrable, or
        exchangable for and in any way with real money. They can only be earned through gameplay.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
        <FeaturedBanner />
        <BannerRoll />
        <div className="flex flex-col md:flex-row items-center col-span-1 md:col-span-3 py-4 gap-8">
          <Image src="/shop.svg" alt="Blueward Shop" width={400} height={80} />

          <p className="text-3xl font-semibold font-oswald uppercase">Purchase without rolling</p>
        </div>
        {HORIZONS_SET_LIST.buyable.map((bannerId) => (
          <PurchaseableBannerCard key={bannerId} bannerId={bannerId} />
        ))}
      </div>
    </div>
  )
}
