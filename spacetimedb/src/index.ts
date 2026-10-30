import {
  ScheduleAt,
  schema,
  table,
  t,
  SenderError,
  type InferSchema,
  type ReducerCtx,
  type ViewCtx,
} from "spacetimedb/server"
import type { z } from "zod"
import {
  uuid,
  displayName,
  preferences,
  ticketPayload,
  roomPayload,
} from "./validation"
import { DRAFT_PICK_ORDER } from "../../lib/draft"

const configuration = table(
  { name: "configuration" },
  {
    id: t.u8().primaryKey(),
    publisher: t.identity(),
  }
)

const rooms = table(
  { name: "rooms" },
  {
    id: t.string().primaryKey(),
    ownerAuthId: t.string(),
    forceSignIn: t.bool().default(false),
    forceRankRoles: t.bool().default(true),
  }
)

const roomBans = table(
  { name: "room_bans" },
  {
    roomIdentity: t.string().primaryKey(),
  }
)

const playerFields = {
  displayName: t.string(),
  profileJson: t.option(t.string()),
  roles: t.array(t.string()),
  rank: t.option(t.string()),
}

const accounts = table(
  { name: "accounts" },
  {
    identityKey: t.string().primaryKey(),
    ...playerFields,
  }
)

const participants = table(
  { name: "participants" },
  {
    id: t.string().primaryKey(),
    roomId: t.string().index(),
    identityKey: t.string(),
    roomIdentity: t.string().unique(),
  }
)

const lobbies = table(
  { name: "lobbies" },
  {
    id: t.string().primaryKey(),
    roomId: t.string().index(),
    ordinal: t.u32(),
    phase: t.string(),
    draftPickIndex: t.u32(),
  }
)

const assignments = table(
  { name: "assignments" },
  {
    participantId: t.string().primaryKey(),
    lobbyId: t.string().index(),
    roomId: t.string().index(),
    teamId: t.u8(),
    isCaptain: t.bool(),
  }
)

const tickets = table(
  { name: "tickets" },
  {
    id: t.u64().primaryKey().autoInc(),
    ticket: t.string().unique(),
    roomId: t.string().index(),
    clientIdentity: t.string().index(),
    identityKey: t.string(),
    payload: t.string(),
    expiresAtMs: t.f64(),
    scheduledAt: t.scheduleAt(),
  }
)

const sessions = table(
  { name: "sessions" },
  {
    id: t.u64().primaryKey().autoInc(),
    clientIdentity: t.string().unique(),
    connectionId: t.string().unique(),
    roomId: t.string().index(),
    participantId: t.string().index(),
    identityKey: t.string(),
    expiresAtMs: t.f64(),
    scheduledAt: t.scheduleAt(),
  }
)

const spacetimedb = schema({
  configuration,
  rooms,
  roomBans,
  accounts,
  participants,
  lobbies,
  assignments,
  tickets,
  sessions,
})

export default spacetimedb

type Context = ReducerCtx<InferSchema<typeof spacetimedb>>
type ReadContext = ViewCtx<InferSchema<typeof spacetimedb>>

function fail(message: string): never {
  throw new SenderError(message)
}

function parse<T extends z.ZodType>(validator: T, input: unknown): z.output<T> {
  const result = validator.safeParse(input)

  if (!result.success)
    fail(result.error.issues[0]?.message ?? "Invalid request")

  return result.data
}

function json(payload: string): unknown {
  try {
    return JSON.parse(payload)
  } catch {
    return fail("Invalid JSON payload")
  }
}

function now(ctx: Context) {
  return Number(ctx.timestamp.microsSinceUnixEpoch / 1000n)
}

function scheduledAt(milliseconds: number) {
  return ScheduleAt.time(BigInt(milliseconds) * 1000n)
}

function publisher(ctx: Context) {
  const config = ctx.db.configuration.id.find(0)

  if (!config || !config.publisher.isEqual(ctx.sender))
    fail("Publisher authorization required")
}

function currentSession(ctx: ReadContext | Context) {
  return ctx.db.sessions.clientIdentity.find(ctx.sender.toHexString())
}

