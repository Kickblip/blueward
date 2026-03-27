import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { markets, marketSelections, transactions } from "@/lib/schema"

export async function POST(_req: Request, { params }: { params: Promise<{ marketId: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.privateMetadata.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { marketId } = await params
    const parsedMarketId = Number(marketId)

    if (!Number.isInteger(parsedMarketId) || parsedMarketId <= 0) {
      return NextResponse.json({ error: "Invalid market id" }, { status: 400 })
    }

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
          body: { error: "Resolved market cannot be cancelled" },
        }
      }

      if (market.status === "CANCELLED") {
        return {
          kind: "error" as const,
          status: 409,
          body: { error: "Market is already cancelled" },
        }
      }

      const activeSelections = await tx
        .select()
        .from(marketSelections)
        .where(and(eq(marketSelections.marketId, parsedMarketId), eq(marketSelections.status, "PLACED")))

      const now = new Date()

      await tx
        .update(markets)
        .set({
          status: "CANCELLED",
          resolvedAt: now,
        })
        .where(eq(markets.id, parsedMarketId))

      if (activeSelections.length > 0) {
        const selectionIds = activeSelections.map((selection) => selection.id)

        await tx
          .update(marketSelections)
          .set({
            status: "REFUNDED",
            payoutAmount: null,
            settledAt: now,
          })
          .where(eq(marketSelections.marketId, parsedMarketId))

        await tx.insert(transactions).values(
          activeSelections.map((selection) => ({
            playerId: selection.playerId,
            type: "MARKET_REFUND" as const,
            marketId: parsedMarketId,
            marketSelectionId: selection.id,
            amount: selection.amount,
          })),
        )

        return {
          kind: "ok" as const,
          body: {
            marketId: parsedMarketId,
            refundedSelections: selectionIds.length,
            refundedAmount: activeSelections.reduce((sum, s) => sum + s.amount, 0),
          },
        }
      }

      return {
        kind: "ok" as const,
        body: {
          marketId: parsedMarketId,
          refundedSelections: 0,
          refundedAmount: 0,
        },
      }
    })

    if (result.kind === "error") {
      return NextResponse.json(result.body, { status: result.status })
    }

    return NextResponse.json(result.body, { status: 200 })
  } catch (error) {
    console.error("Failed to cancel market:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
