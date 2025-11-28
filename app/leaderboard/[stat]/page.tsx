import LeaderboardRow from "@/components/LeaderboardRow"
import PodiumRow from "@/components/PodiumRow"
import LeaderboardSelector from "@/components/LeaderboardSelector"
import { statList } from "../constants"

export default async function Leaderboard({ params }: { params: Promise<{ stat: string }> }) {
  const { stat } = await params

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1 flex flex-col gap-4">
        <LeaderboardSelector statList={statList} currentSlug={stat} />
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <PodiumRow size="large" ranking={1} winrate={65} played={120} mmr={2450} name="Mrbob21" championKey="Ezreal" />
        <PodiumRow size="large" ranking={2} winrate={58} played={98} mmr={2300} name="AceGamer" championKey="Mel" />
        <PodiumRow size="large" ranking={3} winrate={52} played={75} mmr={2200} name="NoobMaster" championKey="Twitch" />
        <LeaderboardRow ranking={4} winrate={48} played={60} mmr={2100} name="ProPlayer" />
        <LeaderboardRow ranking={5} winrate={45} played={55} mmr={2000} name="CasualGamer" />
        <LeaderboardRow ranking={6} winrate={42} played={50} mmr={1900} name="Rookie123" />
        <LeaderboardRow ranking={7} winrate={40} played={45} mmr={1800} name="GamerGirl" />
        <LeaderboardRow ranking={8} winrate={38} played={40} mmr={1700} name="Speedster" />
        <LeaderboardRow ranking={9} winrate={35} played={35} mmr={1600} name="SharpShooter" />
        <LeaderboardRow ranking={10} winrate={32} played={30} mmr={1500} name="StealthNinja" />
      </div>
    </div>
  )
}
