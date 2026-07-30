import Image from "next/image"
import { cn } from "@/lib/utils"
import { levelBadges } from "@/lib/config"
import { calculateLevel } from "@/lib/level"

export function LevelBadge({
  experience,
  className,
}: {
  experience: number
  className?: string
}) {
  const level = calculateLevel(experience)

  const badgeSrc =
    levelBadges.find(([threshold]) => level >= threshold)?.[1] ?? "/1.png"

  return (
    <div className={cn("relative aspect-[9/4] w-14", className)}>
      <Image
        src={badgeSrc}
        alt=""
        width={90}
        height={40}
        className="size-full"
      />

      <span className="absolute inset-y-0 right-0 left-6 flex items-center justify-center font-oswald text-sm font-semibold text-white">
        {level}
      </span>
    </div>
  )
}
