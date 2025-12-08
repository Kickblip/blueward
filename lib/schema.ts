import { integer, pgTable, varchar, timestamp, bigint, doublePrecision, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// matches table -> 1 row per game
// objectives table -> 1 row per team per game (2 rows per game)
// performances table -> 1 row per player (10 rows per game)
// players table -> 1 row per player (persistent)

export const matches = pgTable("matches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  matchId: varchar({ length: 32 }).notNull().unique(),
  players: varchar({ length: 128 }).array().notNull(),
  gameCreation: bigint({ mode: "number" }).notNull(),
  gameStartTimestamp: bigint({ mode: "number" }).notNull(),
  gameEndTimestamp: bigint({ mode: "number" }).notNull(),
  gameDuration: integer().notNull(),
  gameId: bigint({ mode: "number" }).notNull(),
  gameMode: varchar({ length: 32 }).notNull(),
  gameName: varchar({ length: 128 }).notNull(),
  gameType: varchar({ length: 32 }).notNull(),
  gameVersion: varchar({ length: 32 }).notNull(),
})

export const playerPerformances = pgTable("player_performances", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  matchRowId: integer()
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  puuid: varchar({ length: 128 }).notNull(),
  riotIdGameName: varchar({ length: 32 }).notNull(),
  riotIdTagline: varchar({ length: 8 }).notNull(),
  champLevel: integer().notNull(),
  championId: integer().notNull(),
  championName: varchar({ length: 32 }).notNull(),
  profileIcon: integer().notNull(),
  kills: integer().notNull(),
  deaths: integer().notNull(),
  assists: integer().notNull(),
  killParticipation: doublePrecision().notNull(),
  assistMePings: integer().notNull(),
  totalPings: integer().notNull(),
  doubleKills: integer().notNull(),
  tripleKills: integer().notNull(),
  quadraKills: integer().notNull(),
  pentaKills: integer().notNull(),
  killingSprees: integer().notNull(),
  soloKills: integer().notNull(),
  totalMinionsKilled: integer().notNull(),
  teamDamagePercentage: doublePrecision().notNull(),
  buffsStolen: integer().notNull(),
  controlWardsPlaced: integer().notNull(),
  damageTakenOnTeamPercentage: doublePrecision().notNull(),
  earliestDragonTakedown: doublePrecision().notNull(),
  epicMonsterSteals: integer().notNull(),
  firstTurretKilled: boolean().notNull(),
  jungleCsBefore10Minutes: doublePrecision().notNull(),
  killsNearEnemyTurret: integer().notNull(),
  laneMinionsFirst10Minutes: integer().notNull(),
  scuttleCrabKills: integer().notNull(),
  survivedSingleDigitHpCount: integer().notNull(),
  turretPlatesTaken: integer().notNull(),
  turretTakedowns: integer().notNull(),
  voidMonsterKill: integer().notNull(),
  wardTakedowns: integer().notNull(),
  damageDealtToObjectives: integer().notNull(),
  damageDealtToTurrets: integer().notNull(),
  damageSelfMitigated: integer().notNull(),
  enemyMissingPings: integer().notNull(),
  firstBloodKill: boolean().notNull(),
  firstTowerAssist: boolean().notNull(),
  firstTowerKill: boolean().notNull(),
  goldEarned: integer().notNull(),
  inhibitorTakedowns: integer().notNull(),
  item0: integer().notNull(),
  item1: integer().notNull(),
  item2: integer().notNull(),
  item3: integer().notNull(),
  item4: integer().notNull(),
  item5: integer().notNull(),
  item6: integer().notNull(),
  largestCriticalStrike: integer().notNull(),
  largestKillingSpree: integer().notNull(),
  longestTimeSpentLiving: integer().notNull(),
  magicDamageDealtToChampions: integer().notNull(),
  magicDamageTaken: integer().notNull(),
  neutralMinionsKilled: integer().notNull(),
  onMyWayPings: integer().notNull(),
  physicalDamageDealtToChampions: integer().notNull(),
  physicalDamageTaken: integer().notNull(),
  summoner1Id: integer().notNull(),
  summoner2Id: integer().notNull(),
  summonerId: varchar({ length: 64 }).notNull(),
  summonerLevel: integer().notNull(),
  teamId: integer().notNull(),
  totalDamageShieldedOnTeammates: integer().notNull(),
  totalDamageTaken: integer().notNull(),
  totalHeal: integer().notNull(),
  totalHealsOnTeammates: integer().notNull(),
  totalTimeCCDealt: integer().notNull(),
  totalTimeSpentDead: integer().notNull(),
  trueDamageDealtToChampions: integer().notNull(),
  trueDamageTaken: integer().notNull(),
  turretKills: integer().notNull(),
  visionScore: integer().notNull(),
  wardsPlaced: integer().notNull(),
  win: boolean().notNull(),
  keystonePerkId: integer().notNull(), // perks.styles[0].selections[0].perk
  secondaryStyleId: integer().notNull(), // perks.styles[1].style
})

export const teamObjectives = pgTable("team_objectives", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  matchRowId: integer()
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  teamId: integer().notNull(),
  win: boolean().notNull(),
  feat_epic_monster_kill_state: integer().notNull(),
  feat_first_blood_state: integer().notNull(),
  feat_first_turret_state: integer().notNull(),
  atakhan_first: boolean().notNull(),
  atakhan_kills: integer().notNull(),
  baron_first: boolean().notNull(),
  baron_kills: integer().notNull(),
  champion_first: boolean().notNull(),
  champion_kills: integer().notNull(),
  dragon_first: boolean().notNull(),
  dragon_kills: integer().notNull(),
  horde_first: boolean().notNull(),
  horde_kills: integer().notNull(),
  inhibitor_first: boolean().notNull(),
  inhibitor_kills: integer().notNull(),
  riftHerald_first: boolean().notNull(),
  riftHerald_kills: integer().notNull(),
  tower_first: boolean().notNull(),
  tower_kills: integer().notNull(),
})

export const players = pgTable("players", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  lastPlayedAt: timestamp({ withTimezone: true }).notNull(),
  pointHistory: integer().array().notNull(),
  puuid: varchar({ length: 128 }).notNull().unique(),
  riotIdGameName: varchar({ length: 32 }).notNull(),
  riotIdTagline: varchar({ length: 8 }).notNull(),
  matchHistory: varchar({ length: 32 }).array().notNull(),
  recentChampionNames: varchar({ length: 32 }).array().notNull(),
  gamesWon: integer().notNull(),
  gamesLost: integer().notNull(),
})

export const matchesRelations = relations(matches, ({ many }) => ({
  objectives: many(teamObjectives),
  performances: many(playerPerformances),
}))

export const objectivesRelations = relations(teamObjectives, ({ one }) => ({
  match: one(matches, {
    fields: [teamObjectives.matchRowId],
    references: [matches.id],
  }),
}))

export const playerPerformancesRelations = relations(playerPerformances, ({ one }) => ({
  match: one(matches, {
    fields: [playerPerformances.matchRowId],
    references: [matches.id],
  }),
}))
