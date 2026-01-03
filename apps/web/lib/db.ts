import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const connectionString = process.env.DATABASE_URL_DEV ?? process.env.DATABASE_URL_PROD

if (!connectionString) {
  throw new Error("Missing DATABASE_URL_DEV or DATABASE_URL_PROD")
}

const sql = neon(connectionString)

export const db = drizzle({ client: sql, casing: "snake_case" })
