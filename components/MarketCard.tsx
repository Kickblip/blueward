import Card from "./ui/Card"
import Badge from "./ui/Badge"
import { TbLivePhotoFilled } from "react-icons/tb"

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

export default function MarketCard({ market, outcomes }: { market: string; outcomes: { title: string; popularity: number }[] }) {
  return (
    <Card>
      <Badge>
        <TbLivePhotoFilled />
        <span className="text-xs">Live</span>
      </Badge>

      <p className="text-lg font-semibold mt-2 mb-1">{market}</p>

      <div className="flex gap-4 mx-auto">
        <button
          className="px-3 py-2 rounded-sm cursor-pointer
                      bg-blue-500/30 text-blue-300
                      hover:text-white hover:bg-blue-500
                      transition-colors duration-200"
        >
          {outcomes[0].title}
        </button>
        <button
          className="px-3 py-2 rounded-sm cursor-pointer
                      bg-red-500/30 text-red-300
                      hover:text-white hover:bg-red-500
                      transition-colors duration-200"
        >
          {outcomes[1].title}
        </button>
      </div>

      <div className="flex items-center gap-4 mx-auto">
        <Multiplier multiplier={Math.max((1.0 / outcomes[0].popularity) * 0.85, 1.0)} />
        <p className="text-zinc-300 font-semibold text-xl">{(outcomes[0].popularity * 100).toFixed(0)}%</p>
        <p className="text-zinc-300 font-semibold text-xl">{(outcomes[1].popularity * 100).toFixed(0)}%</p>
        <Multiplier multiplier={Math.max((1.0 / outcomes[1].popularity) * 0.85, 1.0)} />
      </div>
    </Card>
  )
}
