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
      {
        title: "Over 6.5",
        popularity: 0.77,
        volume: 7000,
        orders: [
          { name: "Player1", amount: 5000 },
          { name: "Player2", amount: 2000 },
        ],
      },
      {
        title: "Under 6.5",
        popularity: 0.23,
        volume: 3000,
        orders: [
          { name: "Player3", amount: 1800 },
          { name: "Player4", amount: 1200 },
        ],
      },
    ],
  },
  {
    title: "Will the game end in a draw?",
    outcomes: [
      {
        title: "Yes",
        popularity: 0.1,
        volume: 1000,
        orders: [
          { name: "Player5", amount: 600 },
          { name: "Player6", amount: 400 },
        ],
      },
      {
        title: "No",
        popularity: 0.9,
        volume: 9000,
        orders: [
          { name: "Player1", amount: 4500 },
          { name: "Player2", amount: 2500 },
          { name: "Player7", amount: 2000 },
        ],
      },
    ],
  },
  {
    title: "Which team will win?",
    outcomes: [
      {
        title: "Team A",
        popularity: 0.6,
        volume: 6000,
        orders: [
          { name: "Player8", amount: 3000 },
          { name: "Player9", amount: 1800 },
          { name: "Player10", amount: 1200 },
        ],
      },
      {
        title: "Team B",
        popularity: 0.4,
        volume: 4000,
        orders: [
          { name: "Player11", amount: 2200 },
          { name: "Player12", amount: 1000 },
          { name: "Player13", amount: 800 },
        ],
      },
    ],
  },
  {
    title: "Will there be a pentakill?",
    outcomes: [
      {
        title: "Yes",
        popularity: 0.05,
        volume: 500,
        orders: [
          { name: "Player14", amount: 300 },
          { name: "Player15", amount: 200 },
        ],
      },
      {
        title: "No",
        popularity: 0.95,
        volume: 9500,
        orders: [
          { name: "Player3", amount: 4000 },
          { name: "Player4", amount: 3000 },
          { name: "Player16", amount: 2500 },
        ],
      },
    ],
  },
]

