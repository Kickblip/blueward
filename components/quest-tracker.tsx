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

export function QuestTracker() {
  async function handleClaim() {}

  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-lg">
              <Image
                src="/quest.webp"
                alt="Quest Button"
                width={30}
                height={30}
                className="animate-bounce"
              />
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>Your active quests</TooltipContent>
      </Tooltip>
      <PopoverContent align="start">hdfgdfg</PopoverContent>
    </Popover>
  )
}
