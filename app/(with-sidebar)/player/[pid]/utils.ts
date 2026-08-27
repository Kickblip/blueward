import { type RecentMatchRow } from "./actions"

export function calcWinrate(rows: RecentMatchRow[]) {
  const total = rows.length
  if (total === 0) return { wins: 0, losses: 0, total: 0, winrate: 0 }

  let wins = 0
  for (const r of rows) if (r.win) wins++

  const losses = total - wins
  const winrate = wins / total
  return { wins, losses, total, winrate }
}

export function calcAverageKDA(rows: RecentMatchRow[]) {
  const total = rows.length
  if (total === 0) {
    return { avgKills: 0, avgDeaths: 0, avgAssists: 0 }
  }

  let kills = 0
  let deaths = 0
  let assists = 0

  for (const r of rows) {
    kills += r.kills
    deaths += r.deaths
    assists += r.assists
  }

  return {
    avgKills: kills / total,
    avgDeaths: deaths / total,
    avgAssists: assists / total,
  }
}

type MatchLike = {
  championName: string
  win: boolean
}

type ChampionWinrate = {
  name: string
  played: number
  wins: number
  losses: number
  winrate: number
}

export function calcWinrateByChampion(matches: MatchLike[]): ChampionWinrate[] {
  const map = new Map<string, { played: number; wins: number }>()

  for (const m of matches) {
    const entry = map.get(m.championName) ?? { played: 0, wins: 0 }
    entry.played++
    if (m.win) entry.wins++
    map.set(m.championName, entry)
  }

  return Array.from(map.entries())
    .map(([name, { played, wins }]) => {
      const losses = played - wins
      return {
        name,
        played,
        wins,
        losses,
        winrate: played === 0 ? 0 : wins / played,
      }
    })
    .sort((a, b) => b.played - a.played)
}
