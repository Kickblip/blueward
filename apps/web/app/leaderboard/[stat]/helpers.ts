import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

// slug: display name
export const statList = {
  kills: "Kills",
  deaths: "Deaths",
  assists: "Assists",
  cs: "CS",
  visionscore: "Vision Score",
  missingpings: "Missing Pings",
  crit: "Largest Critical Strikes",
  buffsteals: "Buffs Stolen",
  heals: "Heals on Allies",
  mitigated: "Damage Self-mitigated",
  turretdamage: "Turret Damage",
  turretplates: "Turret Plates",
} as const

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

    cs: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        total_minions_killed AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY total_minions_killed DESC, created_at DESC
      LIMIT ${limit};
    `,

    visionscore: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        vision_score AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY vision_score DESC, created_at DESC
      LIMIT ${limit};
    `,

    missingpings: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        enemy_missing_pings AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY enemy_missing_pings DESC, created_at DESC
      LIMIT ${limit};
    `,

    crit: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        largest_critical_strike AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY largest_critical_strike DESC, created_at DESC
      LIMIT ${limit};
    `,

    buffsteals: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        buffs_stolen AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY buffs_stolen DESC, created_at DESC
      LIMIT ${limit};
    `,

    heals: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        total_heals_on_teammates AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY total_heals_on_teammates DESC, created_at DESC
      LIMIT ${limit};
    `,

    mitigated: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        damage_self_mitigated AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY damage_self_mitigated DESC, created_at DESC
      LIMIT ${limit};
    `,

    turretdamage: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        damage_dealt_to_turrets AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY damage_dealt_to_turrets DESC, created_at DESC
      LIMIT ${limit};
    `,

    turretplates: (limit) => sql`
      SELECT
        puuid,
        riot_id_game_name AS "riotIdGameName",
        turret_plates_taken AS value,
        created_at AS "createdAt",
        champion_name AS "championName"
      FROM player_performances
      ORDER BY turret_plates_taken DESC, created_at DESC
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
