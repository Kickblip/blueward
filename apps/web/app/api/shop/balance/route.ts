import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { eq, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { players, transactions } from "@/lib/schema"

export async function GET() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const player = await db.query.players.findFirst({
    where: eq(players.authId, user.id),
  })

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 })
  }

  const result = await db
    .select({
      balance: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.playerId, player.id))

  const balance = result[0]?.balance ?? 0

  return NextResponse.json({ balance })
}
