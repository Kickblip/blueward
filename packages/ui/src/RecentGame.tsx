import Card from "./Card"
import Image from "next/image"
import { epochToRelativeTime } from "./helpers"
import Link from "next/link"

export type RecentGameProps = {
  players: { riotIdGameName: string; championName: string; kills: number; deaths: number; assists: number; puuid: string }[]
  gameEndTimestamp: number
  interactive?: boolean
}

export default function RecentGame({ players, gameEndTimestamp, interactive = true }: RecentGameProps) {
  const team1 = players.slice(0, players.length / 2)
  const team2 = players.slice(players.length / 2)

  return (
    <Card title="Recent Game" subtitle={epochToRelativeTime(gameEndTimestamp)}>
      <div className="flex flex-col gap-3 h-full">
        {team1.map((_, idx) => (
          <div className="flex h-1/5 items-center text-sm" key={idx}>
            {interactive ? (
              <Link
                href={`/player/${team1[idx]?.puuid.substring(0, 20)}`}
                className="hover:text-blue-400 transition-colors duration-200 flex flex-1 flex-col text-right pr-3"
              >
                <p className="font-semibold truncate">{team1[idx]?.riotIdGameName}</p>
                <p className="text-zinc-400">{`${team1[idx]?.kills}/${team1[idx]?.deaths}/${team1[idx]?.assists}`}</p>
              </Link>
            ) : (
              <div className="flex flex-1 flex-col text-right pr-3">
                <p className="font-semibold truncate">{team1[idx]?.riotIdGameName}</p>
                <p className="text-zinc-400">{`${team1[idx]?.kills}/${team1[idx]?.deaths}/${team1[idx]?.assists}`}</p>
              </div>
            )}

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

            {interactive ? (
              <Link
                href={`/player/${team2[idx]?.puuid.substring(0, 20)}`}
                className="hover:text-blue-400 transition-colors duration-200 flex flex-1 flex-col text-left pl-3"
              >
                <p className="font-semibold truncate">{team2[idx]?.riotIdGameName}</p>
                <p className="text-zinc-400">{`${team2[idx]?.kills}/${team2[idx]?.deaths}/${team2[idx]?.assists}`}</p>
              </Link>
            ) : (
              <div className="flex flex-1 flex-col text-left pl-3">
                <p className="font-semibold truncate">{team2[idx]?.riotIdGameName}</p>
                <p className="text-zinc-400">{`${team2[idx]?.kills}/${team2[idx]?.deaths}/${team2[idx]?.assists}`}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
