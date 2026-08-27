import type { ReactElement } from "react"
import { Slot } from "radix-ui"
import { BANNER_CONFIG } from "@/lib/config"

export function BannerBackground({
  bannerId,
  children,
}: {
  bannerId: number
  children: ReactElement
}) {
  const banner = BANNER_CONFIG[bannerId as keyof typeof BANNER_CONFIG]
  const videoSrc = banner && "video" in banner ? banner.video : undefined
  const poster = `/banners/webp/${bannerId}.webp`
  const mediaPosition =
    banner && "mediaPosition" in banner ? banner.mediaPosition : "center"

  return (
    <Slot.Root
      className="relative isolate bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url("${poster}")`,
        backgroundPosition: mediaPosition,
      }}
    >
      {videoSrc && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          style={{ objectPosition: mediaPosition }}
          className="pointer-events-none absolute inset-0 -z-10 size-full rounded-[inherit] object-cover motion-reduce:hidden"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <Slot.Slottable>{children}</Slot.Slottable>
    </Slot.Root>
  )
}
