import { auth } from "@clerk/nextjs/server"
import { desc, eq, getTableColumns } from "drizzle-orm"

import { db } from "@/lib/db"
import { players, transactions } from "@/lib/schema"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const recentTransactions = await db
    .select(getTableColumns(transactions))
    .from(transactions)
    .innerJoin(players, eq(transactions.playerId, players.id))
    .where(eq(players.authId, userId))
    .orderBy(desc(transactions.createdAt), desc(transactions.id))
    .limit(10)

  return Response.json({ transactions: recentTransactions })
}
