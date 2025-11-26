import Countdown from "../components/Countdown"
import RecentGame from "@/components/RecentGame"
import PodiumRow from "@/components/PodiumRow"

export default function Home() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        <PodiumRow ranking={1} winrate={65} played={120} mmr={2450} name="Mrbob21" />
        <PodiumRow ranking={2} winrate={58} played={98} mmr={2300} name="AceGamer" />
        <PodiumRow ranking={3} winrate={52} played={75} mmr={2200} name="NoobMaster" />
      </div>
      <div className="col-span-1 flex flex-col gap-4">
        <Countdown date={new Date(process.env.NEXT_PUBLIC_SEASON_END!)} />
        <RecentGame />
      </div>
    </div>
  )
}
