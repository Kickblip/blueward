import { auth } from "@clerk/nextjs/server"
import { and, eq, gt, isNull, or, sql } from "drizzle-orm"

import { BANNER_CONFIG } from "@/lib/config"
import { db } from "@/lib/db"
import {
  players,
  promoCodeRedemptions,
  promoCodes,
  transactions,
} from "@/lib/schema"
import { z } from "zod"

const promoCodeRequestSchema = z.object({
  code: z
    .string({ error: "Code is required" })
    .trim()
    .min(1, "Code is required")
    .max(64, "Code must be 64 characters or fewer")
    .toUpperCase(),
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = promoCodeRequestSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid promo code",
      },
      { status: 400 }
    )
  }

  const { code } = parsed.data

  try {
    const result = await db.transaction(async (tx) => {
      const [player] = await tx
        .select({
          id: players.id,
          banners: players.banners,
        })
        .from(players)
        .where(eq(players.authId, userId))
        .limit(1)
        .for("update")

      if (!player) {
        return {
          ok: false as const,
          reason: "PLAYER_NOT_FOUND" as const,
        }
      }

      const [promoCode] = await tx
        .select({
          code: promoCodes.code,
          rewardType: promoCodes.rewardType,
          rewardValue: promoCodes.rewardValue,
        })
        .from(promoCodes)
        .where(
          and(
            eq(promoCodes.code, code),
            or(
              isNull(promoCodes.expiresAt),
              gt(promoCodes.expiresAt, sql`now()`)
            )
          )
        )
        .limit(1)

      if (!promoCode) {
        return {
          ok: false as const,
          reason: "INVALID_OR_EXPIRED" as const,
        }
      }

      if (promoCode.rewardType === "BALANCE" && promoCode.rewardValue <= 0) {
        return {
          ok: false as const,
          reason: "MISCONFIGURED" as const,
        }
      }

      const banner =
        promoCode.rewardType === "BANNER"
          ? BANNER_CONFIG[promoCode.rewardValue as keyof typeof BANNER_CONFIG]
          : undefined

      if (promoCode.rewardType === "BANNER" && !banner) {
        return {
          ok: false as const,
          reason: "MISCONFIGURED" as const,
        }
      }

      if (
        promoCode.rewardType === "BANNER" &&
        player.banners.includes(promoCode.rewardValue)
      ) {
        return {
          ok: false as const,
          reason: "BANNER_ALREADY_OWNED" as const,
        }
      }

      const [redemption] = await tx
        .insert(promoCodeRedemptions)
        .values({
          promoCode: promoCode.code,
          playerId: player.id,
        })
        .onConflictDoNothing()
        .returning({ promoCode: promoCodeRedemptions.promoCode })

      if (!redemption) {
        return {
          ok: false as const,
          reason: "ALREADY_REDEEMED" as const,
        }
      }

      if (promoCode.rewardType === "BALANCE") {
        await tx.insert(transactions).values({
          playerId: player.id,
          type: "PROMO_CODE",
          amount: promoCode.rewardValue,
        })

        return {
          ok: true as const,
          reward: {
            type: "CRYSTALS" as const,
            amount: promoCode.rewardValue,
          },
        }
      }

      await tx
        .update(players)
        .set({
          banners: sql`array_append(${players.banners}, ${promoCode.rewardValue})`,
        })
        .where(eq(players.id, player.id))

      return {
        ok: true as const,
        reward: {
          type: "BANNER" as const,
          bannerId: promoCode.rewardValue,
          name: banner!.name,
        },
      }
    })

    if (!result.ok) {
      switch (result.reason) {
        case "PLAYER_NOT_FOUND":
          return Response.json({ error: "Player not found" }, { status: 404 })

        case "INVALID_OR_EXPIRED":
          return Response.json(
            { error: "Invalid or expired promo code" },
            { status: 400 }
          )

        case "ALREADY_REDEEMED":
          return Response.json(
            { error: "You have already redeemed this code" },
            { status: 409 }
          )

        case "BANNER_ALREADY_OWNED":
          return Response.json(
            { error: "You already own this banner" },
            { status: 409 }
          )

        case "MISCONFIGURED":
          return Response.json(
            { error: "This promo code is unavailable" },
            { status: 500 }
          )
      }
    }

    return Response.json({
      redeemed: true,
      reward: result.reward,
    })
  } catch (error) {
    console.error("Promo code redemption failed:", error)

    return Response.json(
      { error: "Failed to redeem promo code" },
      { status: 500 }
    )
  }
}
