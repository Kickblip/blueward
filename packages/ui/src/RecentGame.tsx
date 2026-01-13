import Card from "./Card"
import Image from "next/image"
import { epochToRelativeTime } from "./helpers"

export type RecentGameProps = {
  players: { riotIdGameName: string; championName: string; kills: number; deaths: number; assists: number }[]
  gameEndTimestamp: number
}

export default function RecentGame({ players, gameEndTimestamp }: RecentGameProps) {
  const team1 = players.slice(0, players.length / 2)
  const team2 = players.slice(players.length / 2)

  return (
    <Card title="Recent Game" subtitle={epochToRelativeTime(gameEndTimestamp)}>
      <div className="flex flex-col gap-3 h-full">
        {team1.map((_, idx) => (
          <div className="flex h-1/5 items-center text-sm" key={idx}>
            <div className="flex flex-1 flex-col text-right pr-3">
              <p className="font-semibold truncate">{team1[idx]?.riotIdGameName}</p>
              <p className="opacity-80">{`${team1[idx]?.kills}/${team1[idx]?.deaths}/${team1[idx]?.assists}`}</p>
            </div>
            <div className="flex items-center gap-3 flex-none">
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${team1[idx]?.championName}_0.jpg`}
                alt=""
                width={40}
                height={40}
                className="rounded-sm"
              />
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${team2[idx]?.championName}_0.jpg`}
                alt=""
                width={40}
                height={40}
                className="rounded-sm"
              />
            </div>
            <div className="flex flex-1 flex-col text-left pl-3">
              <p className="font-semibold truncate">{team2[idx]?.riotIdGameName}</p>
              <p className="opacity-80">{`${team2[idx]?.kills}/${team2[idx]?.deaths}/${team2[idx]?.assists}`}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
