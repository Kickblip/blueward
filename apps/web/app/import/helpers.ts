import { db } from "@/lib/db"
import { matches, playerPerformances, teamObjectives, players, transactions } from "@/lib/schema"
import { calculateMMR } from "./mmr"
import { sql, eq } from "drizzle-orm"

export async function fetchWithRetry(url: string, opts: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, opts)
    if (res.status !== 429) return res

    const sleep = Number(res.headers.get("retry-after") ?? "1") * 1_000
    await new Promise((r) => setTimeout(r, sleep))
  }
  throw new Error("Exceeded retry budget (429)")
}

export async function importMatchJson(m: any) {
  return db.transaction(async (tx) => {
    // Insert match (1 row)
    const matchRow = mapMatchRow(m)

    const inserted = await tx
      .insert(matches)
      .values(matchRow)
      .onConflictDoNothing({ target: matches.matchId })
      .returning({ id: matches.id })

    let matchRowId = inserted[0]?.id

    if (!matchRowId) {
      const existing = await tx.select({ id: matches.id }).from(matches).where(eq(matches.matchId, matchRow.matchId)).limit(1)

      matchRowId = existing[0]?.id
    }

    if (!matchRowId) {
      throw new Error(`Failed to resolve matchRowId for matchId=${matchRow.matchId}`)
    }

    // Insert player performances (10 rows)
    const performanceRows = mapPerformanceRows(m, matchRowId)

    await tx
      .insert(playerPerformances)
      .values(performanceRows)
      .onConflictDoNothing({
        target: [playerPerformances.matchRowId, playerPerformances.puuid],
      })

    // Insert team objectives (2 rows)
    const objectiveRows = mapObjectiveRows(m, matchRowId)

    await tx
      .insert(teamObjectives)
      .values(objectiveRows)
      .onConflictDoNothing({
        target: [teamObjectives.matchRowId, teamObjectives.teamId],
      })

    // Update player profiles
    await upsertPlayersFromMatch(tx, m)

    // Insert transaction rows (10 rows)
    await tx.execute(sql`
      insert into ${transactions} (player_id, type, match_row_id, amount)
      select ${players.id},
            'MATCH_EARN'::transaction_type,
            ${matchRowId},
            ${playerPerformances.goldEarned}
      from ${playerPerformances}
      join ${players} on ${players.puuid} = ${playerPerformances.puuid}
      where ${playerPerformances.matchRowId} = ${matchRowId}
      on conflict (player_id, match_row_id, type) do nothing
    `)

    return matchRowId
  })
}

export async function upsertPlayersFromMatch(tx: any, m: any) {
  const info = m.info
  const participants = info.participants ?? []

  const rows = participants.map((p: any) => ({
    puuid: String(p.puuid),
    riotIdGameName: String(p.riotIdGameName),
    riotIdTagline: String(p.riotIdTagline),
  }))

  await tx
    .insert(players)
    .values(rows)
    .onConflictDoUpdate({
      target: players.puuid,
      set: {
        riotIdGameName: sql`excluded.riot_id_game_name`,
        riotIdTagline: sql`excluded.riot_id_tagline`,
      },
      // only update if actually different
      where: sql`${players.riotIdGameName} IS DISTINCT FROM excluded.riot_id_game_name
            OR ${players.riotIdTagline} IS DISTINCT FROM excluded.riot_id_tagline`,
    })
}

function mapMatchRow(m: any) {
  const info = m.info

  return {
    matchId: String(m.metadata.matchId),
    players: m.metadata.participants,
    gameCreation: Number(info.gameCreation),
    gameStartTimestamp: Number(info.gameStartTimestamp),
    gameEndTimestamp: Number(info.gameEndTimestamp),
    gameDuration: Number(info.gameDuration),
    gameId: Number(info.gameId),
    gameMode: String(info.gameMode),
    gameType: String(info.gameType),
    gameVersion: String(info.gameVersion),
    bluewardVersion: process.env.NEXT_PUBLIC_BLUEWARD_VERSION!,
  }
}