function session(ctx: Context) {
  const grant = currentSession(ctx)

  if (
    !grant ||
    grant.expiresAtMs <= now(ctx) ||
    grant.connectionId !== ctx.connectionId?.toHexString()
  )
    fail("Room session expired")

  if (!ctx.db.participants.id.find(grant.participantId))
    fail("Room membership ended")

  return grant
}

function owner(ctx: Context, roomId: string) {
  const grant = session(ctx)
  const room = ctx.db.rooms.id.find(roomId)

  if (
    !room ||
    grant.roomId !== roomId ||
    grant.identityKey !== `clerk:${room.ownerAuthId}`
  )
    fail("Room not found or unauthorized")

  return room
}

function ownedLobby(ctx: Context, lobbyId: string) {
  const lobby = ctx.db.lobbies.id.find(lobbyId)

  if (!lobby) fail("Lobby not found")

  owner(ctx, lobby.roomId)

  return lobby
}

function participantInRoom(
  ctx: Context,
  roomId: string,
  participantId: string
) {
  const participant = ctx.db.participants.id.find(participantId)

  if (!participant || participant.roomId !== roomId)
    fail("Player not found in this room")

  return participant
}

function teamHasSpace(
  ctx: Context,
  lobbyId: string,
  teamId: number,
  participantId: string
) {
  if (teamId !== 0 && teamId !== 1) fail("Invalid team")

  const count = [...ctx.db.assignments.lobbyId.filter(lobbyId)].filter(
    (row) => row.teamId === teamId && row.participantId !== participantId
  ).length

  if (count >= 5) fail("Team is full")
}

export const init = spacetimedb.init((ctx) => {
  ctx.db.configuration.insert({ id: 0, publisher: ctx.sender })
})

export const createRoom = spacetimedb.reducer(
  { payload: t.string() },
  (ctx, { payload }) => {
    publisher(ctx)

    const { roomId, lobbyId, ownerAuthId, forceSignIn, forceRankRoles } = parse(
      roomPayload,
      json(payload)
    )

    if (ctx.db.rooms.id.find(roomId) || ctx.db.lobbies.id.find(lobbyId))
      fail("Room already exists")

    ctx.db.rooms.insert({
      id: roomId,
      ownerAuthId,
      forceSignIn,
      forceRankRoles,
    })

    ctx.db.lobbies.insert({
      id: lobbyId,
      roomId,
      ordinal: 1,
      phase: "OPEN",
      draftPickIndex: 0,
    })
  }
)

function requireRoomAccess(ctx: Context, roomId: string, identityKey: string) {
  const room = ctx.db.rooms.id.find(roomId)

  if (!room) fail("Room not found")

  if (room.forceSignIn && !identityKey.startsWith("clerk:"))
    fail("Sign in to join this room")

  if (ctx.db.roomBans.roomIdentity.find(`${roomId}:${identityKey}`))
    fail("You are banned from this room")
}

export const issueTicket = spacetimedb.reducer(
  { payload: t.string() },
  (ctx, { payload }) => {
    publisher(ctx)

    const value = parse(ticketPayload, json(payload))

    requireRoomAccess(ctx, value.roomId, value.identityKey)

    if (value.expiresAtMs <= now(ctx)) fail("Credential expired")

    if (
      value.refresh &&
      !ctx.db.participants.roomIdentity.find(
        `${value.roomId}:${value.identityKey}`
      )
    )
      fail("Room membership ended")

    const previous = ctx.db.sessions.clientIdentity.find(value.clientIdentity)

    if (
      previous &&
      (previous.roomId !== value.roomId ||
        previous.identityKey !== value.identityKey)
    )
      fail("Connection belongs to another room session")

    for (const ticket of ctx.db.tickets.clientIdentity.filter(
      value.clientIdentity
    ))
      ctx.db.tickets.id.delete(ticket.id)

    const expiresAtMs = Math.min(now(ctx) + 60_000, value.expiresAtMs)

    ctx.db.tickets.insert({
      id: 0n,
      ticket: value.ticket,
      roomId: value.roomId,
      clientIdentity: value.clientIdentity,
      identityKey: value.identityKey,
      payload: JSON.stringify(value),
      expiresAtMs,
      scheduledAt: scheduledAt(expiresAtMs),
    })
  }
)

