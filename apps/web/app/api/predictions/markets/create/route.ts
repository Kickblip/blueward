import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { markets } from "@/lib/schema"
import { currentUser } from "@clerk/nextjs/server"
import { MINUTES_MARKET_IS_OPEN_BEFORE_LOCK } from "@repo/ui/config"

const createMarketSchema = z.object({
  title: z.string().trim().min(1).max(255),
  outcome1Title: z.string().trim().min(1).max(255),
  outcome2Title: z.string().trim().min(1).max(255),
})

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.privateMetadata.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const parsed = createMarketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        { status: 400 },
      )
    }

    const { title, outcome1Title, outcome2Title } = parsed.data

    if (outcome1Title === outcome2Title) {
      return NextResponse.json({ error: "Outcomes must be different" }, { status: 400 })
    }

    const now = new Date()
    const locksAt = new Date(now.getTime() + MINUTES_MARKET_IS_OPEN_BEFORE_LOCK * 60 * 1000)

    const [market] = await db
      .insert(markets)
      .values({
        title,
        status: "OPEN",
        locksAt,
        outcome1Title,
        outcome2Title,
      })
      .returning()

    return NextResponse.json(
      {
        market,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create market:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
