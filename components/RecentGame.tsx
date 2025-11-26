import Card from "./ui/Card"
import Image from "next/image"

const champBase = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons"

const playerNames = [
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
  "Player 5",
  "Player 6",
  "Player 7",
  "Player 8",
  "Player 9",
  "Player 10",
]

const champIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function RecentGame() {
  const team1 = playerNames.slice(0, playerNames.length / 2)
  const team2 = playerNames.slice(playerNames.length / 2)

  return (
    <Card title="Recent Game" subtitle="30 days ago">
      <div className="flex flex-col gap-2 h-full">
        {team1.map((_, idx) => (
          <div className="flex h-1/5 items-center text-sm" key={idx}>
            <div className="flex flex-1 flex-col text-right pr-3">
              <p className="font-semibold truncate">{team1[idx]}</p>
              <p className="opacity-80">0/0/0</p>
            </div>
            <div className="flex items-center gap-2 flex-none">
              <Image src={`${champBase}/${champIds[idx]}.png`} alt="" width={40} height={40} />
              <Image src={`${champBase}/${champIds[idx + team1.length]}.png`} alt="" width={40} height={40} />
            </div>
            <div className="flex flex-1 flex-col text-left pl-3">
              <p className="font-semibold truncate">{team2[idx]}</p>
              <p className="opacity-80">0/0/0</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
