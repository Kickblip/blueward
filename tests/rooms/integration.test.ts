import assert from "node:assert/strict"
import { spawn, type ChildProcess } from "node:child_process"
import { randomUUID } from "node:crypto"
import { once } from "node:events"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, before, test } from "node:test"
import { setTimeout as sleep } from "node:timers/promises"
import { DbConnection } from "../../lib/spacetime/module_bindings"

const database = "room-tests"
const clients = new Map<DbConnection, string>()
let server: ChildProcess
let directory: string
let base: string
let publisher: { token: string }

async function eventually(check: () => boolean | Promise<boolean>) {
  const deadline = Date.now() + 10_000
  while (!(await check())) {
    assert.ok(Date.now() < deadline, "Timed out waiting for room state")
    await sleep(25)
  }
}

async function request(
  path: string,
  body: string,
  token = publisher.token,
  method = "POST"
) {
  const response = await fetch(
    `${base}/v1/database/${database}${path.startsWith("?") ? "" : "/"}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": path.startsWith("call/")
          ? "application/json"
          : "text/plain",
      },
      body,
      signal: AbortSignal.timeout(10_000),
    }
  )
  const text = await response.text()
  assert.ok(response.ok, `${path}: ${response.status} ${text}`)
  return text
}

before(async () => {
  const listener = createServer().listen(0, "127.0.0.1")
  await once(listener, "listening")
  const address = listener.address()
  assert.ok(address && typeof address !== "string")
  base = `http://127.0.0.1:${address.port}`
  await new Promise<void>((resolve) => listener.close(() => resolve()))
  directory = await mkdtemp(join(tmpdir(), "blueward-room-tests-"))
  server = spawn(
    "spacetime",
    [
      "start",
      "--listen-addr",
      `127.0.0.1:${address.port}`,
      "--data-dir",
      directory,
      "--in-memory",
      "--non-interactive",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  )
  let logs = ""
  server.stdout?.on("data", (data) => {
    logs = (logs + data).slice(-8000)
  })
  server.stderr?.on("data", (data) => {
    logs = (logs + data).slice(-8000)
  })
  await eventually(async () => {
    assert.equal(server.exitCode, null, logs)
    const response = await fetch(`${base}/v1/identity`, {
      method: "POST",
    }).catch(() => null)
    if (!response?.ok) return false
    publisher = await response.json()
    return true
  })
  await request(
    "?host_type=Js",
    await readFile("spacetimedb/dist/bundle.js", "utf8"),
    publisher.token,
    "PUT"
  )
})

after(async () => {
  for (const client of clients.keys()) client.disconnect()
  if (server && server.exitCode === null) {
    const stopped = once(server, "exit")
    server.kill("SIGKILL")
    await stopped
  }
  if (directory) await rm(directory, { recursive: true, force: true })
})

async function connect() {
  const connection = await new Promise<DbConnection>((resolve, reject) => {
    DbConnection.builder()
      .withUri(base)
      .withDatabaseName(database)
      .withCompression("none")
      .onConnect((client, _identity, token) => {
        clients.set(client, token)
        resolve(client)
      })
      .onConnectError((_ctx, error) => reject(error))
      .build()
  })
  await new Promise<void>((resolve, reject) => {
    connection
      .subscriptionBuilder()
      .onApplied(() => resolve())
      .onError((ctx) => reject(ctx.event))
      .subscribe([
        "SELECT * FROM my_session",
        "SELECT * FROM room_info",
        "SELECT * FROM room_participants",
        "SELECT * FROM room_lobbies",
        "SELECT * FROM room_assignments",
      ])
  })
  return connection
}

async function room() {
  const value = {
    roomId: randomUUID(),
    lobbyId: randomUUID(),
    ownerAuthId: "user_owner",
  }
  await request("call/create_room", JSON.stringify([JSON.stringify(value)]))
  return value
}

const profile = {
  id: 1,
  puuid: "test",
  riotIdGameName: "Player",
  riotIdTagline: "NA1",
  experience: 0,
  bannerId: 0,
  avatarUrl: "https://img.clerk.com/avatar.png",
}

async function ticket(
  client: DbConnection,
  roomId: string,
  identityKey = "clerk:user_owner",
  overrides = {}
) {
  const value = {
    ticket: randomUUID(),
    roomId,
    clientIdentity: client.identity!.toHexString(),
    identityKey,
    displayName: "Player",
    profileJson: identityKey.startsWith("clerk:")
      ? JSON.stringify(profile)
      : null,
    expiresAtMs: Date.now() + 600_000,
    refresh: false,
    ...overrides,
  }
  await request("call/issue_ticket", JSON.stringify([JSON.stringify(value)]))
  return value.ticket
}

async function joinRoom(
  client: DbConnection,
  roomId: string,
  identityKey?: string,
  overrides = {}
) {
  await client.reducers.joinRoom({
    ticket: await ticket(client, roomId, identityKey, overrides),
  })
  await eventually(() =>
    [...client.db.mySession.iter()].some((row) => row.roomId === roomId)
  )
  return [...client.db.mySession.iter()][0].participantId
}

async function privateRows(query: string) {
  return (JSON.parse(await request("sql", query)) as { rows: unknown[][] }[])[0]
    .rows
}

test("signed-in profiles with avatars join; tickets are bound, one-use and publisher-only", async () => {
  const { roomId } = await room()
  const member = await connect()
  const outsider = await connect()
  const credential = await ticket(member, roomId)
  await assert.rejects(outsider.reducers.joinRoom({ ticket: credential }))
  await member.reducers.joinRoom({ ticket: credential })
  await eventually(() => [...member.db.roomParticipants.iter()].length === 1)
  assert.equal(
    JSON.parse([...member.db.roomParticipants.iter()][0].profileJson!)
      .avatarUrl,
    profile.avatarUrl
  )
  await assert.rejects(member.reducers.joinRoom({ ticket: credential }))
  await assert.rejects(
    outsider.reducers.createRoom({
      payload: JSON.stringify({
        roomId: randomUUID(),
        lobbyId: randomUUID(),
        ownerAuthId: "attacker",
      }),
    })
  )
  await assert.rejects(outsider.reducers.issueTicket({ payload: "{}" }))
  assert.equal([...outsider.db.roomParticipants.iter()].length, 0)
})

test("subscriptions and mutations stay inside the authorized room; base tables are private", async () => {
  const first = await room()
  const second = await room()
  const member = await connect()
  await joinRoom(member, first.roomId)
  assert.deepEqual(
    [...member.db.roomInfo.iter()].map((row) => row.id),
    [first.roomId]
  )
  await assert.rejects(
    member.reducers.createLobby({
      roomId: second.roomId,
      lobbyId: randomUUID(),
    })
  )
  await assert.rejects(ticket(member, second.roomId))
  const response = await fetch(`${base}/v1/database/${database}/sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${clients.get(member)}` },
    body: "SELECT * FROM accounts",
  })
  assert.equal(response.status, 400)
  assert.match(
    await response.text(),
    /private|not found|not authorized|does not exist/i
  )
})