export const joinRoom = spacetimedb.reducer(
  { ticket: t.string() },
  (ctx, { ticket }) => {
    if (!ctx.connectionId) fail("A live connection is required")

    // Find the ticket and check it
    const credential = ctx.db.tickets.ticket.find(ticket)

    if (
      !credential ||
      credential.expiresAtMs <= now(ctx) ||
      credential.clientIdentity !== ctx.sender.toHexString()
    )
      fail("Invalid or expired room ticket")

    // Who the ticket is for and which room they want
    const value = parse(ticketPayload, json(credential.payload))

    requireRoomAccess(ctx, value.roomId, value.identityKey)

    // Check if this person is already in that room
    const roomIdentity = `${value.roomId}:${value.identityKey}`
    const existing = ctx.db.participants.roomIdentity.find(roomIdentity)
    if (value.refresh && !existing) fail("Room membership ended")

    // Connections can only be tied to one person so does the new ticket represent the same person
    // Find the existing session for a connection identity
    const previous = currentSession(ctx)

    // Check if the ticket's desired room and player matches what we already have
    if (
      previous &&
      (previous.roomId !== value.roomId ||
        previous.identityKey !== value.identityKey)
    )
      fail("Connection belongs to another room session")

    // Creates or updates their account information in the accounts table
    const account = ctx.db.accounts.identityKey.find(value.identityKey)
    const profile = {
      identityKey: value.identityKey,
      displayName: value.displayName,
      profileJson: value.profileJson ?? undefined,
      roles: account?.roles ?? [],
      rank: account?.rank,
    }
    if (account) ctx.db.accounts.identityKey.update(profile)
    else ctx.db.accounts.insert(profile)

    // Use the existing membership or create a new one in the participants table
    const participant =
      existing ??
      ctx.db.participants.insert({
        id: ctx.newUuidV4().toString(),
        roomId: value.roomId,
        roomIdentity,
        identityKey: value.identityKey,
      })

    const expiresAtMs = Math.min(now(ctx) + 600_000, value.expiresAtMs)

    if (expiresAtMs <= now(ctx)) fail("Credential expired")

    if (previous) ctx.db.sessions.id.delete(previous.id)

    // Update/create the new session that ties a connection to a player
    ctx.db.sessions.insert({
      id: 0n,
      clientIdentity: ctx.sender.toHexString(),
      connectionId: ctx.connectionId.toHexString(),
      roomId: value.roomId,
      participantId: participant.id,
      identityKey: value.identityKey,
      expiresAtMs,
      scheduledAt: scheduledAt(expiresAtMs),
    })

    // Remove the ticket
    ctx.db.tickets.id.delete(credential.id)
  }
)

export const expireSession = spacetimedb.reducer(
  { onSchedule: sessions },
  { arg: sessions.rowType },
  (ctx, { arg }) => {
    const current = ctx.db.sessions.id.find(arg.id)

    if (current && current.expiresAtMs <= now(ctx))
      ctx.db.sessions.id.delete(current.id)
  }
)
export const expireTicket = spacetimedb.reducer(
  { onSchedule: tickets },
  { arg: tickets.rowType },
  (ctx, { arg }) => {
    ctx.db.tickets.id.delete(arg.id)
  }
)

export const clientDisconnected = spacetimedb.clientDisconnected((ctx) => {
  if (!ctx.connectionId) return

  const grant = ctx.db.sessions.connectionId.find(
    ctx.connectionId.toHexString()
  )

  if (grant) ctx.db.sessions.id.delete(grant.id)
})

export const mySession = spacetimedb.view(
  { public: true },
  t.option(
    t.row("MyRoomSession", {
      participantId: t.string().primaryKey(),
      roomId: t.string(),
      identityKey: t.string(),
      expiresAtMs: t.f64(),
    })
  ),
  (ctx) => {
    const grant = currentSession(ctx)
    return grant
      ? {
          participantId: grant.participantId,
          roomId: grant.roomId,
          identityKey: grant.identityKey,
          expiresAtMs: grant.expiresAtMs,
        }
      : undefined
  }
)

