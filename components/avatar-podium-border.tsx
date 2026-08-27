import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

const variants = {
  gold: {
    bottom: "/borders/avatar/cover-big-1-1.png",
    middle: "/borders/avatar/cover-big-1-2.png",
    top: "/borders/avatar/cover-big-1-3.png",
    number: 1,
    textColor: "#D39700",
  },
  silver: {
    bottom: "/borders/avatar/cover-big-2-1.png",
    middle: "/borders/avatar/cover-big-2-2.png",
    top: "/borders/avatar/cover-big-2-3.png",
    number: 2,
    textColor: "#A0A0A0",
  },
  bronze: {
    bottom: "/borders/avatar/cover-big-3-1.png",
    middle: "/borders/avatar/cover-big-3-2.png",
    top: "/borders/avatar/cover-big-3-3.png",
    number: 3,
    textColor: "#CE8A41",
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
    <div className={cn("relative isolate size-30", className)}>
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

      <Avatar
        className={cn(
          "absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2",
          variant !== "gold" && "mt-1",
          variant !== "gold" ? "size-17" : "size-18"
        )}
      >
        <AvatarImage src={src} alt="" />
      </Avatar>

      <Image
        src={variants[variant].top}
        alt=""
        fill
        sizes="194px"
        className="pointer-events-none z-30 object-contain"
      />

      <span
        className={`absolute bottom-6.5 left-1/2 z-40 -translate-x-1/2 translate-y-1/2 font-oswald text-xs font-semibold uppercase`}
        style={{ color: variants[variant].textColor }}
      >
        No. {variants[variant].number}
      </span>
    </div>
  )
}
