import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export const statList = { kills: "Kills", deaths: "Deaths", assists: "Assists" } as const

export type StatKey = keyof typeof statList

export type LeaderboardRow = {
  puuid: string
  riotIdGameName: string
  value: number
  createdAt: string
  championName: string
}

export async function getTopPlayersForStat(stat: StatKey, limit = 15): Promise<LeaderboardRow[]> {
  const queries: Record<StatKey, (limit: number) => any> = {
    kills: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        kills AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY kills DESC, created_at DESC
      LIMIT ${limit};
    `,

    deaths: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        deaths AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY deaths DESC, created_at DESC
      LIMIT ${limit};
    `,

    assists: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        assists AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY assists DESC, created_at DESC
      LIMIT ${limit};
    `,
  }

  const result = await db.execute(queries[stat](limit))
  const rows = (result as any).rows as Array<{
    puuid: string
    riotIdGameName: string
    value: number | string
    createdAt: Date | string
    championName: string
  }>

  return rows.map((r) => ({
    puuid: r.puuid,
    riotIdGameName: r.riotIdGameName,
    value: Number(r.value),
    createdAt: new Date(r.createdAt).toISOString(),
    championName: r.championName,
  }))
}
