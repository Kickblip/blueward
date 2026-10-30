import "server-only"

import * as z from "zod"

function configuration() {
  const uri = process.env.NEXT_PUBLIC_SPACETIMEDB_URI
  const database = process.env.NEXT_PUBLIC_SPACETIMEDB_DATABASE
  const token = process.env.SPACETIMEDB_SERVER_TOKEN
  if (!uri || !database || !token)
    throw new Error("SpaceTimeDB room backend is not configured")
  const base = uri
    .replace(/^ws:/, "http:")
    .replace(/^wss:/, "https:")
    .replace(/\/$/, "")
  return { base: `${base}/v1/database/${encodeURIComponent(database)}`, token }
}

async function request(path: string, body: string, contentType: string) {
  const { base, token } = configuration()
  const response = await fetch(`${base}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`Room service request failed (${response.status})`)
  }
  return response
}

export async function callRoomService(
  reducer: "issue_ticket" | "create_room",
  payload: object
) {
  await request(
    `call/${reducer}`,
    JSON.stringify([JSON.stringify(payload)]),
    "application/json"
  )
}

export async function getSpacetimeRoom(roomId: string) {
  const id = z.uuid().parse(roomId).toLowerCase()

  const response = await request(
    "sql",
    `SELECT force_sign_in, force_rank_roles FROM rooms WHERE id = '${id}'`,
    "text/plain"
  )

  const result = z
    .array(
      z.object({
        rows: z.array(z.tuple([z.boolean(), z.boolean()])),
      })
    )
    .parse(await response.json())

  const row = result.flatMap(({ rows }) => rows)[0]

  if (!row) return null

  return {
    forceSignIn: row[0],
    forceRankRoles: row[1],
  }
}

export async function spacetimeRoomBanned(roomId: string, authId: string) {
  const id = z.uuid().parse(roomId).toLowerCase()
  const userId = z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/)
    .parse(authId)

  const roomIdentity = `${id}:clerk:${userId}`

  const response = await request(
    "sql",
    `SELECT room_identity FROM room_bans WHERE room_identity = '${roomIdentity}'`,
    "text/plain"
  )

  const result = z
    .array(
      z.object({
        rows: z.array(z.tuple([z.string()])),
      })
    )
    .parse(await response.json())

  return result.some(({ rows }) => rows.length > 0)
}
