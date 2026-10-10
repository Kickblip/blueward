import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mock, test } from "node:test"

let player: object | undefined
const user = { id: "user_test", imageUrl: "https://img.clerk.com/avatar.png" }
const service = mock.fn(async (reducer: string, payload: object) => ({
  reducer,
  payload,
}))
mock.module("@clerk/nextjs/server", {
  namedExports: {
    currentUser: async () => user,
    auth: async () => ({ userId: user.id }),
  },
})
mock.module("next/navigation", {
  namedExports: {
    redirect: (path: string) => {
      throw new Error(`REDIRECT ${path}`)
    },
  },
})
mock.module(new URL("../../lib/db.ts", import.meta.url).href, {
  namedExports: {
    db: {
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => (player ? [player] : []) }),
        }),
      }),
    },
  },
})
mock.module(new URL("../../lib/guest-session.ts", import.meta.url).href, {
  namedExports: {
    guestDisplayNameSchema: (await import("zod")).z.string(),
    getGuestSession: async () => null,
    saveGuestSession: async () => {},
  },
})
mock.module(new URL("../../lib/spacetime/server.ts", import.meta.url).href, {
  namedExports: {
    callRoomService: service,
    spacetimeRoomExists: async () => true,
  },
})
const { issueRoomTicket } =
  await import("../../app/(no-sidebar)/room/[roomId]/actions")

test("an unlinked account goes to profile setup with the room as its return path", async () => {
  const roomId = randomUUID()
  await assert.rejects(
    issueRoomTicket(roomId, "a".repeat(64), false, user.id),
    {
      message: `REDIRECT /claim-riot?next=${encodeURIComponent(`/room/${roomId}`)}`,
    }
  )
  assert.equal(service.mock.callCount(), 0)
})

test("a linked account issues a ticket with its HTTPS avatar", async () => {
  player = {
    id: 1,
    puuid: "test",
    riotIdGameName: "Player",
    riotIdTagline: "NA1",
    experience: 0,
    bannerId: 0,
  }
  const result = await issueRoomTicket(
    randomUUID(),
    "a".repeat(64),
    false,
    user.id
  )
  assert.match(result.ticket, /^[a-f0-9-]{36}$/)
  assert.equal(service.mock.callCount(), 1)
  const [reducer, payload] = service.mock.calls[0].arguments
  assert.equal(reducer, "issue_ticket")
  assert.ok("profileJson" in payload && typeof payload.profileJson === "string")
  assert.equal(JSON.parse(payload.profileJson).avatarUrl, user.imageUrl)
})
