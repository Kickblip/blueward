import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { players, transactions } from "@/lib/schema"
import { BANNER_CONFIG, HORIZONS_SET_LIST, RARITY_PRICES, type Rarity } from "@repo/ui/config"

export async function POST(req: NextRequest) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as { bannerId?: number }
    const bannerId = body.bannerId

    if (typeof bannerId !== "number") {
      return NextResponse.json({ error: "Invalid bannerId" }, { status: 400 })
    }

    if (!HORIZONS_SET_LIST.buyable.includes(bannerId as (typeof HORIZONS_SET_LIST.buyable)[number])) {
      return NextResponse.json({ error: "Banner is not purchasable" }, { status: 400 })
    }

    const banner = BANNER_CONFIG[bannerId as keyof typeof BANNER_CONFIG]

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    const rarity = banner.rarity as Rarity
    const price = RARITY_PRICES[rarity]

    if (typeof price !== "number") {
      return NextResponse.json({ error: "Price not found for banner rarity" }, { status: 500 })
    }

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

      if (balance < price) {
        return {
          ok: false as const,
          reason: "INSUFFICIENT_BALANCE" as const,
          balance,
        }
      }

      if (player.banners.includes(bannerId)) {
        return {
          ok: false as const,
          reason: "ALREADY_OWNED" as const,
          balance,
        }
      }

      await tx.insert(transactions).values({
        playerId: player.id,
        type: "SPEND",
        amount: -price,
      })

      await tx
        .update(players)
        .set({
          banners: sql`array_append(${players.banners}, ${bannerId})`,
        })
        .where(eq(players.id, player.id))

      return {
        ok: true as const,
        bannerId,
        rarity,
        price,
        balance: balance - price,
      }
    })

    if (!result.ok) {
      if (result.reason === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          {
            error: "Insufficient balance",
            balance: result.balance,
            required: price,
          },
          { status: 400 },
        )
      }

      if (result.reason === "ALREADY_OWNED") {
        return NextResponse.json(
          {
            error: "Banner already owned",
            bannerId,
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({
      bannerId: result.bannerId,
      rarity: result.rarity,
      charged: result.price,
      balance: result.balance,
    })
  } catch (error) {
    console.error("Banner purchase failed:", error)
    return NextResponse.json({ error: "Failed to purchase banner" }, { status: 500 })
  }
}
