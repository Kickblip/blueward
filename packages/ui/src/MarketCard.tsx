import Card from "./Card"
import { VersusIcon } from "./icons"

export default function MarketCard({ market, outcomes }: { market: string; outcomes: { title: string; popularity: number }[] }) {
  return (
    <Card className="flex-row">
      <div className="flex flex-col items-center gap-4 w-full">
        <h3 className="text-lg font-semibold uppercase font-oswald">{market}</h3>

        <div className="flex items-center gap-4">
          <div
            className="px-3 py-1 rounded-md
                      bg-blue-500/40 text-md
                      uppercase font-oswald font-semibold
                      transition-colors duration-200"
          >
            {outcomes[0]!.title}
          </div>

          <VersusIcon className="text-zinc-300" />

          <div
            className="px-3 py-1 rounded-md
                      bg-rose-500/40 text-md
                      uppercase font-oswald font-semibold
                      transition-colors duration-200"
          >
            {outcomes[1]!.title}
          </div>
        </div>
      </div>
    </Card>
  )
}
