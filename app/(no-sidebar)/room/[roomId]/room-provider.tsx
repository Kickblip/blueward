"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  SpacetimeDBProvider,
  useSpacetimeDB,
  useTable,
} from "spacetimedb/react"
import { DbConnection, tables } from "@/lib/spacetime/module_bindings"
import { startSessionRenewal } from "@/lib/spacetime/session-renewal"
import type { RoomParticipant, RoomSnapshot } from "@/lib/room-types"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RoomContext } from "./room-context"
import { issueRoomTicket } from "./actions"

type Props = {
  roomId: string
  viewerAuthId: string | null
  children: ReactNode
}

function RoomStatus({
  message,
  retry = false,
}: {
  message: string
  retry?: boolean
}) {
  return (
    <div
      className="grid min-h-screen place-content-center gap-4 text-center"
      role="status"
    >
      <p className="flex items-center justify-center gap-2 font-oswald font-semibold uppercase">
        <Spinner aria-hidden="true" />
        {message}
      </p>
      {retry && (
        <Button onClick={() => window.location.reload()}>Reload room</Button>
      )}
    </div>
  )
}

export default function RoomProvider(props: Props) {
  const { isLoaded, userId } = useAuth()
  const [ready, setReady] = useState(false)
  const [builder] = useState(() =>
    DbConnection.builder()
      .withUri(process.env.NEXT_PUBLIC_SPACETIMEDB_URI!)
      .withDatabaseName(process.env.NEXT_PUBLIC_SPACETIMEDB_DATABASE!)
  )

  useEffect(() => {
    // Let the SDK release the previous room's pooled connection before mounting.
    const timer = window.setTimeout(() => setReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  // The transport identity stays in this tab's memory. Clerk/the guest cookie
  // establishes the stable participant identity through the entry ticket.
  if (!isLoaded || !ready) return <RoomStatus message="Connecting..." />
  if ((userId ?? null) !== props.viewerAuthId)
    return (
      <RoomStatus message="Your sign-in changed. Reload to continue." retry />
    )
  return (
    <SpacetimeDBProvider connectionBuilder={builder}>
      <ConnectedRoom {...props} />
    </SpacetimeDBProvider>
  )
}

function ConnectedRoom({ roomId, viewerAuthId, children }: Props) {
  const { isActive, getConnection, connectionError } = useSpacetimeDB()
  const connection = getConnection() as DbConnection | null
  const [sessions, sessionReady] = useTable(tables.mySession)
  const [rooms, roomReady] = useTable(tables.roomInfo)
  const [rows, participantsReady] = useTable(tables.roomParticipants)
  const [lobbyRows, lobbiesReady] = useTable(tables.roomLobbies)
  const [assignments, assignmentsReady] = useTable(tables.roomAssignments)
  const [selectedLobbyId, selectLobby] = useState<string | null>(null)
  const [joinedConnection, setJoinedConnection] = useState<DbConnection | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const hasJoined = useRef(false)
  const session = sessions.find((row) => row.roomId === roomId)

  useEffect(() => {
    if (!connection?.isActive || !connection.identity) return
    let cancelled = false
    const identity = connection.identity.toHexString()
    const renewal = startSessionRenewal(
      async () => {
        if (!connection.isActive) return

        const result = await issueRoomTicket(
          roomId,
          identity,
          hasJoined.current,
          viewerAuthId
        )

        if (cancelled || !connection.isActive) return

        if ("error" in result) {
          setError(result.error)
          return
        }

        await connection.reducers.joinRoom({ ticket: result.ticket })

        if (cancelled) return

        hasJoined.current = true
        setJoinedConnection(connection)
        setError(null)
      },
      () => setError("Could not authorize your room session. Reload to rejoin.")
    )
    const resume = () => {
      if (document.visibilityState === "visible") void renewal.renew()
    }
    document.addEventListener("visibilitychange", resume)
    return () => {
      cancelled = true
      renewal.stop()
      document.removeEventListener("visibilitychange", resume)
    }
  }, [connection, isActive, roomId, viewerAuthId])

  // The server removes expired or revoked sessions from this view.
  if (error && (!session || joinedConnection !== connection))
    return <RoomStatus message={error} retry />
  if (!isActive || !connection || joinedConnection !== connection) {
    return (
      <RoomStatus
        message={
          connectionError ? "Connection lost. Reconnecting..." : "Connecting..."
        }
        retry={Boolean(connectionError)}
      />
    )
  }
  if (
    !sessionReady ||
    !roomReady ||
    !participantsReady ||
    !lobbiesReady ||
    !assignmentsReady
  ) {
    return <RoomStatus message="Loading room..." />
  }
  const room = rooms.find((row) => row.id === roomId)
  if (!session || !room)
    return (
      <RoomStatus message="Your room session ended. Reload to rejoin." retry />
    )

  const participants = new Map(
    rows
      .filter((row) => row.roomId === roomId)
      .map((row) => [
        row.id,
        {
          id: row.id,
          displayName: row.displayName,
          player: row.profileJson
            ? (JSON.parse(row.profileJson) as RoomParticipant["player"])
            : null,
          roles: row.roles as RoomParticipant["roles"],
          rank: (row.rank ?? null) as RoomParticipant["rank"],
        },
      ])
  )
  const currentParticipant = participants.get(session.participantId)
  if (!currentParticipant)
    return <RoomStatus message="Loading participant..." />
  const lobbies: RoomSnapshot["lobbies"] = lobbyRows
    .filter((row) => row.roomId === roomId)
    .toSorted((a, b) => a.ordinal - b.ordinal)
    .map((lobby) => ({
      ...lobby,
      phase: lobby.phase as RoomSnapshot["lobbies"][number]["phase"],
      players: assignments
        .filter((row) => row.lobbyId === lobby.id)
        .toSorted(
          (a, b) =>
            Number(b.isCaptain) - Number(a.isCaptain) ||
            a.participantId.localeCompare(b.participantId)
        )
        .flatMap((assignment) => {
          const player = participants.get(assignment.participantId)
          return player
            ? [
                {
                  player,
                  teamId: assignment.teamId as 0 | 1,
                  isCaptain: assignment.isCaptain,
                },
              ]
            : []
        }),
    }))
  const presentParticipants = rows
    .filter((row) => row.isOnline)
    .flatMap((row) => participants.get(row.id) ?? [])
  const dummies = rows
    .filter((row) => row.isDummy)
    .flatMap((row) => participants.get(row.id) ?? [])
  const assigned = new Set(assignments.map((row) => row.participantId))
  return (
    <RoomContext.Provider
      value={{
        roomId,
        ownerAuthId: room.ownerAuthId,
        forceSignIn: room.forceSignIn,
        forceRankRoles: room.forceRankRoles,
        dummies,
        lobbies,
        isOwner: session.identityKey === `clerk:${room.ownerAuthId}`,
        currentParticipant,
        activeLobby:
          lobbies.find((lobby) => lobby.id === selectedLobbyId) ??
          lobbies[0] ??
          null,
        presentParticipants,
        participantPool: [...presentParticipants, ...dummies].filter(
          (participant) => !assigned.has(participant.id)
        ),
        selectLobby,
        actions: connection.reducers,
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}
