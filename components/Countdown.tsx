"use client"

import { useEffect, useState } from "react"
import Card from "./ui/Card"

export default function Countdown({ date }: { date: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(date))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(date))
    }, 1000)

    return () => clearInterval(interval)
  }, [date])

  return (
    <Card title="Season Ends">
      <div
        className="
            grid grid-cols-4 gap-4
            w-full mx-auto
            text-sm
            items-center justify-items-center
        "
      >
        <TimeBlock label="Days" value={timeLeft.days} />
        <TimeBlock label="Hours" value={timeLeft.hours} />
        <TimeBlock label="Minutes" value={timeLeft.minutes} />
        <TimeBlock label="Seconds" value={timeLeft.seconds} />
      </div>
    </Card>
  )
}

function TimeBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center px-3 py-2">
      <span className="font-oswald text-5xl scale-y-150 font-semibold tabular-nums">{value.toString().padStart(2, "0")}</span>
      <span className="text-xs mt-4 font-semibold uppercase">{label}</span>
    </div>
  )
}

function getTimeLeft(target: Date) {
  const total = target.getTime() - Date.now()

  const seconds = Math.max(0, Math.floor((total / 1000) % 60))
  const minutes = Math.max(0, Math.floor((total / 1000 / 60) % 60))
  const hours = Math.max(0, Math.floor((total / (1000 * 60 * 60)) % 24))
  const days = Math.max(0, Math.floor(total / (1000 * 60 * 60 * 24)))

  return { total, days, hours, minutes, seconds }
}
