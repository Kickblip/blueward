import { db } from "@/lib/db"
import { type RecentGameProps } from "@/components/recent-game"
import { desc, sql, inArray, eq, lte, asc } from "drizzle-orm"
import { playerPerformances, players } from "@/lib/schema"
import { MMR_LEADERBOARD_GAME_WINDOW } from "@/lib/config"
import { unstable_cache } from "next/cache"

export const fetchRecentGames = unstable_cache(
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
            puuid: true,
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
            a.riotIdGameName.localeCompare(b.riotIdGameName)
        )
        .map((p): RecentGameProps["players"][number] => ({
          riotIdGameName: p.riotIdGameName,
          championName: p.championName,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          puuid: p.puuid,
        })),
    }))

    return games
  },
  ["recent-games"],
  {
    tags: ["recent-games"],
  }
)

export const fetchLeaderboardPositionByPuuid = unstable_cache(
  async (puuid: string) => {
    "use server"

    const recentGames = db.$with("recent_games").as(
      db
        .select({
          puuid: playerPerformances.puuid,
          mmr: playerPerformances.mmr,
          gameNumber: sql<number>`
              row_number() over (
                partition by ${playerPerformances.puuid}
                order by
                  ${playerPerformances.createdAt} desc,
                  ${playerPerformances.id} desc
              )::int
            `.as("game_number"),
          gamesPlayed: sql<number>`
            count(*) over (
              partition by ${playerPerformances.puuid}
            )::int
          `.as("games_played"),
        })
        .from(playerPerformances)
    )

    const ladder = db.$with("ladder").as(
      db
        .select({
          puuid: recentGames.puuid,
          gamesPlayed: recentGames.gamesPlayed,
          mmr: sql<number>`sum(${recentGames.mmr})::int`.as("mmr"),
        })
        .from(recentGames)
        .where(lte(recentGames.gameNumber, MMR_LEADERBOARD_GAME_WINDOW))
        .groupBy(recentGames.puuid, recentGames.gamesPlayed)
    )

    const positionedLadder = db.$with("positioned_ladder").as(
      db
        .select({
          puuid: ladder.puuid,
          mmr: ladder.mmr,
          gamesPlayed: ladder.gamesPlayed,
          position: sql<number>`
              row_number() over (
                order by ${ladder.mmr} desc, ${ladder.puuid} asc
              )::int
            `.as("position"),
        })
        .from(ladder)
    )

    const [player] = await db
      .with(recentGames, ladder, positionedLadder)
      .select({
        position: positionedLadder.position,
        mmr: positionedLadder.mmr,
        gamesPlayed: positionedLadder.gamesPlayed,
        riotIdGameName: players.riotIdGameName,
      })
      .from(positionedLadder)
      .innerJoin(players, eq(players.puuid, positionedLadder.puuid))
      .where(eq(positionedLadder.puuid, puuid))
      .limit(1)

    return player ?? null
  },
  ["individual-mmr-ladder-positions"],
  {
    tags: ["individual-mmr-ladder-positions"],
  }
)

export type TopLadderPlayer = {
  riotIdGameName: string
  puuid: string
  gamesPlayed: number
  mmr: number
  winrate: number
}
export const fetchTopLadderPlayers = unstable_cache(
  async (limit = 15): Promise<TopLadderPlayer[]> => {
    "use server"

    const ranked = db.$with("ranked").as(
      db
        .select({
          puuid: playerPerformances.puuid,
          riotIdGameName: playerPerformances.riotIdGameName,
          mmr: playerPerformances.mmr,
          win: playerPerformances.win,
          rn: sql<number>`
            row_number() over (
              partition by ${playerPerformances.puuid}
              order by
                ${playerPerformances.createdAt} desc,
                ${playerPerformances.id} desc
            )::int
          `.as("rn"),
        })
        .from(playerPerformances)
    )

    const totals = db.$with("totals").as(
      db
        .select({
          puuid: playerPerformances.puuid,
          gamesPlayed: sql<number>`count(*)::int`.as("games_played"),
        })
        .from(playerPerformances)
        .groupBy(playerPerformances.puuid)
    )

    const rollingMmr = sql<number>`coalesce(sum(${ranked.mmr}), 0)::int`
    const rollingWinrate = sql<number>`avg((${ranked.win})::int)::float`
    const riotIdGameName = sql<string>`min(${ranked.riotIdGameName})`

    const rows = await db
      .with(ranked, totals)
      .select({
        puuid: ranked.puuid,
        riotIdGameName,
        gamesPlayed: totals.gamesPlayed,
        mmr: rollingMmr,
        winrate: rollingWinrate,
      })
      .from(ranked)
      .innerJoin(totals, eq(totals.puuid, ranked.puuid))
      .where(sql`${ranked.rn} <= ${MMR_LEADERBOARD_GAME_WINDOW}`)
      .groupBy(ranked.puuid, totals.gamesPlayed)
      .orderBy(desc(rollingMmr), asc(ranked.puuid))
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
  }
)

export type PlayerBannerMap = Record<string, number>

export async function fetchPlayerBannersByPuuids(
  puuids: string[]
): Promise<PlayerBannerMap> {
  "use server"

  if (puuids.length === 0) return {}

  const rows = await db
    .select({ puuid: players.puuid, bannerId: players.bannerId })
    .from(players)
    .where(inArray(players.puuid, puuids))

  return rows.reduce<PlayerBannerMap>((acc, row) => {
    acc[row.puuid] = row.bannerId
    return acc
  }, {})
}