export const roomInfo = spacetimedb.view(
  { public: true },
  t.option(rooms.rowType),
  (ctx) => {
    const grant = currentSession(ctx)
    return grant ? (ctx.db.rooms.id.find(grant.roomId) ?? undefined) : undefined
  }
)

export const roomParticipants = spacetimedb.view(
  { public: true },
  t.array(
    t.row("RoomParticipant", {
      id: t.string().primaryKey(),
      roomId: t.string(),
      ...playerFields,
      isOnline: t.bool(),
      isDummy: t.bool(),
    })
  ),
  (ctx) => {
    const grant = currentSession(ctx)

    if (!grant) return []

    return [...ctx.db.participants.roomId.filter(grant.roomId)].flatMap(
      (participant) => {
        const account = ctx.db.accounts.identityKey.find(
          participant.identityKey
        )

        if (!account) return []

        return [
          {
            id: participant.id,
            roomId: participant.roomId,
            displayName: account.displayName,
            profileJson: account.profileJson,
            roles: account.roles,
            rank: account.rank,
            isOnline:
              [...ctx.db.sessions.participantId.filter(participant.id)].length >
              0,
            isDummy: participant.identityKey.startsWith("dummy:"),
          },
        ]
      }
    )
  }
)

export const roomLobbies = spacetimedb.view(
  { public: true },
  t.array(lobbies.rowType),
  (ctx) => {
    const grant = currentSession(ctx)
    return grant ? [...ctx.db.lobbies.roomId.filter(grant.roomId)] : []
  }
)

export const roomAssignments = spacetimedb.view(
  { public: true },
  t.array(assignments.rowType),
  (ctx) => {
    const grant = currentSession(ctx)
    return grant ? [...ctx.db.assignments.roomId.filter(grant.roomId)] : []
  }
)

export const saveLobbyPreferences = spacetimedb.reducer(
  {
    roomId: t.string(),
    roles: t.array(t.string()),
    rank: t.option(t.string()),
  },
  (ctx, args) => {
    const grant = session(ctx)

    if (grant.roomId !== args.roomId) fail("Unauthorized")

    const value = parse(preferences, {
      roles: args.roles,
      rank: args.rank ?? null,
    })

    const account = ctx.db.accounts.identityKey.find(grant.identityKey)

    if (!account) fail("Player not found")

    ctx.db.accounts.identityKey.update({
      ...account,
      roles: value.roles,
      rank: value.rank ?? undefined,
    })
  }
)

export const addDummy = spacetimedb.reducer(
  {
    roomId: t.string(),
    participantId: t.string(),
    displayName: t.string(),
    roles: t.array(t.string()),
    rank: t.string(),
  },
  (ctx, args) => {
    owner(ctx, args.roomId)

    parse(uuid, args.participantId)

    const name = parse(displayName, args.displayName)
    const value = parse(preferences, args)

    if (!value.roles.length) fail("Select at least one position")

    const identityKey = `dummy:${args.participantId}`

    ctx.db.accounts.insert({
      identityKey,
      displayName: name,
      profileJson: undefined,
      roles: value.roles,
      rank: value.rank ?? undefined,
    })

    ctx.db.participants.insert({
      id: args.participantId,
      roomId: args.roomId,
      identityKey,
      roomIdentity: `${args.roomId}:${identityKey}`,
    })
  }
)

const roomParticipantArgs = { roomId: t.string(), participantId: t.string() }
const lobbyParticipantArgs = { lobbyId: t.string(), participantId: t.string() }

export const makeParticipantOwner = spacetimedb.reducer(
  roomParticipantArgs,
  (ctx, { roomId, participantId }) => {
    const room = owner(ctx, roomId)
    const target = participantInRoom(ctx, roomId, participantId)

    if (
      !target.identityKey.startsWith("clerk:") ||
      !ctx.db.accounts.identityKey.find(target.identityKey)?.profileJson
    )
      fail("Only signed-in players can own a room")

    ctx.db.rooms.id.update({
      ...room,
      ownerAuthId: target.identityKey.slice(6),
    })
  }
)

