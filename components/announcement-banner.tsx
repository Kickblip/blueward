"use client"

import { useEffect, useState } from "react"
import { ChevronRight, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MonochromeLogo } from "./logo"
import Link from "next/link"

const STORAGE_KEY = "blueward:announcement:version-2-update"

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "dismissed")
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="z-50 flex h-12 w-full items-center justify-center gap-2 border-b border-chart-1 bg-blue-700 px-2 sm:rounded-t-xl dark:border-chart-2 dark:bg-blue-950">
      <div className="flex items-center gap-1 font-oswald font-semibold text-white uppercase sm:gap-2">
        <MonochromeLogo size={24} />
        <span className="text-lg">Version 2 is here!</span>
        <Link
          href="https://github.com/Kickblip/blueward/releases/tag/v2.0"
          target="_blank"
          className="-mr-1 ml-4 text-xs hover:underline"
        >
          Read the update notes
        </Link>
        <ChevronRight size={16} className="mt-0.5" />
      </div>

      <Image
        src="/announcement-riven.webp"
        alt=""
        width={3840}
        height={471}
        className="hidden h-full w-auto max-w-none shrink-0 object-contain sm:block"
      />

      <div className="flex hidden items-center gap-2 font-oswald font-semibold text-white uppercase sm:block">
        Use code WELCOMEGIFT
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss announcement"
        onClick={dismiss}
        className="absolute top-2 right-2 text-white"
      >
        <XIcon />
      </Button>
    </div>
  )
}
