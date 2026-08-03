"use client"

import { Button } from "./ui/button"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { toNumberWithCommas } from "@/lib/utils"
import { toast } from "sonner"
import { Spinner } from "./ui/spinner"
import { useSWRConfig } from "swr"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { Input } from "./ui/input"
import { useState, type SubmitEvent } from "react"

export function PromoCode() {
  const [isRedeeming, setIsRedeeming] = useState(false)
  const { mutate } = useSWRConfig()

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isRedeeming) return

    const form = event.currentTarget
    const code = new FormData(form).get("code")

    setIsRedeeming(true)

    try {
      const response = await fetch("/api/promo-code", {
        method: "POST",
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to redeem promo code", {
          position: "top-center",
        })
        return
      }

      if (data.reward.type === "CRYSTALS") {
        void mutate("/api/shop/balance")
        void mutate("/api/shop/balance/transactions")
        toast.success(
          `Added ${toNumberWithCommas(data.reward.amount)} crystals!`,
          { position: "top-center" }
        )
      } else {
        toast.success(`Unlocked ${data.reward.name}!`, {
          position: "top-center",
        })
      }

      form.reset()
    } catch {
      toast.error("Failed to redeem promo code", { position: "top-center" })
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-lg">
              <Image
                src="/promo.webp"
                alt="Promo Code Button"
                width={30}
                height={30}
              />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>Redeem a promo code</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="font-oswald font-semibold">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <Input
            name="code"
            required
            maxLength={64}
            disabled={isRedeeming}
            className="text-center text-lg uppercase md:text-lg"
            placeholder="XXX-XXX"
          />
          <Button type="submit" disabled={isRedeeming} className="uppercase">
            {isRedeeming ? <Spinner /> : "Redeem"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
