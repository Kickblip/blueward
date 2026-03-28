"use client"

import Card from "@repo/ui/Card"
import Loading from "@repo/ui/Loading"
import MarketCard from "@repo/ui/MarketCard"
import { toNumberWithCommas } from "@repo/ui/helpers"
import { CrystalIcon } from "@repo/ui/icons"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { FaLongArrowAltRight } from "react-icons/fa"
import { LuX } from "react-icons/lu"
import { mutate } from "swr"
import ErrorMessage from "@repo/ui/ErrorMessage"
import { getProjectedPredictionMultiplier } from "@repo/ui/config"

type MarketOrder = { name: string; amount: number }
type MarketOutcome = { title: string; popularity: number; volume: number; orders: MarketOrder[] }
type MarketPosition = { outcome1Amount: number; outcome2Amount: number }
type Market = {
  id: number
  title: string
  status: "OPEN" | "LOCKED" | "RESOLVED" | "CANCELLED"
  locksAt: string | null
  myPosition: MarketPosition
  outcomes: [MarketOutcome, MarketOutcome]
}

const anim = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.18, ease: "easeOut" as const },
}

const isActive = ({ status }: Market) => status === "OPEN" || status === "LOCKED"
const getDisplayStatus = ({ status, locksAt }: Market, now: number): "OPEN" | "LOCKED" =>
  status === "LOCKED" || (!!locksAt && new Date(locksAt).getTime() <= now) ? "LOCKED" : "OPEN"

const countdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

const combineOrders = (orders: MarketOrder[]) =>
  Object.values(
    orders.reduce<Record<string, MarketOrder>>(
      (acc, { name, amount }) => ((acc[name] = { name, amount: (acc[name]?.amount ?? 0) + amount }), acc),
      {},
    ),
  )

const syncBalance = (balance: number) => mutate("/api/shop/balance", { balance }, false)