test("one account supplies profiles and preferences to all memberships", async () => {
  const first = await room()
  const second = await room()
  const a = await connect()
  const b = await connect()
  const identity = "clerk:user_shared"
  await joinRoom(a, first.roomId, identity)
  await joinRoom(b, second.roomId, identity)
  await a.reducers.saveLobbyPreferences({
    roomId: first.roomId,
    roles: ["JUNGLE"],
    rank: "GOLD",
  })
  await eventually(() => [...b.db.roomParticipants.iter()][0]?.rank === "GOLD")
  await joinRoom(a, first.roomId, identity, {
    refresh: true,
    displayName: "Updated",
    profileJson: JSON.stringify({ ...profile, bannerId: 2 }),
  })
  await eventually(
    () => [...b.db.roomParticipants.iter()][0]?.displayName === "Updated"
  )
  const row = [...b.db.roomParticipants.iter()][0]
  assert.deepEqual(row.roles, ["JUNGLE"])
  assert.equal(JSON.parse(row.profileJson!).bannerId, 2)
  assert.equal(
    (
      await privateRows(
        `SELECT * FROM accounts WHERE identity_key = '${identity}'`
      )
    ).length,
    1
  )
  const memberships = await privateRows(
    `SELECT * FROM participants WHERE identity_key = '${identity}'`
  )
  assert.equal(memberships.length, 2)
  assert.ok(memberships.every((membership) => membership.length === 4))
  await assert.rejects(
    a.reducers.saveLobbyPreferences({
      roomId: first.roomId,
      roles: ["FILL"],
      rank: undefined,
    })
  )
  await assert.rejects(
    a.reducers.saveLobbyPreferences({
      roomId: first.roomId,
      roles: ["TOP", "TOP"],
      rank: undefined,
    })
  )
})

