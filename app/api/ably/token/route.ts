import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { lobbies } from "@/lib/schema"
import * as z from "zod"
import * as Ably from "ably"

export async function GET(request: Request) {
  const user = await currentUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const param = new URL(request.url).searchParams.get("lobbyId")
  const parsed = z.uuid().safeParse(param)

  if (!parsed.success) {
    return Response.json({ error: "Invalid lobby ID" }, { status: 400 })
  }

  const lobbyId = parsed.data

  const lobby = await db.query.lobbies.findFirst({
    where: eq(lobbies.id, lobbyId),
    columns: { id: true },
  })

  if (!lobby) {
    return Response.json({ error: "Lobby not found" }, { status: 404 })
  }

  const ably = new Ably.Rest({
    key: process.env.ABLY_TOKEN_ISSUER_KEY!,
  })

  const channel = `lobby:${lobbyId}`
  const token = await ably.auth.requestToken({
    clientId: user.id,
    capability: {
      [channel]: ["presence", "subscribe"],
    },
  })

  return Response.json(token, {
    headers: { "Cache-Control": "no-store" },
  })
}
