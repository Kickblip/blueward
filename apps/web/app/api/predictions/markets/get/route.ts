import { NextResponse } from "next/server"
import { desc, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { markets, marketSelections, players } from "@/lib/schema"

export async function GET() {
  try {
    const marketRows = await db.select().from(markets).orderBy(desc(markets.createdAt))

    if (marketRows.length === 0) {
      return NextResponse.json({ markets: [] })
    }

    const marketIds = marketRows.map((market) => market.id)

    const selectionRows = await db
      .select({
        id: marketSelections.id,
        marketId: marketSelections.marketId,
        playerId: marketSelections.playerId,
        outcome: marketSelections.outcome,
        amount: marketSelections.amount,
        status: marketSelections.status,
        createdAt: marketSelections.createdAt,
      })
      .from(marketSelections)
      .where(inArray(marketSelections.marketId, marketIds))
      .orderBy(desc(marketSelections.createdAt))

    const playerIds = [...new Set(selectionRows.map((selection) => selection.playerId))]
    const playerRows =
      playerIds.length > 0
        ? await db
            .select({
              id: players.id,
              riotIdGameName: players.riotIdGameName,
            })
            .from(players)
            .where(inArray(players.id, playerIds))
        : []

    const playerNameById = new Map(playerRows.map((player) => [player.id, player.riotIdGameName]))

    const selectionsByMarketId = new Map<number, typeof selectionRows>()
    for (const selection of selectionRows) {
      const arr = selectionsByMarketId.get(selection.marketId) ?? []
      arr.push(selection)
      selectionsByMarketId.set(selection.marketId, arr)
    }

    const shapedMarkets = marketRows.map((market) => {
      const selections = selectionsByMarketId.get(market.id) ?? []

      const outcome1Selections = selections.filter(
        (selection) => selection.outcome === "OUTCOME_1" && selection.status === "PLACED",
      )
      const outcome2Selections = selections.filter(
        (selection) => selection.outcome === "OUTCOME_2" && selection.status === "PLACED",
      )

      const outcome1Volume = outcome1Selections.reduce((sum, selection) => sum + selection.amount, 0)
      const outcome2Volume = outcome2Selections.reduce((sum, selection) => sum + selection.amount, 0)
      const totalVolume = outcome1Volume + outcome2Volume

      const outcome1Orders = outcome1Selections.map((selection) => ({
        name: playerNameById.get(selection.playerId) ?? `Player ${selection.playerId}`,
        amount: selection.amount,
      }))

      const outcome2Orders = outcome2Selections.map((selection) => ({
        name: playerNameById.get(selection.playerId) ?? `Player ${selection.playerId}`,
        amount: selection.amount,
      }))

      return {
        id: market.id,
        title: market.title,
        status: market.status,
        locksAt: market.locksAt?.toISOString() ?? null,
        resolvedAt: market.resolvedAt?.toISOString() ?? null,
        resolvedOutcome: market.resolvedOutcome ?? null,
        outcomes: [
          {
            key: 1,
            title: market.outcome1Title,
            popularity: totalVolume > 0 ? outcome1Volume / totalVolume : 0.5,
            volume: outcome1Volume,
            orders: outcome1Orders,
          },
          {
            key: 2,
            title: market.outcome2Title,
            popularity: totalVolume > 0 ? outcome2Volume / totalVolume : 0.5,
            volume: outcome2Volume,
            orders: outcome2Orders,
          },
        ],
      }
    })

    return NextResponse.json({ markets: shapedMarkets })
  } catch (error) {
    console.error("Failed to fetch markets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