export default function PredictionsClient() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [selected, setSelected] = useState(0)
  const [buying, setBuying] = useState<Record<1 | 2, boolean>>({ 1: false, 2: false })
  const [betAmount, setBetAmount] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<`buy-${1 | 2}` | `remove-${1 | 2}` | null>(null)

  const closeBuys = () => setBuying({ 1: false, 2: false })
  const setSideBuying = (id: 1 | 2, value: boolean) => setBuying((b) => ({ ...b, [id]: value }) as Record<1 | 2, boolean>)

  const loadMarkets = async () => {
    try {
      setError(null)
      const res = await fetch("/api/predictions/markets/get", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load markets")

      const { markets } = (await res.json()) as { markets: Market[] }
      const visible = markets.filter(isActive)
      setMarkets(markets)
      setSelected((i) => Math.min(i, Math.max(visible.length - 1, 0)))
    } catch (err) {
      console.error(err)
      setError("Failed to load markets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => void loadMarkets(), [])
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const visibleMarkets = markets.filter(isActive)
  const selectedMarket = visibleMarkets[selected]

  if (loading)
    return (
      <div className="flex items-center justify-center p-4">
        <Loading />
      </div>
    )
  if (!selectedMarket)
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <ErrorMessage code={"No active markets found"} message="Check back later" />
      </div>
    )

  const [leftOutcome, rightOutcome] = selectedMarket.outcomes
  const leftOrders = combineOrders(leftOutcome.orders)
  const rightOrders = combineOrders(rightOutcome.orders)
  const displayStatus = getDisplayStatus(selectedMarket, now)
  const msRemaining = selectedMarket.locksAt ? new Date(selectedMarket.locksAt).getTime() - now : 0
  const highestBet = Math.max(0, ...[...leftOrders, ...rightOrders].map(({ amount }) => amount))
  const leftMyAmount = selectedMarket.myPosition.outcome1Amount
  const rightMyAmount = selectedMarket.myPosition.outcome2Amount

  const placeBet = async (outcome: 1 | 2) => {
    if (getDisplayStatus(selectedMarket, Date.now()) !== "OPEN") return setError("This market is no longer open")
    if (!Number.isInteger(betAmount) || betAmount <= 0) return setError("Enter a valid amount")

    try {
      setSubmitting(`buy-${outcome}`)
      setError(null)

      const res = await fetch(`/api/predictions/markets/${selectedMarket.id}/position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PLACED", outcome, amount: betAmount }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to place bet")

      await syncBalance(data.balance)
      closeBuys()
      await loadMarkets()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to place bet")
    } finally {
      setSubmitting(null)
    }
  }

  const removeBet = async (outcome: 1 | 2, amount: number) => {
    if (getDisplayStatus(selectedMarket, Date.now()) !== "OPEN") return setError("This market is no longer open")
    if (!Number.isInteger(amount) || amount <= 0) return setError("No open bet to remove")

    try {
      setSubmitting(`remove-${outcome}`)
      setError(null)

      const res = await fetch(`/api/predictions/markets/${selectedMarket.id}/position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLOSED", outcome, amount }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to remove bet")

      await syncBalance(data.balance)
      closeBuys()
      setBetAmount(0)
      await loadMarkets()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to remove bet")
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 grid gap-4">
        {visibleMarkets.map((market, i) => {
          const status = getDisplayStatus(market, now)

          return (
            <div
              key={market.id}
              onClick={() => {
                setSelected(i)
                closeBuys()
                setError(null)
              }}
              className="cursor-pointer"
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase text-zinc-400">{status}</span>
                {status === "OPEN" && market.locksAt && (
                  <span className="text-xs font-semibold uppercase text-zinc-500">
                    {countdown(new Date(market.locksAt).getTime() - now)}
                  </span>
                )}
              </div>

              <MarketCard market={market.title} outcomes={market.outcomes} highlighted={selected === i} />
            </div>
          )
        })}
      </div>

      <Card className="col-span-2 grid gap-4">
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="mb-2 flex w-full items-end justify-between text-left font-oswald text-3xl font-semibold uppercase">
            <div className="flex flex-col gap-1">
              <h3>{selectedMarket.title}</h3>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase text-zinc-500">
                <span>{displayStatus}</span>
                {displayStatus === "OPEN" && <span>{countdown(msRemaining)}</span>}
              </div>
            </div>

            <h5 className="flex items-center gap-1 text-sm text-zinc-600">
              <CrystalIcon className="mt-0.5 text-zinc-600" />
              {toNumberWithCommas(leftOutcome.volume + rightOutcome.volume)} Vol
            </h5>
          </div>

          {error && <div className="w-full rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}

          <div className="grid w-full grid-cols-2 gap-4">
            {[
              { id: 1 as const, side: "left" as const, outcome: leftOutcome, orders: leftOrders },
              { id: 2 as const, side: "right" as const, outcome: rightOutcome, orders: rightOrders },
            ].map(({ id, side, outcome, orders }) => (
              <OutcomeColumn
                key={id}
                side={side}
                outcome={outcome}
                orders={orders}
                myOpenAmount={id === 1 ? leftMyAmount : rightMyAmount}
                oppositeOpenAmount={id === 1 ? rightMyAmount : leftMyAmount}
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                isBuying={buying[id]}
                setIsBuying={(value) => setSideBuying(id, value)}
                displayStatus={displayStatus}
                onSubmit={() => placeBet(id)}
                onRemove={() => removeBet(id, id === 1 ? leftMyAmount : rightMyAmount)}
                isSubmittingBuy={submitting === `buy-${id}`}
                isSubmittingRemove={submitting === `remove-${id}`}
                highestBet={highestBet}
                marketId={selectedMarket.id}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function OutcomeColumn({
  side,
  outcome,
  orders,
  myOpenAmount,
  oppositeOpenAmount,
  betAmount,
  setBetAmount,
  isBuying,
  setIsBuying,
  displayStatus,
  onSubmit,
  onRemove,
  isSubmittingBuy,
  isSubmittingRemove,
  highestBet,
  marketId,
}: {
  side: "left" | "right"
  outcome: MarketOutcome
  orders: MarketOrder[]
  myOpenAmount: number
  oppositeOpenAmount: number
  betAmount: number
  setBetAmount: (amount: number) => void
  isBuying: boolean
  setIsBuying: (value: boolean) => void
  displayStatus: "OPEN" | "LOCKED"
  onSubmit: () => void
  onRemove: () => void
  isSubmittingBuy: boolean
  isSubmittingRemove: boolean
  highestBet: number
  marketId: number
}) {
  const left = side === "left"
  const canBuy = displayStatus === "OPEN" && (myOpenAmount > 0 || oppositeOpenAmount === 0)
  const blockedByOtherSide = oppositeOpenAmount > 0 && myOpenAmount === 0
  const isSelling = myOpenAmount > 0

  return (
    <div className="grid content-start gap-1">
      <MultiplierDisplay initial={betAmount} multiplier={getProjectedPredictionMultiplier(outcome.popularity)} />

      <div className="mb-4 mt-2 min-h-10">
        <AnimatePresence mode="wait" initial={false}>
          {isBuying ? (
            <motion.div key={`${side}-input`} {...anim} className="h-full">
              <PurchaseVolumeInput
                onClose={() => setIsBuying(false)}
                amount={betAmount}
                setAmount={setBetAmount}
                side={side}
                onSubmit={onSubmit}
                isSubmitting={isSubmittingBuy}
              />
            </motion.div>
          ) : (
            <motion.div key={`${side}-actions`} {...anim} className="grid gap-2">
              <button
                type="button"
                onClick={() => (isSelling ? onRemove() : setIsBuying(true))}
                disabled={!canBuy}
                className={`flex h-10 w-full items-center justify-center rounded-md px-3 py-1 text-xl font-oswald font-semibold uppercase transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  left ? "bg-blue-500/70 hover:bg-blue-500" : "bg-rose-500/70 hover:bg-rose-500"
                }`}
              >
                {isSelling ? (isSubmittingRemove ? "Selling..." : `Sell ${outcome.title}`) : `Buy ${outcome.title}`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className={`mb-1 text-sm font-semibold ${left ? "text-left" : "text-right"}`}>
        Popularity {(outcome.popularity * 100).toFixed(0)}%
      </p>

      {orders.map((order) => (
        <BuyerRow
          key={`${side}-${marketId}-${order.name}-${order.amount}`}
          name={order.name}
          amount={order.amount}
          highestBet={highestBet}
          orientation={left ? "ltr" : "rtl"}
          multiplier={getProjectedPredictionMultiplier(outcome.popularity)}
        />
      ))}
    </div>
  )
}

export function PurchaseVolumeInput({
  onClose,
  amount,
  setAmount,
  side,
  onSubmit,
  isSubmitting,
}: {
  onClose?: () => void
  amount: number
  setAmount: (amount: number) => void
  side: "left" | "right"
  onSubmit: () => void
  isSubmitting?: boolean
}) {
  return (
    <div
      className={`flex h-full w-full items-center gap-1 rounded-md px-3 py-0.5 ${side === "left" ? "bg-blue-500/30" : "bg-rose-500/30"}`}
    >
      <CrystalIcon size={16} />
      <input
        type="text"
        value={toNumberWithCommas(amount)}
        onChange={({ target: { value } }) => setAmount(Number(value.replace(/\D/g, "")) || 0)}
        className="flex-1 px-3 py-1.5 text-sm font-oswald font-semibold uppercase outline-none"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || amount <= 0}
        className="cursor-pointer rounded-md px-1 py-1.5 text-sm font-oswald font-semibold uppercase transition-colors duration-200 hover:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Buying..." : "Buy"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-zinc-400 transition-colors duration-200 hover:bg-zinc-950/20 hover:text-zinc-200"
      >
        <LuX size={14} />
      </button>
    </div>
  )
}

export function MultiplierDisplay({
  initial,
  multiplier,
  orientation = "ltr",
  size = "medium",
}: {
  initial: number
  multiplier: number
  orientation?: "ltr" | "rtl"
  size?: "small" | "medium"
}) {
  const value = Math.max(100, Math.min(10000000000, initial))

  return (
    <div className={["flex items-center justify-center", size === "small" ? "gap-1.5" : "gap-4"].join(" ")}>
      <div className="flex items-center gap-1">
        <CrystalIcon size={size === "small" ? 12 : 20} />
        <span className={size === "small" ? "text-sm" : "text-xl font-oswald font-semibold"}>{toNumberWithCommas(value)}</span>
      </div>
      <FaLongArrowAltRight className="text-zinc-500" />
      <div className="flex items-center gap-1">
        <CrystalIcon size={size === "small" ? 12 : 20} />
        <span className={`text-lime-400 ${size === "small" ? "text-sm" : "text-xl font-oswald font-semibold"} `}>
          {toNumberWithCommas(Number((value * multiplier).toFixed(0)))}
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
  multiplier,
}: {
  name: string
  amount: number
  highestBet: number
  orientation: "ltr" | "rtl"
  multiplier: number
}) {
  const rtl = orientation === "rtl"
  const width = highestBet > 0 ? Math.min((amount / highestBet) * 70, 70) : 0

  return (
    <div className={`relative overflow-hidden rounded-md ${rtl ? "text-right" : "text-left"}`}>
      <div
        className={`pointer-events-none absolute inset-y-0 rounded-sm ${rtl ? "right-0 bg-rose-500/20" : "left-0 bg-blue-500/20"}`}
        style={{ width: `${width}%` }}
      />
      <div className={`relative z-10 flex items-center justify-between px-3 py-1 text-xs ${rtl ? "flex-row-reverse" : ""}`}>
        <p className="truncate font-semibold">{name}</p>
        <div className="flex items-center gap-1 font-semibold">
          {/* <CrystalIcon />

          {toNumberWithCommas(amount)} */}

          <MultiplierDisplay initial={amount} multiplier={multiplier} orientation={orientation} size={"small"} />
        </div>
      </div>
    </div>
  )
}
