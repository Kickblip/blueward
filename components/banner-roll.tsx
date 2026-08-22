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
import { BannerBackground } from "./banner-background"
import { BannerOwnershipPopup } from "./banner-ownership-popup"
import { CardBody, CardContainer, CardItem } from "./ui/3d-card"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { FaCircleInfo } from "react-icons/fa6"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { HiMiniSquare2Stack } from "react-icons/hi2"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { BANNER_CONFIG, HORIZONS_SET_LIST } from "@/lib/config"

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

    try {
      const res = await fetch("/api/shop/banners/roll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const parse = await res.json()

      if (!res.ok) {
        toast.error(
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
      toast.error("Something went wrong while rolling.")
      setIsRolling(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-50 max-w-lg text-left">
        <h2 className="font-oswald text-3xl font-semibold uppercase">
          Limited Banners
        </h2>

        <p className="text-sm text-muted-foreground">
          New ultimate animated banner on base set
        </p>

        <Button
          onClick={handleRoll}
          disabled={isRolling}
          size="lg"
          className="mt-4 w-full"
        >
          <CrystalIcon size={25} className="text-white" />
          <p className="font-oswald text-xl font-semibold text-white uppercase">
            {isRolling
              ? "Rolling..."
              : `${toNumberWithCommas(ROLL_PRICE)} ROLL`}
          </p>
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="font-oswald font-semibold text-muted-foreground uppercase"
            >
              <HiMiniSquare2Stack />
              View set list
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-7xl">
            <DialogHeader>
              <DialogTitle className="font-oswald text-4xl font-semibold uppercase">
                Available Banners
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto px-6 py-6">
              {(
                ["ultimate", "legendary", "epic", "rare", "common"] as const
              ).map((rarity) => {
                const banners = Array.from(
                  new Set([
                    ...HORIZONS_SET_LIST.rollable,
                    HORIZONS_SET_LIST.featured,
                  ])
                )
                  .map((id) => ({
                    id,
                    ...BANNER_CONFIG[id as keyof typeof BANNER_CONFIG],
                  }))
                  .filter((banner) => banner.rarity === rarity)

                if (banners.length === 0) return null

                return (
                  <div key={rarity} className="mb-8 last:mb-0">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={[
                          "h-3 w-3 rounded-full",
                          rarity === "ultimate" && "bg-yellow-300",
                          rarity === "legendary" && "bg-red-400",
                          rarity === "epic" && "bg-purple-400",
                          rarity === "rare" && "bg-sky-400",
                          rarity === "common" && "bg-lime-500",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      <h4 className="font-oswald text-2xl font-semibold uppercase">
                        {rarity}
                      </h4>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {banners.map((banner) => {
                        return (
                          <div
                            key={banner.id}
                            className="overflow-hidden rounded-md"
                          >
                            <BannerBackground bannerId={banner.id}>
                              <div className="relative aspect-[2/1] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-3">
                                  <p className="line-clamp-2 font-oswald text-lg leading-tight font-semibold text-white uppercase">
                                    {banner.name}
                                  </p>
                                </div>
                              </div>
                            </BannerBackground>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="font-oswald font-semibold text-muted-foreground uppercase"
            >
              <FaCircleInfo />
              View Rates
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex flex-col gap-1">
              {Object.entries(RARITY_RATES).map(([rarity, rate]) => (
                <div
                  key={rarity}
                  className="flex justify-between gap-6 capitalize"
                >
                  <span>{rarity}</span>
                  <span>{Number((rate * 100).toFixed(2))}%</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center justify-center px-4 pt-8">
        <div className="relative aspect-[5/3] w-full max-w-3xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[8%] left-1/2 h-[55%] w-[72%] -translate-x-1/2 rounded-full bg-chart-2/25 blur-3xl"
          />

          <svg
            aria-hidden="true"
            viewBox="0 0 638 383"
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

          <CardContainer
            containerClassName="absolute inset-x-0 bottom-2 z-40 mx-auto w-full max-w-xl px-6 py-0"
            className="w-full"
          >
            <CardBody className="relative h-auto w-full">
              <CardItem className="w-full" translateZ={60}>
                <BannerBackground bannerId={119}>
                  <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border-1 border-yellow-100/60 shadow-[0_0_60px_rgba(245,241,11,0.35),0_24px_60px_rgba(0,0,0,0.55)]" />
                </BannerBackground>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </div>

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
