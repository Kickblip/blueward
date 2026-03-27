import { NextResponse } from "next/server"
import { and, eq, inArray } from "drizzle-orm"
import { z } from "zod"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { markets, marketSelections, transactions } from "@/lib/schema"

const resolveMarketSchema = z.object({
  resolvedOutcome: z.enum(["OUTCOME_1", "OUTCOME_2"]),
})

export async function POST(req: Request, { params }: { params: Promise<{ marketId: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.privateMetadata.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { marketId } = await params
    const parsedMarketId = Number(marketId)

    if (!Number.isInteger(parsedMarketId) || parsedMarketId <= 0) {
      return NextResponse.json({ error: "Invalid market id" }, { status: 400 })
    }

    const body = await req.json()
    const parsed = resolveMarketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const { resolvedOutcome } = parsed.data

    const result = await db.transaction(async (tx) => {
      const [market] = await tx.select().from(markets).where(eq(markets.id, parsedMarketId)).limit(1)

      if (!market) {
        return {
          kind: "error" as const,
          status: 404,
          body: { error: "Market not found" },
        }
      }

      if (market.status === "RESOLVED") {
        return {
          kind: "error" as const,
          status: 409,
          body: { error: "Market is already resolved" },
        }
      }

      if (market.status === "CANCELLED") {
        return {
          kind: "error" as const,
          status: 409,
          body: { error: "Cancelled market cannot be resolved" },
        }
      }

      const openSelections = await tx
        .select()
        .from(marketSelections)
        .where(and(eq(marketSelections.marketId, parsedMarketId), eq(marketSelections.status, "PLACED")))

      const totalPool = openSelections.reduce((sum, selection) => sum + selection.amount, 0)

      const winningSelections = openSelections.filter((selection) => selection.outcome === resolvedOutcome)
      const losingSelections = openSelections.filter((selection) => selection.outcome !== resolvedOutcome)

      const totalWinningAmount = winningSelections.reduce((sum, selection) => sum + selection.amount, 0)

      const resolvedAt = new Date()

      await tx
        .update(markets)
        .set({
          status: "RESOLVED",
          resolvedOutcome,
          resolvedAt,
        })
        .where(eq(markets.id, parsedMarketId))

      // No winners or empty pool:
      // resolve market, mark all open selections settled with payout 0
      if (totalPool === 0 || totalWinningAmount === 0) {
        await tx
          .update(marketSelections)
          .set({
            status: "SETTLED",
            payoutAmount: 0,
            settledAt: resolvedAt,
          })
          .where(and(eq(marketSelections.marketId, parsedMarketId), eq(marketSelections.status, "PLACED")))

        return {
          kind: "ok" as const,
          body: {
            marketId: parsedMarketId,
            resolvedOutcome,
            totalPool,
            totalWinningAmount,
            winners: 0,
            losers: openSelections.length,
            payoutsCreated: 0,
          },
        }
      }

      // Compute payouts for winners
      // floor each payout, then give any remainder to the largest winner
      // so the total paid matches the pool exactly
      const winnerPayouts = winningSelections.map((selection) => ({
        selection,
        rawPayout: (selection.amount / totalWinningAmount) * totalPool,
      }))

      const floored = winnerPayouts.map((entry) => ({
        selection: entry.selection,
        payoutAmount: Math.floor(entry.rawPayout),
        fractionalPart: entry.rawPayout - Math.floor(entry.rawPayout),
      }))

      let distributed = floored.reduce((sum, entry) => sum + entry.payoutAmount, 0)
      let remainder = totalPool - distributed

      floored.sort((a, b) => b.fractionalPart - a.fractionalPart)

      for (let i = 0; i < floored.length && remainder > 0; i += 1) {
        floored[i]!.payoutAmount += 1
        remainder -= 1
      }

      if (losingSelections.length > 0) {
        const losingIds = losingSelections.map((selection) => selection.id)

        await tx
          .update(marketSelections)
          .set({
            status: "SETTLED",
            payoutAmount: 0,
            settledAt: resolvedAt,
          })
          .where(inArray(marketSelections.id, losingIds))
      }

      // Update winning selections and create payout transactions
      for (const winner of floored) {
        await tx
          .update(marketSelections)
          .set({
            status: "SETTLED",
            payoutAmount: winner.payoutAmount,
            settledAt: resolvedAt,
          })
          .where(eq(marketSelections.id, winner.selection.id))

        if (winner.payoutAmount > 0) {
          await tx.insert(transactions).values({
            playerId: winner.selection.playerId,
            type: "MARKET_PAYOUT",
            marketId: parsedMarketId,
            marketSelectionId: winner.selection.id,
            amount: winner.payoutAmount,
          })
        }
      }

      return {
        kind: "ok" as const,
        body: {
          marketId: parsedMarketId,
          resolvedOutcome,
          totalPool,
          totalWinningAmount,
          winners: winningSelections.length,
          losers: losingSelections.length,
          payoutsCreated: floored.length,
        },
      }
    })

    if (result.kind === "error") {
      return NextResponse.json(result.body, { status: result.status })
    }

    return NextResponse.json(result.body, { status: 200 })
  } catch (error) {
    console.error("Failed to resolve market:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
