"use client"

import { Button } from "./ui/button"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn, toNumberWithCommas } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import { Spinner } from "./ui/spinner"
import { useSWRConfig } from "swr"

export function DailyReward({ claimed }: { claimed: boolean }) {
  const [justClaimed, setJustClaimed] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const { mutate } = useSWRConfig()

  const isClaimed = claimed || justClaimed

  const today = new Date()

  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return date.getDate()
  })

  async function handleClaim() {
    if (isClaimed || isClaiming) return

    setIsClaiming(true)

    try {
      const response = await fetch("/api/daily-reward", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setJustClaimed(true)
        }

        throw new Error(data.error ?? "Failed to claim daily reward")
      }

      setJustClaimed(true)
      void mutate("/api/shop/balance")
      void mutate("/api/shop/balance/transactions")

      toast.success(`Added ${toNumberWithCommas(data.amount)}!`, {
        position: "top-center",
      })
    } catch (error) {
      toast.error("Failed to claim daily reward", { position: "top-center" })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-lg">
          <Image
            src="/gift.webp"
            alt="Daily Login Button"
            width={24}
            height={24}
            className={isClaimed ? "" : "animate-bounce"}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="font-oswald text-lg font-semibold"
      >
        <p className="text-center">Daily Login Bonus</p>
        <div className="flex items-center gap-2">
          <div className="pointer-events-none grid aspect-square w-12 place-items-center rounded-md border text-muted-foreground">
            {days[0]}
          </div>
          <div className="pointer-events-none grid aspect-square w-12 place-items-center rounded-md border text-muted-foreground">
            {days[1]}
          </div>
          <button
            type="button"
            onClick={handleClaim}
            disabled={isClaimed || isClaiming}
            className={cn(
              "grid aspect-square w-12 place-items-center rounded-md border",
              isClaimed
                ? "pointer-events-none text-muted-foreground"
                : "cursor-pointer bg-muted"
            )}
          >
            {isClaiming ? <Spinner /> : days[2]}
          </button>
          <div className="pointer-events-none grid aspect-square w-12 place-items-center rounded-md border text-muted-foreground">
            {days[3]}
          </div>
          <div className="pointer-events-none grid aspect-square w-12 place-items-center rounded-md border text-muted-foreground">
            {days[4]}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