export const kickParticipant = spacetimedb.reducer(
  { ...roomParticipantArgs, ban: t.bool() },
  (ctx, { roomId, participantId, ban }) => {
    const room = owner(ctx, roomId)
    const target = participantInRoom(ctx, roomId, participantId)

    if (target.identityKey === `clerk:${room.ownerAuthId}`)
      fail("Cannot remove the room owner")

    const assignment = ctx.db.assignments.participantId.find(participantId)

    if (
      assignment &&
      ctx.db.lobbies.id.find(assignment.lobbyId)?.phase !== "OPEN"
    )
      fail("Players cannot be removed after their draft has started")

    if (ban) {
      if (!room.forceSignIn) fail("Bans require a room with forced sign-in")

      if (!target.identityKey.startsWith("clerk:"))
        fail("Only signed-in players can be banned")

      ctx.db.roomBans.insert({
        roomIdentity: target.roomIdentity,
      })
    }

    if (assignment) ctx.db.assignments.participantId.delete(participantId)

    for (const grant of ctx.db.sessions.participantId.filter(participantId))
      ctx.db.sessions.id.delete(grant.id)

    for (const ticket of ctx.db.tickets.roomId.filter(roomId)) {
      if (ticket.identityKey === target.identityKey)
        ctx.db.tickets.id.delete(ticket.id)
    }

    ctx.db.participants.id.delete(participantId)

    if (target.identityKey.startsWith("dummy:"))
      ctx.db.accounts.identityKey.delete(target.identityKey)
  }
)

export const moveParticipantToTeam = spacetimedb.reducer(
  { ...lobbyParticipantArgs, teamId: t.u8() },
  (ctx, { lobbyId, participantId, teamId }) => {
    const lobby = ownedLobby(ctx, lobbyId)

    participantInRoom(ctx, lobby.roomId, participantId)

    const previous = ctx.db.assignments.participantId.find(participantId)

    if (previous?.lobbyId === lobbyId && previous.teamId === teamId) return

    teamHasSpace(ctx, lobbyId, teamId, participantId)

    const assignment = {
      participantId,
      lobbyId,
      roomId: lobby.roomId,
      teamId,
      isCaptain: false,
    }

    if (previous) ctx.db.assignments.participantId.update(assignment)
    else ctx.db.assignments.insert(assignment)
  }
)

export const makeParticipantCaptain = spacetimedb.reducer(
  lobbyParticipantArgs,
  (ctx, { lobbyId, participantId }) => {
    ownedLobby(ctx, lobbyId)

    const assignment = ctx.db.assignments.participantId.find(participantId)

    if (!assignment || assignment.lobbyId !== lobbyId)
      fail("Player not found on team")

    for (const current of ctx.db.assignments.lobbyId.filter(lobbyId)) {
      if (current.teamId === assignment.teamId && current.isCaptain)
        ctx.db.assignments.participantId.update({
          ...current,
          isCaptain: false,
        })
    }

    ctx.db.assignments.participantId.update({ ...assignment, isCaptain: true })
  }
)

export const demoteParticipantCaptain = spacetimedb.reducer(
  lobbyParticipantArgs,
  (ctx, { lobbyId, participantId }) => {
    ownedLobby(ctx, lobbyId)

    const assignment = ctx.db.assignments.participantId.find(participantId)

    if (assignment?.lobbyId === lobbyId)
      ctx.db.assignments.participantId.update({
        ...assignment,
        isCaptain: false,
      })
  }
)

export const returnParticipantToPool = spacetimedb.reducer(
  lobbyParticipantArgs,
  (ctx, { lobbyId, participantId }) => {
    ownedLobby(ctx, lobbyId)

    const assignment = ctx.db.assignments.participantId.find(participantId)

    if (assignment?.lobbyId === lobbyId)
      ctx.db.assignments.participantId.delete(participantId)
  }
)

