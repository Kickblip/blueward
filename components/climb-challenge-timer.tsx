"use client"

import {
  CLIMB_CHALLENGE_END_DATE,
  CLIMB_CHALLENGE_START_DATE,
} from "@/lib/config"
import { useEffect, useState } from "react"

const startTime = new Date(CLIMB_CHALLENGE_START_DATE).getTime()
const endTime = new Date(CLIMB_CHALLENGE_END_DATE).getTime()

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => value.toString().padStart(2, "0")

  return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function ClimbChallengeTimer({ initialNow }: { initialNow: number }) {
  const [now, setNow] = useState(initialNow)

  useEffect(() => {
    const update = () => setNow(Date.now())

    update()
    const interval = window.setInterval(update, 1_000)

    return () => window.clearInterval(interval)
  }, [])

  let time: string
  let subtitle: string

  if (now < startTime) {
    time = "Starting soon!"
    subtitle = "Friday 5:00 PM CST"
  } else if (now >= endTime) {
    time = "Finished"
    subtitle = "We will be in contact about prizes"
  } else {
    time = formatRemaining(endTime - now)
    subtitle = "Remaining"
  }

  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-oswald text-lg font-semibold uppercase sm:text-2xl">
        {time}
      </h2>
      <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
    </div>
  )
}
