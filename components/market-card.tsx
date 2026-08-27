import { Card } from "./ui/card"
import { VersusIcon } from "@/lib/icons"

export function MarketCard({
  market,
  outcomes,
  highlighted = false,
}: {
  market: string
  outcomes: {
    title: string
    popularity: number
    orders: { name: string; amount: number }[]
  }[]
  highlighted?: boolean
}) {
  return (
    <Card className={"flex-row" + (highlighted ? " border-zinc-500" : "")}>
      <div className="flex w-full flex-col items-center gap-4">
        <h3 className="font-oswald text-lg font-semibold uppercase">
          {market}
        </h3>

        <div className="flex items-center gap-4">
          <div className="text-md rounded-md bg-blue-500/40 px-3 py-1 font-oswald font-semibold uppercase transition-colors duration-200">
            {outcomes[0]!.title}
          </div>

          <VersusIcon className="text-zinc-300" />

          <div className="text-md rounded-md bg-rose-500/40 px-3 py-1 font-oswald font-semibold uppercase transition-colors duration-200">
            {outcomes[1]!.title}
          </div>
        </div>
      </div>
    </Card>
  )
}
