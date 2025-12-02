import PodiumRow from "@/components/PodiumRow"

export default function FightClub() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        <PodiumRow size="large" ranking={1} winrate={65} played={120} mmr={2450} name="Mrbob21" />
        <PodiumRow size="small" ranking={2} winrate={58} played={98} mmr={2300} name="AceGamer" />
        <PodiumRow size="small" ranking={3} winrate={52} played={75} mmr={2200} name="NoobMaster" />
      </div>
    </div>
  )
}
