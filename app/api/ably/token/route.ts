import { auth } from "@clerk/nextjs/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { roomParticipants } from "@/lib/schema"
import * as z from "zod"
import * as Ably from "ably"
import { getGuestSession } from "@/lib/guest-session"

export async function GET(request: Request) {
  const { userId } = await auth()
  const guest = userId ? null : await getGuestSession()

  if (!userId && !guest) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const param = new URL(request.url).searchParams.get("roomId")
  const parsed = z.uuid().safeParse(param)

  if (!parsed.success) {
    return Response.json({ error: "Invalid room ID" }, { status: 400 })
  }

  const roomId = parsed.data

  const identityKey = userId ? `clerk:${userId}` : `guest:${guest!.id}`

  const participant = await db.query.roomParticipants.findFirst({
    where: and(
      eq(roomParticipants.roomId, roomId),
      eq(roomParticipants.identityKey, identityKey)
    ),
    columns: {
      id: true,
    },
  })

  if (!participant) {
    return Response.json({ error: "Not a room participant" }, { status: 403 })
  }

  const ably = new Ably.Rest({
    key: process.env.ABLY_TOKEN_ISSUER_KEY!,
  })

  const token = await ably.auth.requestToken({
    clientId: participant.id,
    capability: {
      [`room:${roomId}`]: ["presence", "subscribe"],
    },
  })

  return Response.json(token, {
    headers: { "Cache-Control": "no-store" },
  })
}