test("dummy accounts are deleted when kicked; only a signed-in player can take ownership", async () => {
  const { roomId } = await room()
  const owner = await connect()
  const member = await connect()
  await joinRoom(owner, roomId)
  const memberId = await joinRoom(member, roomId, "clerk:user_successor")
  const participantId = randomUUID()
  await owner.reducers.addDummy({
    roomId,
    participantId,
    displayName: "Dummy",
    roles: ["TOP"],
    rank: "IRON",
  })
  await assert.rejects(
    owner.reducers.makeParticipantOwner({ roomId, participantId })
  )
  await owner.reducers.kickParticipant({ roomId, participantId })
  assert.equal(
    (
      await privateRows(
        `SELECT * FROM accounts WHERE identity_key = 'dummy:${participantId}'`
      )
    ).length,
    0
  )
  await owner.reducers.makeParticipantOwner({ roomId, participantId: memberId })
  await member.reducers.createLobby({ roomId, lobbyId: randomUUID() })
  await assert.rejects(
    owner.reducers.createLobby({ roomId, lobbyId: randomUUID() })
  )
})

test("simultaneous moves into the fifth slot admit exactly one player", async () => {
  const { roomId, lobbyId } = await room()
  const owner = await connect()
  const otherTab = await connect()
  await joinRoom(owner, roomId)
  await joinRoom(otherTab, roomId)
  const ids = Array.from({ length: 6 }, () => randomUUID())
  for (const participantId of ids) {
    await owner.reducers.addDummy({
      roomId,
      participantId,
      displayName: "Dummy",
      roles: ["TOP"],
      rank: "IRON",
    })
  }
  for (const participantId of ids.slice(0, 4)) {
    await owner.reducers.moveParticipantToTeam({
      lobbyId,
      participantId,
      teamId: 0,
    })
  }
  const results = await Promise.allSettled([
    owner.reducers.moveParticipantToTeam({
      lobbyId,
      participantId: ids[4],
      teamId: 0,
    }),
    otherTab.reducers.moveParticipantToTeam({
      lobbyId,
      participantId: ids[5],
      teamId: 0,
    }),
  ])
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1
  )
  await eventually(() => [...owner.db.roomAssignments.iter()].length === 5)
})

test("renewal replaces the expiry schedule and an expired session loses access", async () => {
  const { roomId } = await room()
  const owner = await connect()
  const participantId = await joinRoom(owner, roomId, undefined, {
    expiresAtMs: Date.now() + 1500,
  })
  await joinRoom(owner, roomId, undefined, { refresh: true })
  await sleep(1600)
  assert.equal([...owner.db.mySession.iter()][0]?.participantId, participantId)
  await owner.reducers.createLobby({ roomId, lobbyId: randomUUID() })
  const guest = await connect()
  await joinRoom(guest, roomId, `guest:${randomUUID()}`, {
    expiresAtMs: Date.now() + 1000,
  })
  await eventually(() => [...guest.db.mySession.iter()].length === 0)
  assert.equal([...guest.db.roomParticipants.iter()].length, 0)
  await assert.rejects(
    guest.reducers.saveLobbyPreferences({ roomId, roles: [], rank: undefined })
  )
})

test("kicking a member revokes every tab and outstanding ticket; refresh cannot rejoin", async () => {
  const { roomId } = await room()
  const owner = await connect()
  const a = await connect()
  const b = await connect()
  await joinRoom(owner, roomId)
  const identity = `guest:${randomUUID()}`
  const participantId = await joinRoom(a, roomId, identity)
  await joinRoom(b, roomId, identity)
  const pending = await ticket(a, roomId, identity, { refresh: true })
  await owner.reducers.kickParticipant({ roomId, participantId })
  await eventually(
    () =>
      [...a.db.mySession.iter()].length === 0 &&
      [...b.db.mySession.iter()].length === 0
  )
  await assert.rejects(a.reducers.joinRoom({ ticket: pending }))
  await assert.rejects(ticket(a, roomId, identity, { refresh: true }))
})
