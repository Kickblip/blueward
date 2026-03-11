import { NextResponse } from "next/server"
import { HORIZONS_SET_LIST, RARITY_RATES, ROLL_PRICE, OWNERSHIP_RAKEBACK, type Rarity } from "@repo/ui/config"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { players, transactions } from "@/lib/schema"
import { sql } from "drizzle-orm"

function pickWeightedRarity(): Rarity {
  const roll = Math.random()
  let cumulative = 0

  for (const [rarity, rate] of Object.entries(RARITY_RATES) as [Rarity, number][]) {
    cumulative += rate
    if (roll < cumulative) return rarity
  }

  return "common"
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export async function POST() {
  const user = await currentUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const player = await db.query.players.findFirst({
      where: eq(players.authId, user.id),
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }
    const result = await db.transaction(async (tx) => {
      const balanceResult = await tx
        .select({
          balance: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(eq(transactions.playerId, player.id))

      const balance = balanceResult[0]?.balance ?? 0

      if (balance < ROLL_PRICE) {
        return {
          ok: false,
          reason: "INSUFFICIENT_BALANCE" as const,
          balance,
        }
      }

      const rarity = pickWeightedRarity()
      const bannerId = pickRandom(HORIZONS_SET_LIST[rarity])
      const owned = player.banners.includes(bannerId)

      const rakeback = owned ? OWNERSHIP_RAKEBACK[rarity] : 0
      const chargeAmount = owned ? Math.round(ROLL_PRICE * (1 - rakeback)) : ROLL_PRICE

      await tx.insert(transactions).values({
        playerId: player.id,
        type: "SPEND",
        amount: -chargeAmount,
      })

      if (!owned) {
        await tx
          .update(players)
          .set({
            banners: sql`array_append(${players.banners}, ${bannerId})`,
          })
          .where(eq(players.id, player.id))
      }

      return {
        ok: true,
        rarity,
        bannerId,
        owned,
        chargeAmount,
        rakeback,
        balance: balance - chargeAmount,
      }
    })

    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          balance: result.balance,
          required: ROLL_PRICE,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      rarity: result.rarity,
      bannerId: result.bannerId,
      owned: result.owned,
      charged: result.chargeAmount,
      rakeback: result.rakeback,
      balance: result.balance,
    })
  } catch (error) {
    console.error("Banner roll failed:", error)
    return NextResponse.json({ error: "Failed to roll banner" }, { status: 500 })
  }
}
