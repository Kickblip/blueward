import type { ReactElement } from "react"
import { Slot } from "radix-ui"

export function BannerBackground({
  bannerId,
  children,
}: {
  bannerId: number
  children: ReactElement
}) {
  return (
    <Slot.Root
      className="bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url("/banners/compressed/${bannerId}.webp")`,
      }}
    >
      {children}
    </Slot.Root>
  )
}