export default function Predictions() {
  const [selectedMarketIndex, setSelectedMarketIndex] = useState(0)
  const [leftIsBuying, setLeftIsBuying] = useState(false)
  const [rightIsBuying, setRightIsBuying] = useState(false)
  const [betAmount, setBetAmount] = useState(1000)

  const selectedMarket = market[selectedMarketIndex]!

  const leftOutcome = selectedMarket.outcomes[0]!
  const rightOutcome = selectedMarket.outcomes[1]!

  const marketHighestBet = Math.max(
    0,
    ...selectedMarket.outcomes.flatMap((outcome) => outcome.orders.map((order) => order.amount)),
  )

  const handleSelectMarket = (index: number) => {
    setSelectedMarketIndex(index)
    setLeftIsBuying(false)
    setRightIsBuying(false)
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 grid grid-cols-1 gap-4">
        <div onClick={() => handleSelectMarket(0)}>
          <MarketCard market={market[0]!.title} outcomes={market[0]!.outcomes} highlighted={selectedMarketIndex === 0} />
        </div>
        <div onClick={() => handleSelectMarket(1)}>
          <MarketCard market={market[1]!.title} outcomes={market[1]!.outcomes} highlighted={selectedMarketIndex === 1} />
        </div>
        <div onClick={() => handleSelectMarket(2)}>
          <MarketCard market={market[2]!.title} outcomes={market[2]!.outcomes} highlighted={selectedMarketIndex === 2} />
        </div>
        <div onClick={() => handleSelectMarket(3)}>
          <MarketCard market={market[3]!.title} outcomes={market[3]!.outcomes} highlighted={selectedMarketIndex === 3} />
        </div>
      </div>
      <Card className="col-span-2 grid grid-cols-1 gap-4">
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="flex items-end justify-between w-full text-left uppercase font-oswald text-3xl font-semibold mb-2">
            <h3>{selectedMarket.title}</h3>
            <h5 className="flex items-center gap-1 text-zinc-600 text-sm">
              <CrystalIcon className="text-zinc-600 mt-0.5" />
              {toNumberWithCommas(leftOutcome.volume + rightOutcome.volume)} Vol
            </h5>
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <div className="col-span-1 grid grid-cols-1 content-start gap-1">
              <MultiplierDisplay initial={betAmount} multiplier={Math.max((1.0 / leftOutcome.popularity) * 0.85, 1.0)} />

              <div className="h-10 mb-4 mt-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!leftIsBuying ? (
                    <motion.button
                      key={`left-buy-button`}
                      type="button"
                      onClick={() => setLeftIsBuying(true)}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center justify-center h-full w-full rounded-md
                              bg-blue-500/70 px-3 py-1
                              text-xl cursor-pointer uppercase font-oswald font-semibold
                              hover:bg-blue-500 transition-colors duration-200"
                    >
                      Buy {leftOutcome.title}
                    </motion.button>
                  ) : (
                    <motion.div
                      key={`left-purchase-input`}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="h-full"
                    >
                      <PurchaseVolumeInput
                        onClose={() => setLeftIsBuying(false)}
                        amount={betAmount}
                        setAmount={setBetAmount}
                        side="left"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="font-semibold text-left text-sm mb-1">Popularity {(leftOutcome.popularity * 100).toFixed(0)}%</p>

              {leftOutcome.orders.map((order, index) => (
                <BuyerRow
                  key={`left-${selectedMarketIndex}-${order.name}-${order.amount}`}
                  name={order.name}
                  amount={order.amount}
                  highestBet={marketHighestBet}
                  orientation="ltr"
                />
              ))}
            </div>

            <div className="col-span-1 grid grid-cols-1 content-start gap-1">
              <MultiplierDisplay initial={betAmount} multiplier={Math.max((1.0 / rightOutcome.popularity) * 0.85, 1.0)} />

              <div className="h-10 mb-4 mt-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!rightIsBuying ? (
                    <motion.button
                      key={`right-buy-button`}
                      type="button"
                      onClick={() => setRightIsBuying(true)}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center justify-center h-full w-full rounded-md
                              bg-rose-500/70 px-3 py-1
                              text-xl cursor-pointer uppercase font-oswald font-semibold
                              hover:bg-rose-500 transition-colors duration-200"
                    >
                      Buy {rightOutcome.title}
                    </motion.button>
                  ) : (
                    <motion.div
                      key={`right-purchase-input`}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="h-full"
                    >
                      <PurchaseVolumeInput
                        onClose={() => setRightIsBuying(false)}
                        amount={betAmount}
                        setAmount={setBetAmount}
                        side="right"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="font-semibold text-right mb-1 text-sm">Popularity {(rightOutcome.popularity * 100).toFixed(0)}%</p>

              {rightOutcome.orders.map((order, index) => (
                <BuyerRow
                  key={`right-${selectedMarketIndex}-${order.name}-${order.amount}`}
                  name={order.name}
                  amount={order.amount}
                  highestBet={marketHighestBet}
                  orientation="rtl"
                />
              ))}
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
  side,
}: {
  onClose?: () => void
  amount: number
  setAmount: (amount: number) => void
  side: "left" | "right"
}) {
  return (
    <div
      className={`flex w-full h-full items-center gap-1 rounded-md px-3 py-0.5 ${side === "left" ? "bg-blue-500/30" : "bg-rose-500/30"}`}
    >
      <CrystalIcon size={16} />

      <input
        type="text"
        value={toNumberWithCommas(amount)}
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
        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-950/20 hover:text-zinc-200 transition-colors duration-200"
      >
        <LuX size={14} />
      </button>
    </div>
  )
}

export function MultiplierDisplay({ initial, multiplier }: { initial: number; multiplier: number }) {
  initial = Math.max(100, Math.min(10000000000, initial))

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-1">
        <CrystalIcon size={20} />
        <span className="text-xl font-oswald font-semibold">{toNumberWithCommas(initial)}</span>
      </div>

      <FaLongArrowAltRight className="text-zinc-500" />

      <div className="flex items-center gap-1">
        <CrystalIcon size={20} />
        <span className="text-xl font-oswald font-semibold text-lime-400">
          {toNumberWithCommas(Number((initial * multiplier).toFixed(0)))}
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
        <p className="truncate font-semibold">{name}</p>
        <p className="flex items-center gap-1 font-semibold">
          <CrystalIcon />
          {toNumberWithCommas(amount)}
        </p>
      </div>
    </div>
  )
}
