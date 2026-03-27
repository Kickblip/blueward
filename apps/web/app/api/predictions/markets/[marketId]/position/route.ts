import { NextResponse } from "next/server"
import { and, asc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { markets, marketSelections, players, transactions } from "@/lib/schema"

const updatePositionSchema = z.object({
  action: z.enum(["PLACED", "CLOSED"]),
  outcome: z.union([z.literal(1), z.literal(2)]),
  amount: z.number().int().positive(),
})

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0]
type MarketSelectionRow = typeof marketSelections.$inferSelect

async function getPlayerBalance(tx: DbTx, playerId: number): Promise<number> {
  const [row] = await tx
    .select({
      balance: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.playerId, playerId))

  return row?.balance ?? 0
}

async function closeSelectionAmount(
  tx: DbTx,
  selections: MarketSelectionRow[],
  amountToClose: number,
  marketId: number,
  playerId: number,
  now: Date,
) {
  let remaining = amountToClose

  // close oldest lots first; change to desc(...) if you want newest first
  for (const selection of selections) {
    if (remaining <= 0) break

    const removable = Math.min(selection.amount, remaining)

    if (removable === selection.amount) {
      await tx
        .update(marketSelections)
        .set({
          status: "REFUNDED",
          settledAt: now,
        })
        .where(eq(marketSelections.id, selection.id))
    } else {
      await tx
        .update(marketSelections)
        .set({
          amount: selection.amount - removable,
        })
        .where(eq(marketSelections.id, selection.id))
    }

    await tx.insert(transactions).values({
      playerId,
      type: "MARKET_REFUND",
      marketId,
      marketSelectionId: selection.id,
      amount: removable,
    })

    remaining -= removable
  }

  if (remaining > 0) {
    throw new Error("Attempted to close more than open amount")
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ marketId: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { marketId } = await params
    const parsedMarketId = Number(marketId)

    if (!Number.isInteger(parsedMarketId) || parsedMarketId <= 0) {
      return NextResponse.json({ error: "Invalid market id" }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updatePositionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const { action, outcome, amount } = parsed.data
    const outcomeEnum = outcome === 1 ? "OUTCOME_1" : "OUTCOME_2"

    const player = await db.query.players.findFirst({
      where: eq(players.authId, user.id),
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
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

      if (market.status !== "OPEN") {
        return {
          kind: "error" as const,
          status: 409,
          body: { error: "Market is not open" },
        }
      }

      if (market.locksAt && market.locksAt.getTime() <= Date.now()) {
        return {
          kind: "error" as const,
          status: 409,
          body: { error: "Market is locked" },
        }
      }

      const openSelectionsForOutcome = await tx
        .select()
        .from(marketSelections)
        .where(
          and(
            eq(marketSelections.marketId, parsedMarketId),
            eq(marketSelections.playerId, player.id),
            eq(marketSelections.outcome, outcomeEnum),
            eq(marketSelections.status, "PLACED"),
          ),
        )
        .orderBy(asc(marketSelections.createdAt), asc(marketSelections.id))

      const currentOpenAmount = openSelectionsForOutcome.reduce((sum, selection) => sum + selection.amount, 0)

      if (action === "PLACED") {
        const balance = await getPlayerBalance(tx, player.id)

        if (balance < amount) {
          return {
            kind: "error" as const,
            status: 400,
            body: {
              error: "Insufficient balance",
              balance,
              required: amount,
            },
          }
        }

        const insertedSelections = await tx
          .insert(marketSelections)
          .values({
            marketId: parsedMarketId,
            playerId: player.id,
            outcome: outcomeEnum,
            amount,
            status: "PLACED",
          })
          .returning()

        const selection = insertedSelections[0]

        if (!selection) {
          throw new Error("Failed to create market selection")
        }

        await tx.insert(transactions).values({
          playerId: player.id,
          type: "MARKET_STAKE",
          marketId: parsedMarketId,
          marketSelectionId: selection.id,
          amount: -amount,
        })

        const newBalance = balance - amount

        return {
          kind: "ok" as const,
          body: {
            marketId: parsedMarketId,
            action,
            outcome,
            delta: amount,
            balance: newBalance,
            currentOpenAmount: currentOpenAmount + amount,
          },
        }
      }

      // CLOSED
      if (currentOpenAmount < amount) {
        return {
          kind: "error" as const,
          status: 400,
          body: {
            error: "Cannot close more than current open amount",
            currentOpenAmount,
            requestedCloseAmount: amount,
          },
        }
      }

      const now = new Date()

      await closeSelectionAmount(tx, openSelectionsForOutcome, amount, parsedMarketId, player.id, now)

      const balance = await getPlayerBalance(tx, player.id)
      const newBalance = balance + amount

      return {
        kind: "ok" as const,
        body: {
          marketId: parsedMarketId,
          action,
          outcome,
          delta: amount,
          balance: newBalance,
          currentOpenAmount: currentOpenAmount - amount,
        },
      }
    })

    if (result.kind === "error") {
      return NextResponse.json(result.body, { status: result.status })
    }

    return NextResponse.json(result.body, { status: 200 })
  } catch (error) {
    console.error("Failed to update market position:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
