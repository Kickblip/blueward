import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  CLIMB_CHALLENGE_END_DATE,
  CLIMB_CHALLENGE_START_DATE,
} from "@/lib/config"

const DAY_IN_MS = 86_400_000

export function ClimbChallengeBanner() {
  const now = Date.now()
  const startTime = new Date(CLIMB_CHALLENGE_START_DATE).getTime()
  const endTime = new Date(CLIMB_CHALLENGE_END_DATE).getTime()

  const label =
    now < startTime
      ? `${Math.ceil((startTime - now) / DAY_IN_MS)} Days Until Start`
      : now < endTime
        ? `${Math.ceil((endTime - now) / DAY_IN_MS)} Days Remain`
        : "Challenge Finished"

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md">
      <Image src="/climb/preview.webp" alt="" fill className="object-cover" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between p-4 text-white">
        <span className="font-oswald text-3xl font-semibold text-blue-100 uppercase">
          {label}
        </span>
        <Button
          variant="outline"
          size="lg"
          className="border-white/10 bg-transparent px-4 font-oswald text-xl font-semibold text-blue-100 uppercase hover:bg-white/5 hover:text-blue-100"
        >
          View
        </Button>
      </div>
    </div>
  )
}