export const startDraft = spacetimedb.reducer(
  { lobbyId: t.string() },
  (ctx, { lobbyId }) => {
    const lobby = ownedLobby(ctx, lobbyId)

    if (lobby.phase !== "OPEN") fail("Draft has already started")

    const team = [...ctx.db.assignments.lobbyId.filter(lobbyId)]

    if (
      team.length !== 2 ||
      !team.some((row) => row.teamId === 0 && row.isCaptain) ||
      !team.some((row) => row.teamId === 1 && row.isCaptain)
    )
      fail("Draft must start with exactly two captains")

    ctx.db.lobbies.id.update({ ...lobby, phase: "DRAFTING", draftPickIndex: 0 })
  }
)

export const draftParticipant = spacetimedb.reducer(
  lobbyParticipantArgs,
  (ctx, { lobbyId, participantId }) => {
    const grant = session(ctx)
    const lobby = ctx.db.lobbies.id.find(lobbyId)

    if (!lobby || lobby.roomId !== grant.roomId || lobby.phase !== "DRAFTING")
      fail("Lobby is not drafting")

    // Which team is supposed to be picking right now?
    const teamId = DRAFT_PICK_ORDER[lobby.draftPickIndex]

    if (teamId === undefined) fail("Draft is already complete")

    // Lookup the player from their connection --> session --> participant mapping
    const captain = ctx.db.assignments.participantId.find(grant.participantId)

    if (
      !captain?.isCaptain ||
      captain.lobbyId !== lobbyId ||
      captain.teamId !== teamId
    )
      fail("It is not your turn to pick")

    // Check that the targe participant is in the same room as the captain
    const target = participantInRoom(ctx, lobby.roomId, participantId)

    if (ctx.db.assignments.participantId.find(participantId))
      fail("Player is not available")

    const room = ctx.db.rooms.id.find(lobby.roomId)
    const account = ctx.db.accounts.identityKey.find(target.identityKey)

    if (!room) fail("Room not found")
    if (!account) fail("Player not found")

    if (room.forceRankRoles && (!account.rank || account.roles.length === 0))
      fail("Selected player needs to set their rank/roles first")

    // Check that the captain has space on their team
    // Admins can move people onto teams so it's worth checking this as well as pick order
    teamHasSpace(ctx, lobbyId, teamId, participantId)

    ctx.db.assignments.insert({
      participantId,
      lobbyId,
      roomId: lobby.roomId,
      teamId,
      isCaptain: false,
    })

    // Move the draft forward an index
    const draftPickIndex = lobby.draftPickIndex + 1
    ctx.db.lobbies.id.update({
      ...lobby,
      draftPickIndex,
      phase: draftPickIndex === DRAFT_PICK_ORDER.length ? "READY" : "DRAFTING",
    })
  }
)

export const adjustDraftPickIndex = spacetimedb.reducer(
  { lobbyId: t.string(), direction: t.i8() },
  (ctx, { lobbyId, direction }) => {
    const lobby = ownedLobby(ctx, lobbyId)

    if (lobby.phase !== "DRAFTING") fail("Lobby is not drafting")

    if (direction !== -1 && direction !== 1) fail("Invalid draft adjustment")

    const draftPickIndex = Math.max(
      0,
      Math.min(DRAFT_PICK_ORDER.length - 1, lobby.draftPickIndex + direction)
    )

    ctx.db.lobbies.id.update({ ...lobby, draftPickIndex })
  }
)

export const createLobby = spacetimedb.reducer(
  { roomId: t.string(), lobbyId: t.string() },
  (ctx, { roomId, lobbyId }) => {
    owner(ctx, roomId)

    parse(uuid, lobbyId)

    const ordinal =
      Math.max(
        0,
        ...[...ctx.db.lobbies.roomId.filter(roomId)].map((row) => row.ordinal)
      ) + 1

    ctx.db.lobbies.insert({
      id: lobbyId,
      roomId,
      ordinal,
      phase: "OPEN",
      draftPickIndex: 0,
    })
  }
)

export const resetLobby = spacetimedb.reducer(
  { lobbyId: t.string() },
  (ctx, { lobbyId }) => {
    const lobby = ownedLobby(ctx, lobbyId)

    for (const assignment of ctx.db.assignments.lobbyId.filter(lobbyId))
      ctx.db.assignments.participantId.delete(assignment.participantId)

    ctx.db.lobbies.id.update({ ...lobby, phase: "OPEN", draftPickIndex: 0 })
  }
)
