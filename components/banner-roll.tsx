"use client"

import { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { toNumberWithCommas } from "@/lib/utils"
import {
  ROLL_PRICE,
  RARITY_RATES,
  type Rarity,
  RARITY_COLORS,
} from "@/lib/config"
import { CrystalIcon } from "@/lib/icons"
import { mutate } from "swr"
import { BannerOwnershipPopup } from "./banner-ownership-popup"
import { Button } from "./ui/button"

type RollResponse = {
  rarity: Rarity
  bannerId: number
  owned: boolean
  charged: number
  rakeback: number
  balance: number
}

const RARITY_KEYS: Rarity[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "ultimate",
]
const CELL_COUNT = 12
const CELL_SWEEP = 360 / CELL_COUNT
const FULL_SPINS = 10
const SPIN_DURATION = 10
const WINNER_INJECTION_DEGREES = 210
const DOT_RINGS = [
  { radius: 70, count: 14, size: 1, opacity: 0.25 },
  { radius: 110, count: 20, size: 1.5, opacity: 0.32 },
  { radius: 145, count: 28, size: 2.2, opacity: 0.42 },
  { radius: 172, count: 34, size: 3.2, opacity: 0.55 },
  { radius: 330, count: 58, size: 3.8, opacity: 0.6 },
  { radius: 350, count: 64, size: 2.8, opacity: 0.48 },
  { radius: 372, count: 70, size: 1.9, opacity: 0.38 },
  { radius: 394, count: 76, size: 1.1, opacity: 0.28 },
] as const

function rarityForRoll(roll: number) {
  let cumulative = 0

  for (const rarity of RARITY_KEYS) {
    cumulative += RARITY_RATES[rarity]
    if (roll < cumulative) return rarity
  }

  return "common"
}

const INITIAL_CELLS = Array.from({ length: CELL_COUNT }, (_, index) =>
  rarityForRoll((((index * 7) % CELL_COUNT) + 0.5) / CELL_COUNT)
)

function buildRandomCells() {
  return Array.from({ length: CELL_COUNT }, () => rarityForRoll(Math.random()))
}

function isCellFullyHidden(index: number, rotation: number) {
  const center =
    (((index * CELL_SWEEP + CELL_SWEEP / 2 + rotation) % 360) + 360) % 360
  return center >= 90 + CELL_SWEEP / 2 && center <= 270 - CELL_SWEEP / 2
}

function makeWheelGradient(cells: Rarity[]) {
  return `conic-gradient(${cells
    .map(
      (rarity, index) =>
        `${RARITY_COLORS[rarity]} ${index * CELL_SWEEP}deg ${(index + 1) * CELL_SWEEP}deg`
    )
    .join(", ")})`
}

export function BannerRoll() {
  const [rotation, setRotation] = useState(0)
  const [cells, setCells] = useState<Rarity[]>(INITIAL_CELLS)
  const [isRolling, setIsRolling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [popupData, setPopupData] = useState<RollResponse | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const activeSpin = useRef<{
    startRotation: number
    endRotation: number
    winnerIndex: number
    winner: Rarity
    lastCellStep: number
    winnerInjected: boolean
  } | null>(null)

  const wheel = useMemo(() => makeWheelGradient(cells), [cells])

  function handleWheelUpdate(currentRotation: number) {
    const spin = activeSpin.current
    if (!spin || !Number.isFinite(currentRotation)) return

    const cellStep = Math.floor(
      (spin.startRotation - currentRotation) / CELL_SWEEP
    )
    const advanced = cellStep > spin.lastCellStep
    const injectWinner =
      !spin.winnerInjected &&
      currentRotation - spin.endRotation < WINNER_INJECTION_DEGREES

    if (!advanced && !injectWinner) return

    if (advanced) spin.lastCellStep = cellStep
    if (injectWinner) spin.winnerInjected = true

    setCells((currentCells) =>
      currentCells.map((rarity, index) => {
        if (index === spin.winnerIndex && spin.winnerInjected) {
          return spin.winner
        }
        if (advanced && isCellFullyHidden(index, currentRotation)) {
          return rarityForRoll(Math.random())
        }
        return rarity
      })
    )
  }

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
        setErrorMessage(
          parse?.error ?? `Roll request failed with status ${res.status}`
        )
        setIsRolling(false)
        return
      }

      const data = parse as RollResponse
      await mutate("/api/shop/balance", { balance: data.balance }, false)

      const currentAngle = ((rotation % 360) + 360) % 360
      const winnerIndex = Math.floor(Math.random() * CELL_COUNT)
      const edgePadding = 2
      const targetAngle =
        winnerIndex * CELL_SWEEP +
        edgePadding +
        Math.random() * (CELL_SWEEP - edgePadding * 2)
      const deltaToTarget = (targetAngle + currentAngle) % 360
      const nextRotation = rotation - FULL_SPINS * 360 - deltaToTarget

      activeSpin.current = {
        startRotation: rotation,
        endRotation: nextRotation,
        winnerIndex,
        winner: data.rarity,
        lastCellStep: 0,
        winnerInjected: false,
      }
      setCells(buildRandomCells())
      setRotation(nextRotation)

      window.setTimeout(() => {
        activeSpin.current = null
        setCells((currentCells) =>
          currentCells.map((rarity, index) =>
            index === winnerIndex ? data.rarity : rarity
          )
        )
        setPopupData(data)
        setShowPopup(true)
        setIsRolling(false)
      }, SPIN_DURATION * 1000)
    } catch (error) {
      console.error("Banner roll failed:", error)
      activeSpin.current = null
      setErrorMessage("Something went wrong while rolling.")
      setIsRolling(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-center px-4 pt-8">
        <div className="relative aspect-[2/1] w-full max-w-3xl">
          <svg
            aria-hidden="true"
            viewBox="0 0 638 319"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            {DOT_RINGS.map((ring, ringIndex) =>
              Array.from({ length: ring.count }, (_, index) => {
                const offset = (ringIndex * 0.37) % 1
                const angle =
                  Math.PI + ((index + offset) / ring.count) * Math.PI

                return (
                  <circle
                    key={`${ring.radius}-${index}`}
                    cx={319 + Math.cos(angle) * ring.radius}
                    cy={319 + Math.sin(angle) * ring.radius}
                    r={ring.size}
                    fill="var(--secondary)"
                    opacity={ring.opacity}
                  />
                )
              })
            )}
          </svg>

          <div className="absolute inset-0 z-10 overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-1/2 z-20 h-0 w-0 -translate-x-1/2 rotate-180 border-t-0 border-r-[12px] border-b-[18px] border-l-[12px] border-r-transparent border-b-white border-l-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]"
            />

            <motion.div
              animate={{ rotate: rotation }}
              onUpdate={(latest) => handleWheelUpdate(Number(latest.rotate))}
              transition={{
                duration: SPIN_DURATION,
                ease: [0.12, 0.8, 0.2, 1],
              }}
              className="absolute inset-x-0 top-0 aspect-square rounded-full"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: wheel,
                  WebkitMaskImage:
                    "radial-gradient(circle closest-side, transparent 0 60%, black 60% 95%, transparent 95%)",
                  maskImage:
                    "radial-gradient(circle closest-side, transparent 0 60%, black 60% 95%, transparent 95%)",
                }}
              />

              <Image
                src="/wheel.svg"
                alt=""
                width={638}
                height={638}
                priority
                className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none"
              />
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[42%] bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      </div>

      <Button
        type="button"
        onClick={handleRoll}
        disabled={isRolling}
        size="lg"
        className="z-20 h-14 rounded-lg"
      >
        <CrystalIcon size={25} className="text-white" />
        <p className="font-oswald text-xl font-semibold text-white uppercase">
          {isRolling ? "Rolling..." : `${toNumberWithCommas(ROLL_PRICE)} ROLL`}
        </p>
      </Button>

      {errorMessage && (
        <div className="px-4 py-2 text-sm text-red-200">{errorMessage}</div>
      )}

      <BannerOwnershipPopup
        open={showPopup && !!popupData}
        onClose={() => setShowPopup(false)}
        bannerId={popupData?.bannerId ?? null}
        rarity={popupData?.rarity ?? null}
        owned={popupData?.owned}
        refundAmount={
          popupData?.owned
            ? Math.round(
                (popupData.charged * popupData.rakeback) /
                  (1 - popupData.rakeback || 1)
              )
            : 0
        }
      />
    </div>
  )
}
