import Countdown from "../components/Countdown"

export default function Home() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col"></div>
      <div className="col-span-1 flex flex-col">
        <Countdown date={new Date(process.env.NEXT_PUBLIC_SEASON_END!)} />
      </div>
    </div>
  )
}
