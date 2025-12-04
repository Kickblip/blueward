export function Multiplier({ multiplier }: { multiplier: number }) {
  let colorClass = "text-blue-100"

  if (multiplier >= 15) colorClass = "text-yellow-400"
  else if (multiplier >= 10) colorClass = "text-blue-600"
  else if (multiplier >= 5) colorClass = "text-blue-500"
  else if (multiplier >= 3) colorClass = "text-blue-400"
  else if (multiplier >= 2) colorClass = "text-blue-300"
  else if (multiplier >= 1.5) colorClass = "text-blue-200"

  return <p className={`${colorClass} text-xs tabular-nums`}>{multiplier.toFixed(2)}×</p>
}

export default function MarketCard({ market, outcomes }: { market: string; outcomes: { title: string; popularity: number }[] }) {
  return (
    <div className="flex flex-col gap-2 mx-6">
      <p className="text-sm font-semibold mb-0.5">{market}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-0.5 rounded-sm cursor-pointer
                      bg-blue-500/40 text-blue-200 text-xs
                      hover:text-white hover:bg-blue-500
                      transition-colors duration-200"
          >
            {outcomes[0].title}
          </button>
          <p className="text-zinc-300 font-medium text-sm">{(outcomes[0].popularity * 100).toFixed(0)}%</p>
        </div>
        <Multiplier multiplier={Math.max((1.0 / outcomes[0].popularity) * 0.85, 1.0)} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-0.5 rounded-sm cursor-pointer
                      bg-rose-500/40 text-rose-200 text-xs
                      hover:text-white hover:bg-rose-500
                      transition-colors duration-200"
          >
            {outcomes[1].title}
          </button>
          <p className="text-zinc-300 font-medium text-sm">{(outcomes[1].popularity * 100).toFixed(0)}%</p>
        </div>
        <Multiplier multiplier={Math.max((1.0 / outcomes[1].popularity) * 0.85, 1.0)} />
      </div>
    </div>
  )
}
