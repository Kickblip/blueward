import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

const variants = {
  gold: {
    bottom: "/borders/avatar/cover-big-1-1.png",
    middle: "/borders/avatar/cover-big-1-2.png",
    top: "/borders/avatar/cover-big-1-3.png",
  },
  silver: {
    bottom: "/borders/avatar/cover-big-2-1.png",
    middle: "/borders/avatar/cover-big-2-2.png",
    top: "/borders/avatar/cover-big-2-3.png",
  },
  bronze: {
    bottom: "/borders/avatar/cover-big-3-1.png",
    middle: "/borders/avatar/cover-big-3-2.png",
    top: "/borders/avatar/cover-big-3-3.png",
  },
}

export function AvatarPodiumBorder({
  src,
  size,
  variant,
  className,
}: {
  src: string
  size: number
  variant: "gold" | "silver" | "bronze"
  className?: string
}) {
  return (
    <div className={cn("relative isolate size-24", className)}>
      <Image
        src={variants[variant].bottom}
        alt=""
        fill
        sizes="194px"
        className="pointer-events-none z-0 object-contain"
      />

      <Image
        src={variants[variant].middle}
        alt=""
        fill
        sizes="194px"
        className="pointer-events-none z-10 object-contain"
      />

      <Avatar className="absolute top-1/2 left-1/2 z-20 size-[55px] -translate-x-1/2 -translate-y-1/2">
        <AvatarImage src={src} alt="" />
      </Avatar>

      <Image
        src={variants[variant].top}
        alt=""
        fill
        sizes="194px"
        className="pointer-events-none z-30 object-contain"
      />
    </div>
  )
}
