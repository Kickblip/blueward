import { auth } from "@clerk/nextjs/server"
import { and, eq, isNull, ne, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { players, transactions } from "@/lib/schema"
import { DAILY_REWARD } from "@/lib/config"

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const player = await db.query.players.findFirst({
    where: eq(players.authId, userId),
    columns: { id: true },
  })

  if (!player) {
    return Response.json({ error: "Player not found" }, { status: 404 })
  }

  const today = new Date().toISOString().slice(0, 10)

  const claimed = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(players)
      .set({ lastDailyClaimDate: today })
      .where(
        and(
          eq(players.id, player.id),
          or(
            isNull(players.lastDailyClaimDate),
            ne(players.lastDailyClaimDate, today)
          )
        )
      )
      .returning({ id: players.id })

    if (!updated) return false

    await tx.insert(transactions).values({
      playerId: player.id,
      type: "DAILY_REWARD",
      amount: DAILY_REWARD,
    })

    return true
  })

  if (!claimed) {
    return Response.json(
      { error: "Daily reward already claimed" },
      { status: 409 }
    )
  }

  return Response.json({
    claimed: true,
    amount: DAILY_REWARD,
  })
}
