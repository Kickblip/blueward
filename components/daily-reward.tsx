"use client"

import { Button } from "./ui/button"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn, toNumberWithCommas } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import { Spinner } from "./ui/spinner"
import { useSWRConfig } from "swr"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function DailyReward({ claimed }: { claimed: boolean }) {
  const [justClaimed, setJustClaimed] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const { mutate } = useSWRConfig()

  const isClaimed = claimed || justClaimed

  const today = new Date()

  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const date = new Date(today)
    date.setDate(date.getDate() + offset)
    return {
      offset,
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    }
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
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-lg">
              <Image
                src="/gift.webp"
                alt="Daily Login Button"
                width={24}
                height={24}
                className={isClaimed ? "" : "animate-bounce"}
              />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>Claim your login bonus</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        className="font-oswald text-lg font-semibold"
      >
        <p className="text-center">Daily Login Bonus</p>
        <div className="flex items-center gap-1">
          <Day day={days[0].day} month={days[0].month} />
          <Day day={days[1].day} month={days[1].month} />

          <div className="flex flex-col items-center gap-1">
            <span className="font-sans text-xs text-muted-foreground">
              {days[2].month}
            </span>
            <button
              type="button"
              onClick={handleClaim}
              disabled={isClaimed || isClaiming}
              className={cn(
                "grid aspect-square w-12 place-items-center rounded-md border",
                isClaimed
                  ? "pointer-events-none text-muted-foreground"
                  : "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isClaiming ? <Spinner /> : days[2].day}
            </button>
          </div>

          <Day day={days[3].day} month={days[3].month} />
          <Day day={days[4].day} month={days[4].month} />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Day({ day, month }: { day: number; month: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-sans text-xs text-muted-foreground">{month}</span>
      <div className="grid aspect-square w-12 place-items-center rounded-md border text-muted-foreground">
        <span>{day}</span>
      </div>
    </div>
  )
}
