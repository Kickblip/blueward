import Card from "@repo/ui/Card"
import CrystalIcon from "@repo/ui/CrystalIcon"
import { FiChevronRight } from "react-icons/fi"

const markets = [
  {
    title: "Will Kickball get a shutdown kill?",
    outcomes: [
      { title: "Yes", popularity: 0.28, volume: 7800 },
      { title: "No", popularity: 0.72, volume: 3200 },
    ],
  },
  {
    title: "Which team will win?",
    outcomes: [
      { title: "Team 1", popularity: 0.5, volume: 6000 },
      { title: "Team 2", popularity: 0.5, volume: 6000 },
    ],
  },
  {
    title: "How many kills will Saigo get?",
    outcomes: [
      { title: "Over 6.5", popularity: 0.77, volume: 7000 },
      { title: "Under 6.5", popularity: 0.23, volume: 3000 },
    ],
  },
  {
    title: "Total game time?",
    outcomes: [
      { title: "Over 35:00", popularity: 0.8, volume: 8000 },
      { title: "Under 34:59", popularity: 0.2, volume: 2000 },
    ],
  },
  {
    title: "Will Kickball secure first blood?",
    outcomes: [
      { title: "Yes", popularity: 0.35, volume: 3500 },
      { title: "No", popularity: 0.65, volume: 6500 },
    ],
  },
  {
    title: "Which team will take first dragon?",
    outcomes: [
      { title: "Team 1", popularity: 0.55, volume: 5500 },
      { title: "Team 2", popularity: 0.45, volume: 4500 },
    ],
  },
  {
    title: "How many deaths will Kickball have?",
    outcomes: [
      { title: "Over 4.5", popularity: 0.4, volume: 4000 },
      { title: "Under 4.5", popularity: 0.6, volume: 6000 },
    ],
  },
  {
    title: "Will any player get a pentakill?",
    outcomes: [
      { title: "Yes", popularity: 0.12, volume: 1200 },
      { title: "No", popularity: 0.88, volume: 8800 },
    ],
  },
  {
    title: "Total kills in the game?",
    outcomes: [
      { title: "Over 45.5", popularity: 0.32, volume: 3200 },
      { title: "Under 45.5", popularity: 0.68, volume: 6800 },
    ],
  },
]

export default function Markets() {
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-3 gap-4">
        {markets.map((market, index) => (
          <MarketCard key={index} market={market} />
        ))}
      </div>
    </div>
  )
}

export function MarketCard({
  market,
}: {
  market: { title: string; outcomes: { title: string; popularity: number; volume: number }[] }
}) {
  const o0 = market.outcomes[0]!
  const o1 = market.outcomes[1]!

  return (
    <Card className="text-zinc-200">
      <div className="flex flex-col gap-1 mb-2">
        <p className="text-xs text-zinc-400">Market</p>
        <h2 className="text-md font-semibold">{market.title}</h2>
      </div>
      <OutcomeCard outcome={o0} marketTitle={market.title} />
      <OutcomeCard outcome={o1} marketTitle={market.title} />
    </Card>
  )
}

export function OutcomeCard({
  outcome,
  marketTitle,
}: {
  outcome: { title: string; popularity: number; volume: number }
  marketTitle: string
}) {
  return (
    <div className="w-full bg-zinc-950 p-3 flex flex-col gap-2 rounded-sm">
      {/* <p className="text-sm text-zinc-400 text-center">{marketTitle}</p> */}
      <p className="text-md text-center">{outcome.title}</p>

      <div className="mx-auto flex items-center gap-8">
        <div className="flex items-center gap-1 text-lg">
          <CrystalIcon />
          <span>100</span>
        </div>

        <div className="border border-zinc-900 border-1.5 p-1 rounded-full">
          <FiChevronRight size={16} />
        </div>

        <div className="flex items-center gap-1 text-lg">
          <CrystalIcon />
          <span className="text-green-200 font-semibold">
            {(Math.max((1.0 / outcome.popularity) * 0.85, 1.0) * 100).toFixed(0)}
          </span>
        </div>
      </div>

      <hr className="border-t border-zinc-900" />

      <div className="grid grid-cols-3 items-center">
        <div className="flex justify-center items-center gap-1 text-xs border-r border-zinc-900">
          <span className="text-zinc-400">Popularity:</span>
          <span className="font-semibold">{(outcome.popularity * 100).toFixed(0)}%</span>
        </div>

        <div className="flex justify-center border-r border-zinc-900">
          <Multiplier multiplier={Math.max((1.0 / outcome.popularity) * 0.85, 1.0)} />
        </div>

        <div className="flex justify-center items-center gap-1 text-xs">
          <span className="text-zinc-400">Volume:</span>
          <span className="font-semibold">{outcome.volume}</span>
        </div>
      </div>
    </div>
  )
}

export function Multiplier({ multiplier }: { multiplier: number }) {
  let colorClass = "text-blue-100"

  if (multiplier >= 15) colorClass = "text-yellow-400"
  else if (multiplier >= 10) colorClass = "text-blue-600"
  else if (multiplier >= 5) colorClass = "text-blue-500"
  else if (multiplier >= 3) colorClass = "text-blue-400"
  else if (multiplier >= 2) colorClass = "text-blue-300"
  else if (multiplier >= 1.5) colorClass = "text-blue-200"

  return <p className={`${colorClass} text-sm tabular-nums`}>+ {multiplier.toFixed(2)}×</p>
}
