"use client"

import Card from "@repo/ui/Card"
import MarketCard from "@repo/ui/MarketCard"
import { toNumberWithCommas } from "@repo/ui/helpers"
import { CrystalIcon } from "@repo/ui/icons"
import { FaLongArrowAltRight } from "react-icons/fa"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { LuX } from "react-icons/lu"

const market = [
  {
    title: "How many kills will Saigo get?",
    outcomes: [
      { title: "Over 6.5", popularity: 0.77, volume: 7000 },
      { title: "Under 6.5", popularity: 0.23, volume: 3000 },
    ],
  },
  {
    title: "Will the game end in a draw?",
    outcomes: [
      { title: "Yes", popularity: 0.1, volume: 1000 },
      { title: "No", popularity: 0.9, volume: 9000 },
    ],
  },
  {
    title: "Which team will win?",
    outcomes: [
      { title: "Team A", popularity: 0.6, volume: 6000 },
      { title: "Team B", popularity: 0.4, volume: 4000 },
    ],
  },
  {
    title: "Will there be a pentakill?",
    outcomes: [
      { title: "Yes", popularity: 0.05, volume: 500 },
      { title: "No", popularity: 0.95, volume: 9500 },
    ],
  },
]

export default function Predictions() {
  const [leftIsBuying, setLeftIsBuying] = useState(false)
  const [rightIsBuying, setRightIsBuying] = useState(false)
  const [betAmount, setBetAmount] = useState(1000)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 grid grid-cols-1 gap-4">
        <MarketCard market={market[0]!.title} outcomes={market[0]!.outcomes} />
        <MarketCard market={market[1]!.title} outcomes={market[1]!.outcomes} />
        <MarketCard market={market[2]!.title} outcomes={market[2]!.outcomes} />
        <MarketCard market={market[3]!.title} outcomes={market[3]!.outcomes} />
      </div>
      <Card className="col-span-2 grid grid-cols-1 gap-4">
        <div className="flex flex-col items-center gap-4 w-full py-8 px-5">
          <h3 className="text-3xl font-semibold uppercase font-oswald mb-4">{market[0]!.title}</h3>

          <div className="w-full grid grid-cols-2 gap-4">
            <div className="col-span-1 grid grid-cols-1 gap-1">
              <MultiplierDisplay multiplier={Math.max((1.0 / market[0]!.outcomes[0]!.popularity) * 0.85, 1.0)} />

              <div className="h-10 mb-4 mt-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!leftIsBuying ? (
                    <motion.button
                      key="buy-button"
                      type="button"
                      onClick={() => setLeftIsBuying(true)}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center justify-center h-full w-full rounded-md
                              bg-blue-500/40 px-3 py-1
                              text-xl cursor-pointer uppercase font-oswald font-semibold
                              hover:bg-blue-500 transition-colors duration-200"
                    >
                      Buy {market[0]!.outcomes[0]!.title}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="purchase-input"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="h-full"
                    >
                      <PurchaseVolumeInput onClose={() => setLeftIsBuying(false)} amount={betAmount} setAmount={setBetAmount} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="font-oswald font-semibold text-left mb-1">
                Popularity {(market[0]!.outcomes[0]!.popularity * 100).toFixed(0)}%
              </p>
              <BuyerRow name="Player1" amount={8000} highestBet={8000} orientation="ltr" />
              <BuyerRow name="Player2" amount={3000} highestBet={8000} orientation="ltr" />
              <BuyerRow name="Player3" amount={2000} highestBet={8000} orientation="ltr" />
            </div>

            <div className="col-span-1 grid grid-cols-1 gap-1">
              <MultiplierDisplay multiplier={Math.max((1.0 / market[0]!.outcomes[1]!.popularity) * 0.85, 1.0)} />

              <div className="h-10 mb-4 mt-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!rightIsBuying ? (
                    <motion.button
                      key="buy-button"
                      type="button"
                      onClick={() => setRightIsBuying(true)}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center justify-center h-full w-full rounded-md
                              bg-rose-500/40 px-3 py-1
                              text-xl cursor-pointer uppercase font-oswald font-semibold
                              hover:bg-rose-500 transition-colors duration-200"
                    >
                      Buy {market[0]!.outcomes[1]!.title}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="purchase-input"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <PurchaseVolumeInput onClose={() => setRightIsBuying(false)} amount={betAmount} setAmount={setBetAmount} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="font-oswald font-semibold text-right mb-1">
                Popularity {(market[0]!.outcomes[1]!.popularity * 100).toFixed(0)}%
              </p>
              <BuyerRow name="Player1" amount={5000} highestBet={8000} orientation="rtl" />
              <BuyerRow name="Player2" amount={3000} highestBet={8000} orientation="rtl" />
              <BuyerRow name="Player3" amount={2000} highestBet={8000} orientation="rtl" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function PurchaseVolumeInput({
  onClose,
  amount,
  setAmount,
}: {
  onClose?: () => void
  amount: number
  setAmount: (amount: number) => void
}) {
  return (
    <div className="flex w-full h-full items-center gap-1 rounded-md bg-zinc-950 px-3 py-0.5">
      <CrystalIcon size={16} />

      <input
        type="text"
        value={amount}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/\D/g, "")
          setAmount(Number(e.target.value))
        }}
        className="flex-1 px-3 py-1.5 text-sm font-oswald font-semibold uppercase outline-none"
      />

      <button
        type="button"
        className="px-1 py-1.5 font-oswald text-sm font-semibold uppercase rounded-md hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
      >
        Buy
      </button>

      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors duration-200"
      >
        <LuX size={14} />
      </button>
    </div>
  )
}

export function MultiplierDisplay({ multiplier }: { multiplier: number }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-1">
        <CrystalIcon size={20} />
        <span className="text-xl font-oswald font-semibold">100</span>
      </div>

      <FaLongArrowAltRight className="text-zinc-500" />

      <div className="flex items-center gap-1">
        <CrystalIcon size={20} />
        <span className="text-xl font-oswald font-semibold text-lime-400">
          {toNumberWithCommas(Number((100 * multiplier).toFixed(0)))}
        </span>
      </div>
    </div>
  )
}

export function BuyerRow({
  name,
  amount,
  highestBet,
  orientation,
}: {
  name: string
  amount: number
  highestBet: number
  orientation: "ltr" | "rtl"
}) {
  const fillPercent = highestBet > 0 ? Math.min((amount / highestBet) * 70, 70) : 0

  return (
    <div className={`relative overflow-hidden rounded-md ${orientation === "rtl" ? "text-right" : "text-left"}`}>
      <div
        className={[
          "pointer-events-none absolute inset-y-0 rounded-sm",
          orientation === "rtl" ? "right-0" : "left-0",
          orientation === "rtl" ? "bg-rose-500/20" : "bg-blue-500/20",
        ].join(" ")}
        style={{ width: `${fillPercent}%` }}
      />

      <div
        className={`relative z-10 flex items-center justify-between px-3 py-1 text-xs ${
          orientation === "rtl" ? "flex-row-reverse" : ""
        }`}
      >
        <p className="truncate font-oswald font-semibold">{name}</p>
        <p className="flex items-center gap-1 font-semibold">
          <CrystalIcon />
          {toNumberWithCommas(amount)}
        </p>
      </div>
    </div>
  )
}
