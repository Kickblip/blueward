import Card from "./ui/Card"

export default function WagerCard({ market }: { market: string }) {
  return (
    <Card>
      <div className="w-full h-96">
        <p className="text-lg font-semibold font-oswald">{market}</p>
      </div>
    </Card>
  )
}