function mapPerformanceRows(m: any, matchRowId: number) {
  const info = m.info
  const participants = info.participants ?? []

  return participants.map((p: any) => {
    const ch = p.challenges ?? {}

    return {
      matchRowId,
      puuid: String(p.puuid),
      riotIdGameName: String(p.riotIdGameName),
      riotIdTagline: String(p.riotIdTagline),

      mmr: calculateMMR(p),

      champLevel: Number(p.champLevel),
      championId: Number(p.championId),
      championName: String(p.championName),
      profileIcon: Number(p.profileIcon),

      kills: Number(p.kills),
      deaths: Number(p.deaths),
      assists: Number(p.assists),
      killParticipation: Number(ch.killParticipation),

      assistMePings: Number(p.assistMePings),
      enemyMissingPings: Number(p.enemyMissingPings),
      enemyVisionPings: Number(p.enemyVisionPings),
      needVisionPings: Number(p.needVisionPings),
      onMyWayPings: Number(p.onMyWayPings),
      pushPings: Number(p.pushPings),

      role: String(p.teamPosition),
      doubleKills: Number(p.doubleKills),
      tripleKills: Number(p.tripleKills),
      quadraKills: Number(p.quadraKills),
      pentaKills: Number(p.pentaKills),
      killingSprees: Number(p.killingSprees),
      soloKills: Number(ch.soloKills),
      totalMinionsKilled: Number(p.totalMinionsKilled),
      teamDamagePercentage: Number(ch.teamDamagePercentage),
      buffsStolen: Number(ch.buffsStolen),

      wardsPlaced: Number(p.wardsPlaced),
      controlWardsPlaced: Number(ch.controlWardsPlaced),
      wardTakedowns: Number(ch.wardTakedowns),
      visionScore: Number(p.visionScore),

      spell1Casts: Number(p.spell1Casts),
      spell2Casts: Number(p.spell2Casts),
      spell3Casts: Number(p.spell3Casts),
      spell4Casts: Number(p.spell4Casts),
      summoner1Casts: Number(p.summoner1Casts),
      summoner2Casts: Number(p.summoner2Casts),

      totalHeal: Number(p.totalHeal),
      totalHealsOnTeammates: Number(p.totalHealsOnTeammates),
      totalDamageShieldedOnTeammates: Number(p.totalDamageShieldedOnTeammates),
      effectiveHealAndShielding: Number(Math.round(ch.effectiveHealAndShielding)),

      damageTakenOnTeamPercentage: Number(ch.damageTakenOnTeamPercentage),
      epicMonsterSteals: Number(ch.epicMonsterSteals),
      firstTurretKilled: Boolean(ch.firstTurretKilled),

      jungleCsBefore10Minutes: Number(Math.round(ch.jungleCsBefore10Minutes)),
      killsNearEnemyTurret: Number(ch.killsNearEnemyTurret),
      laneMinionsFirst10Minutes: Number(ch.laneMinionsFirst10Minutes),
      scuttleCrabKills: Number(ch.scuttleCrabKills),
      survivedSingleDigitHpCount: Number(ch.survivedSingleDigitHpCount),
      turretPlatesTaken: Number(ch.turretPlatesTaken),
      turretTakedowns: Number(p.turretTakedowns),
      voidMonsterKill: Number(ch.voidMonsterKill),

      damageDealtToObjectives: Number(p.damageDealtToObjectives),
      damageDealtToTurrets: Number(p.damageDealtToTurrets),
      damageSelfMitigated: Number(p.damageSelfMitigated),

      firstBloodKill: Boolean(p.firstBloodKill),
      firstTowerAssist: Boolean(p.firstTowerAssist),
      firstTowerKill: Boolean(p.firstTowerKill),

      goldEarned: Number(p.goldEarned),
      inhibitorTakedowns: Number(p.inhibitorTakedowns),

      item0: Number(p.item0),
      item1: Number(p.item1),
      item2: Number(p.item2),
      item3: Number(p.item3),
      item4: Number(p.item4),
      item5: Number(p.item5),
      item6: Number(p.item6),
      roleBoundItem: Number(p.roleBoundItem),

      largestCriticalStrike: Number(p.largestCriticalStrike),
      largestKillingSpree: Number(p.largestKillingSpree),
      longestTimeSpentLiving: Number(p.longestTimeSpentLiving),

      magicDamageDealtToChampions: Number(p.magicDamageDealtToChampions),
      magicDamageTaken: Number(p.magicDamageTaken),
      neutralMinionsKilled: Number(p.neutralMinionsKilled),

      physicalDamageDealtToChampions: Number(p.physicalDamageDealtToChampions),
      physicalDamageTaken: Number(p.physicalDamageTaken),

      summoner1Id: Number(p.summoner1Id),
      summoner2Id: Number(p.summoner2Id),
      summonerLevel: Number(p.summonerLevel),
      teamId: Number(p.teamId),
      totalDamageTaken: Number(p.totalDamageTaken),

      totalTimeCCDealt: Number(p.totalTimeCCDealt),
      totalTimeSpentDead: Number(p.totalTimeSpentDead),

      trueDamageDealtToChampions: Number(p.trueDamageDealtToChampions),
      trueDamageTaken: Number(p.trueDamageTaken),

      turretKills: Number(p.turretKills),
      win: Boolean(p.win),

      perkPrimaryStyleId: Number(p.perks.styles[0].style),
      perkSecondaryStyleId: Number(p.perks.styles[1].style),

      perkStatOffense: Number(p.perks.statPerks.offense),
      perkStatFlex: Number(p.perks.statPerks.flex),
      perkStatDefense: Number(p.perks.statPerks.defense),

      perkPrimary1Id: Number(p.perks.styles[0].selections[0].perk),
      perkPrimary2Id: Number(p.perks.styles[0].selections[1].perk),
      perkPrimary3Id: Number(p.perks.styles[0].selections[2].perk),
      perkPrimary4Id: Number(p.perks.styles[0].selections[3].perk),

      perkSecondary1Id: Number(p.perks.styles[1].selections[0].perk),
      perkSecondary2Id: Number(p.perks.styles[1].selections[1].perk),
    }
  })
}

function mapObjectiveRows(m: any, matchRowId: number) {
  const teams = m.info.teams ?? []

  return teams.map((t: any) => ({
    matchRowId,
    teamId: Number(t.teamId),
    win: Boolean(t.win),

    baronFirst: Boolean(t.objectives.baron.first),
    baronKills: Number(t.objectives.baron.kills),

    championFirst: Boolean(t.objectives.champion.first),
    championKills: Number(t.objectives.champion.kills),

    dragonFirst: Boolean(t.objectives.dragon.first),
    dragonKills: Number(t.objectives.dragon.kills),

    hordeFirst: Boolean(t.objectives.horde.first),
    hordeKills: Number(t.objectives.horde.kills),

    inhibitorFirst: Boolean(t.objectives.inhibitor.first),
    inhibitorKills: Number(t.objectives.inhibitor.kills),

    riftHeraldFirst: Boolean(t.objectives.riftHerald.first),
    riftHeraldKills: Number(t.objectives.riftHerald.kills),

    towerFirst: Boolean(t.objectives.tower.first),
    towerKills: Number(t.objectives.tower.kills),
  }))
}
