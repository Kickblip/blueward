import { db } from "@/lib/db"
import { type RecentGameProps } from "@repo/ui/RecentGame"
import { desc, sql } from "drizzle-orm"
import { playerPerformances } from "@/lib/schema"
import { unstable_cache } from "next/cache"

export const FetchRecentGames = unstable_cache(
  async (limit = 3) => {
    "use server"

    const roleOrder: Record<string, number> = {
      TOP: 0,
      JUNGLE: 1,
      MIDDLE: 2,
      BOTTOM: 3,
      UTILITY: 4,
      FILL: 99,
    }

    const rows = await db.query.matches.findMany({
      columns: {
        matchId: true,
        gameEndTimestamp: true,
      },
      with: {
        performances: {
          columns: {
            riotIdGameName: true,
            championName: true,
            kills: true,
            deaths: true,
            assists: true,
            teamId: true,
            role: true,
          },
        },
      },
      orderBy: (m, { desc }) => [desc(m.gameEndTimestamp)],
      limit,
    })

    const games = rows.map((m) => ({
      matchId: m.matchId,
      gameEndTimestamp: m.gameEndTimestamp,
      players: m.performances
        .slice()
        .sort(
          (a, b) =>
            a.teamId - b.teamId ||
            (roleOrder[a.role] ?? 98) - (roleOrder[b.role] ?? 98) ||
            a.riotIdGameName.localeCompare(b.riotIdGameName),
        )
        .map((p): RecentGameProps["players"][number] => ({
          riotIdGameName: p.riotIdGameName,
          championName: p.championName,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
        })),
    }))

    return games
  },
  ["recent-games"],
  {
    tags: ["recent-games"],
  },
)

export type TopLadderPlayer = {
  riotIdGameName: string
  puuid: string
  gamesPlayed: number
  mmr: number
  winrate: number
}

export const FetchTopLadderPlayers = unstable_cache(
  async (limit = 15): Promise<TopLadderPlayer[]> => {
    "use server"

    const gamesPlayed = sql<number>`count(*)::int`
    const totalMmr = sql<number>`coalesce(sum(${playerPerformances.mmr}), 0)::int`
    const winrate = sql<number>`avg((${playerPerformances.win})::int)::float`
    const riotIdGameName = sql<string>`min(${playerPerformances.riotIdGameName})`

    const rows = await db
      .select({
        puuid: playerPerformances.puuid,
        riotIdGameName,
        gamesPlayed,
        mmr: totalMmr,
        winrate,
      })
      .from(playerPerformances)
      .groupBy(playerPerformances.puuid)
      .orderBy(desc(totalMmr))
      .limit(limit)

    return rows.map((r) => ({
      puuid: r.puuid,
      riotIdGameName: r.riotIdGameName,
      gamesPlayed: Number(r.gamesPlayed),
      mmr: Number(r.mmr),
      winrate: Number(r.winrate),
    }))
  },
  ["top-players-by-mmr"],
  {
    tags: ["top-players-by-mmr"],
  },
)
