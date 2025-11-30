import { integer, pgTable, varchar } from "drizzle-orm/pg-core"

export const matches = pgTable("matches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
})

export const players = pgTable("players", {})

export const playerPerformances = pgTable("player_performances", {})
