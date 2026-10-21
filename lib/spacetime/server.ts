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

export async function spacetimeRoomExists(roomId: string) {
  const id = z.uuid().parse(roomId).toLowerCase()
  const response = await request(
    "sql",
    `SELECT id FROM rooms WHERE id = '${id}'`,
    "text/plain"
  )
  const result = (await response.json()) as { rows: unknown[][] }[]
  return result.some(({ rows }) => rows.length > 0)
}
