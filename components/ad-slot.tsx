import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type AdSlotProps = Omit<ComponentProps<"aside">, "children"> & {
  name: string
}

export function AdSlot({ name, className, ...props }: AdSlotProps) {
  return (
    <aside
      aria-label="Advertisement"
      data-slot="ad-slot"
      data-ad-unit={name}
      className={cn(
        "z-50 grid place-items-center border bg-background text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      Soon this slot will be filled with an ad to support Blueward
    </aside>
  )
}
