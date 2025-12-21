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
      <div className="grid grid-cols-8 gap-4 border-b pb-2 px-2 border-zinc-800 text-zinc-400 text-xs">
        <p className="col-span-3">Markets</p>
        <p className="col-span-2">Outcomes</p>
        <p>Popularity</p>
        <p>Payout</p>
        <p>Volume</p>
      </div>

      {markets.map((market, index) => (
        <MarketRow key={index} market={market} />
      ))}
    </div>
  )
}

export function MarketRow({
  market,
}: {
  market: { title: string; outcomes: { title: string; popularity: number; volume: number }[] }
}) {
  const o0 = market.outcomes[0]!
  const o1 = market.outcomes[1]!

  // ties will highlight both because of >=
  const o0PopWins = o0.popularity >= o1.popularity
  const o1PopWins = o1.popularity >= o0.popularity

  const o0VolWins = o0.volume >= o1.volume
  const o1VolWins = o1.volume >= o0.volume

  return (
    <div className="grid grid-cols-8 gap-4 py-2 px-4 hover:bg-zinc-900 items-center rounded transition-colors duration-200">
      <div className="col-span-3">
        <p className="text-zinc-200 text-xl font-oswald">{market.title}</p>
      </div>

      <div className="col-span-2 flex flex-col gap-2">
        <button className="col-span-2 bg-blue-900 hover:bg-blue-600 cursor-pointer transition-colors duration-200 text-zinc-200 text-sm py-1 rounded">
          {o0.title}
        </button>
        <button className="col-span-2 bg-zinc-800 hover:bg-zinc-600 cursor-pointer transition-colors duration-200 text-zinc-200 text-sm py-1 rounded">
          {o1.title}
        </button>
      </div>

      <div className="col-span-1 flex flex-col gap-4 text-sm">
        <p className={`${o0PopWins ? "text-blue-400" : "text-zinc-200"}`}>{(o0.popularity * 100).toFixed(0)}%</p>
        <p className={`${o1PopWins ? "text-blue-400" : "text-zinc-200"}`}>{(o1.popularity * 100).toFixed(0)}%</p>
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <Multiplier multiplier={Math.max((1.0 / o0.popularity) * 0.85, 1.0)} />
        <Multiplier multiplier={Math.max((1.0 / o1.popularity) * 0.85, 1.0)} />
      </div>

      <div className="col-span-1 flex flex-col gap-4 text-sm">
        <p className={`${o0VolWins ? "text-blue-400" : "text-zinc-200"}`}>{o0.volume}</p>
        <p className={`${o1VolWins ? "text-blue-400" : "text-zinc-200"}`}>{o1.volume}</p>
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

  return <p className={`${colorClass} text-sm tabular-nums`}>{multiplier.toFixed(2)}×</p>
}
