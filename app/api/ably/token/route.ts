import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { rooms } from "@/lib/schema"
import * as z from "zod"
import * as Ably from "ably"

export async function GET(request: Request) {
  const user = await currentUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const param = new URL(request.url).searchParams.get("roomId")
  const parsed = z.uuid().safeParse(param)

  if (!parsed.success) {
    return Response.json({ error: "Invalid room ID" }, { status: 400 })
  }

  const roomId = parsed.data

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    columns: { id: true },
  })

  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 })
  }

  const ably = new Ably.Rest({
    key: process.env.ABLY_TOKEN_ISSUER_KEY!,
  })

  const channel = `room:${roomId}`
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
