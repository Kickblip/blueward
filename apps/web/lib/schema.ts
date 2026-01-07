import { integer, pgTable, varchar, timestamp, bigint, boolean, pgEnum, real, smallint } from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"

// matches table -> 1 row per game
// objectives table -> 1 row per team per game (2 rows per game)
// performances table -> 1 row per player (10 rows per game)
// players table -> 1 row per player (persistent)

export const matches = pgTable("matches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  matchId: varchar({ length: 32 }).notNull().unique(),
  tag: varchar({ length: 8 }).notNull().default("INHOUSE"),
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
  bluewardVersion: varchar({ length: 16 }).notNull(),
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
  payout: integer().notNull().default(0),
  mmr: integer().notNull().default(0),
  champLevel: integer().notNull(),
  championId: integer().notNull(),
  championName: varchar({ length: 32 }).notNull(),
  profileIcon: integer().notNull(),
  kills: smallint().notNull(),
  deaths: smallint().notNull(),
  assists: smallint().notNull(),
  killParticipation: real().notNull(),

  assistMePings: smallint().notNull(),
  enemyMissingPings: smallint().notNull(),
  enemyVisionPings: smallint().notNull(),
  needVisionPings: smallint().notNull(),
  onMyWayPings: smallint().notNull(),
  pushPings: smallint().notNull(),

  doubleKills: smallint().notNull(),
  tripleKills: smallint().notNull(),
  quadraKills: smallint().notNull(),
  pentaKills: smallint().notNull(),
  killingSprees: smallint().notNull(),
  soloKills: smallint().notNull(),
  totalMinionsKilled: smallint().notNull(),
  teamDamagePercentage: real().notNull(),
  buffsStolen: smallint().notNull(),

  wardsPlaced: smallint().notNull(),
  controlWardsPlaced: smallint().notNull(),
  wardTakedowns: smallint().notNull(),
  visionScore: smallint().notNull(),

  spell1Casts: smallint().notNull(),
  spell2Casts: smallint().notNull(),
  spell3Casts: smallint().notNull(),
  spell4Casts: smallint().notNull(),
  summoner1Casts: smallint().notNull(),
  summoner2Casts: smallint().notNull(),

  totalHeal: integer().notNull(),
  totalHealsOnTeammates: integer().notNull(),
  totalDamageShieldedOnTeammates: integer().notNull(),
  effectiveHealAndShielding: integer().notNull(),

  damageTakenOnTeamPercentage: real().notNull(),
  earliestDragonTakedown: integer().notNull(),
  epicMonsterSteals: smallint().notNull(),
  firstTurretKilled: boolean().notNull(),
  jungleCsBefore10Minutes: smallint().notNull(),
  killsNearEnemyTurret: smallint().notNull(),
  laneMinionsFirst10Minutes: smallint().notNull(),
  scuttleCrabKills: smallint().notNull(),
  survivedSingleDigitHpCount: smallint().notNull(),
  turretPlatesTaken: smallint().notNull(),
  turretTakedowns: smallint().notNull(),
  voidMonsterKill: smallint().notNull(),
  damageDealtToObjectives: integer().notNull(),
  damageDealtToTurrets: integer().notNull(),
  damageSelfMitigated: integer().notNull(),
  firstBloodKill: boolean().notNull(),
  firstTowerAssist: boolean().notNull(),
  firstTowerKill: boolean().notNull(),
  goldEarned: integer().notNull(),
  inhibitorTakedowns: smallint().notNull(),
  item0: integer().notNull(),
  item1: integer().notNull(),
  item2: integer().notNull(),
  item3: integer().notNull(),
  item4: integer().notNull(),
  item5: integer().notNull(),
  item6: integer().notNull(),
  largestCriticalStrike: integer().notNull(),
  largestKillingSpree: smallint().notNull(),
  longestTimeSpentLiving: integer().notNull(),
  magicDamageDealtToChampions: integer().notNull(),
  magicDamageTaken: integer().notNull(),
  neutralMinionsKilled: smallint().notNull(),
  physicalDamageDealtToChampions: integer().notNull(),
  physicalDamageTaken: integer().notNull(),
  summoner1Id: smallint().notNull(),
  summoner2Id: smallint().notNull(),
  summonerLevel: smallint().notNull(),
  teamId: smallint().notNull(),
  totalDamageTaken: integer().notNull(),

  totalTimeCCDealt: integer().notNull(),
  totalTimeSpentDead: integer().notNull(),
  trueDamageDealtToChampions: integer().notNull(),
  trueDamageTaken: integer().notNull(),
  turretKills: smallint().notNull(),
  win: boolean().notNull(),
  keystonePerkId: smallint().notNull(), // perks.styles[0].selections[0].perk
  secondaryStyleId: smallint().notNull(), // perks.styles[1].style
})

export const teamObjectives = pgTable("team_objectives", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  matchRowId: integer()
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  teamId: smallint().notNull(),
  win: boolean().notNull(),
  featEpicMonsterKillState: smallint().notNull(),
  featFirstBloodState: smallint().notNull(),
  featFirstTurretState: smallint().notNull(),
  atakhanFirst: boolean().notNull(),
  atakhanKills: smallint().notNull(),
  baronFirst: boolean().notNull(),
  baronKills: smallint().notNull(),
  championFirst: boolean().notNull(),
  championKills: smallint().notNull(),
  dragonFirst: boolean().notNull(),
  dragonKills: smallint().notNull(),
  hordeFirst: boolean().notNull(),
  hordeKills: smallint().notNull(),
  inhibitorFirst: boolean().notNull(),
  inhibitorKills: smallint().notNull(),
  riftHeraldFirst: boolean().notNull(),
  riftHeraldKills: smallint().notNull(),
  towerFirst: boolean().notNull(),
  towerKills: smallint().notNull(),
})

export const roleEnum = pgEnum("role", ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "SUPPORT", "FILL"])

export const rankTierEnum = pgEnum("rank_tier", [
  "UNRANKED",
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
])

export const players = pgTable("players", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  authId: varchar({ length: 128 }).unique(),
  bannerId: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  aliases: varchar({ length: 64 })
    .notNull()
    .array()
    .default(sql`ARRAY[]::varchar[]`),
  primaryRole: roleEnum("primary_role").notNull().default("FILL"),
  secondaryRole: roleEnum("secondary_role").notNull().default("FILL"),
  rankTier: rankTierEnum("rank_tier").notNull().default("UNRANKED"),
  lastPlayedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  puuid: varchar({ length: 128 }).notNull().unique(),
  riotIdGameName: varchar({ length: 32 }).notNull(),
  riotIdTagline: varchar({ length: 8 }).notNull(),
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
