"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import Card from "@repo/ui/Card"
import { toNumberWithCommas } from "@repo/ui/helpers"
import { ROLL_PRICE, RARITY_RATES, BANNER_CONFIG, type Rarity, RARITY_COLORS } from "@repo/ui/config"
import { CrystalIcon } from "@repo/ui/icons"
import { mutate } from "swr"
import BannerOwnershipPopup from "./BannerOwnershipPopup"

type RollResponse = {
  rarity: Rarity
  bannerId: number
  owned: boolean
  charged: number
  rakeback: number
  balance: number
}

const rarities: Array<{ key: Rarity; color: string; rate: number }> = [
  { key: "common", color: RARITY_COLORS.common, rate: RARITY_RATES.common },
  { key: "rare", color: RARITY_COLORS.rare, rate: RARITY_RATES.rare },
  { key: "epic", color: RARITY_COLORS.epic, rate: RARITY_RATES.epic },
  { key: "legendary", color: RARITY_COLORS.legendary, rate: RARITY_RATES.legendary },
  { key: "ultimate", color: RARITY_COLORS.ultimate, rate: RARITY_RATES.ultimate },
]

const FULL_SPINS = 10
const SPIN_DURATION = 10

export default function BannerRoll() {
  const [rotation, setRotation] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<RollResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [popupData, setPopupData] = useState<RollResponse | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  const segments = useMemo(() => {
    let start = 0

    return rarities.map(({ key, color, rate }) => {
      const sweep = rate * 360
      const end = start + sweep
      const segment = {
        key,
        color,
        rate,
        start,
        end,
        center: start + sweep / 2,
      }
      start = end
      return segment
    })
  }, [])

  const wheel = useMemo(() => {
    return `conic-gradient(${segments.map(({ color, start, end }) => `${color} ${start}deg ${end}deg`).join(", ")})`
  }, [segments])

  async function handleRoll() {
    if (isRolling) return

    setIsRolling(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/shop/banners/roll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const parse = await res.json()

      if (!res.ok) {
        setErrorMessage(parse?.error ?? `Roll request failed with status ${res.status}`)
        setIsRolling(false)
        return
      }

      const data = parse as RollResponse
      await mutate("/api/shop/balance", { balance: data.balance }, false)

      const segment = segments.find((s) => s.key === data.rarity)
      if (!segment) {
        throw new Error(`Unknown rarity returned: ${String(data.rarity)}`)
      }

      const sliceWidth = segment.end - segment.start
      const edgePadding = Math.min(Math.max(sliceWidth * 0.06, 1.5), 4)
      const nearEdgeBand = Math.min(Math.max(sliceWidth * 0.18, 4), 12)
      const shouldNearMiss = sliceWidth > edgePadding * 2 + 2 && Math.random() < 0.45

      let targetAngle: number

      if (shouldNearMiss) {
        const leftSide = Math.random() < 0.5
        const offsetFromEdge = edgePadding + Math.random() * Math.max(nearEdgeBand - edgePadding, 0.5)

        targetAngle = leftSide ? segment.start + offsetFromEdge : segment.end - offsetFromEdge
      } else {
        targetAngle = segment.start + edgePadding + Math.random() * (sliceWidth - edgePadding * 2)
      }

      const currentAngle = ((rotation % 360) + 360) % 360
      const deltaToTarget = (targetAngle + currentAngle) % 360

      const spins = FULL_SPINS * 360
      const nextRotation = rotation - spins - deltaToTarget

      setRotation(nextRotation)

      window.setTimeout(() => {
        setResult(data)
        setPopupData(data)
        setShowPopup(true)
        setIsRolling(false)
      }, SPIN_DURATION * 1000)
    } catch (error) {
      console.error("Banner roll failed:", error)
      setErrorMessage("Something went wrong while rolling.")
      setIsRolling(false)
    }
  }

  return (
    <Card className="border-sky-300 shadow-[0_0_30px_rgba(10,225,250,0.5)]">
      <div className="flex items-center justify-center pt-8">
        <div className="relative flex h-72 w-72 items-center justify-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2
              h-0 w-0 rotate-180
              border-l-[12px] border-r-[12px] border-t-0 border-b-[18px]
              border-l-transparent border-r-transparent border-b-white
              drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="absolute h-[268px] w-[268px] rounded-full border border-white/12" />
            <div className="absolute h-[286px] w-[286px] rounded-full border border-sky-300/12" />
            <div className="absolute h-[304px] w-[304px] rounded-full border border-white/8" />
            <div className="absolute h-[322px] w-[322px] rounded-full border border-cyan-300/10" />
            <div className="absolute h-[300px] w-[300px] rounded-full border-t border-l border-white/12 rotate-12" />
            <div className="absolute h-[318px] w-[318px] rounded-full border-r border-b border-sky-300/12 -rotate-12" />
          </div>

          <div className="absolute inset-0 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute inset-3 rounded-full bg-cyan-300/10 blur-xl" />

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: SPIN_DURATION, ease: [0.12, 0.8, 0.2, 1] }}
            className="relative h-64 w-64 rounded-full overflow-hidden"
            style={{
              background: wheel,
              boxShadow: `
                0 0 30px rgba(56, 189, 248, 0.30),
                0 0 60px rgba(34, 211, 238, 0.18),
                inset 0 0 0 2px rgba(255,255,255,0.22)
              `,
            }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/25" />
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 38%)",
              }}
            />
            <div className="absolute inset-[22%] rounded-full bg-zinc-950 ring-1 ring-white/10" />
          </motion.div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRoll}
        disabled={isRolling}
        className="mx-auto flex items-center justify-center gap-2 rounded-md border border-sky-300
          bg-sky-500 px-6 py-2 shadow-[0_0_30px_rgba(10,225,250,0.5)] transition-colors duration-200
          hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CrystalIcon size={25} className="text-white" />
        <p className="text-xl font-semibold font-oswald uppercase text-white">
          {isRolling ? "Rolling..." : `${toNumberWithCommas(ROLL_PRICE)} ROLL`}
        </p>
      </button>

      {errorMessage && <div className="px-4 py-2 text-sm text-red-200">{errorMessage}</div>}

      <BannerOwnershipPopup
        open={showPopup && !!popupData}
        onClose={() => setShowPopup(false)}
        bannerId={popupData?.bannerId ?? null}
        rarity={popupData?.rarity ?? null}
        owned={popupData?.owned}
        refundAmount={popupData?.owned ? Math.round((popupData.charged * popupData.rakeback) / (1 - popupData.rakeback || 1)) : 0}
      />
    </Card>
  )
}
