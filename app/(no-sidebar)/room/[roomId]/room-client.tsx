"use client"

import { cn, safeSubstring } from "@/lib/utils"
import type { RoomParticipant, RoomSnapshot } from "@/lib/room-state"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { Realtime } from "ably"
import { AblyProvider, ChannelProvider } from "ably/react"
import { useEffect, useState, useTransition } from "react"
import { RoomProvider, useRoom } from "./room-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BannerBackground } from "@/components/banner-background"
import { LevelBadge } from "@/components/level-badge"
import { EllipsisIcon } from "lucide-react"
import { FaTrash, FaX } from "react-icons/fa6"
import { PiCrownSimpleFill } from "react-icons/pi"
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaUser,
  FaCheckCircle,
} from "react-icons/fa"
import Link from "next/link"
import {
  makeParticipantCaptain,
  makeParticipantOwner,
  moveParticipantToTeam,
  returnParticipantToPool,
  demoteParticipantCaptain,
  draftParticipant,
  kickParticipant,
} from "./actions"
import {
  BottomRoleIcon,
  JungleRoleIcon,
  MiddleRoleIcon,
  TopRoleIcon,
  UtilityRoleIcon,
} from "@/lib/icons"
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DRAFT_PICK_ORDER } from "@/lib/draft"
import { toast } from "sonner"

export function RoomClient({
  initialSnapshot,
  viewerAuthId,
  participant,
}: {
  initialSnapshot: RoomSnapshot
  viewerAuthId: string | null
  participant: RoomParticipant
}) {
  const roomId = initialSnapshot.roomId
  const channel = `room:${roomId}`
  const [client, setClient] = useState<Realtime | null>(null)

  useEffect(() => {
    const realtime = new Realtime({
      authUrl: `/api/ably/token?roomId=${encodeURIComponent(roomId)}`,
    })

    setClient(realtime)
    return () => realtime.close()
  }, [roomId])

  if (!client) return <aside>Connecting…</aside>

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={channel}>
        <RoomProvider
          initialSnapshot={initialSnapshot}
          currentParticipant={participant}
          viewerAuthId={viewerAuthId}
        >
          <RoomContents />
        </RoomProvider>
      </ChannelProvider>
    </AblyProvider>
  )
}

function RoomContents() {
  const { activeLobby, participantPool, isOwner } = useRoom()

  const team1Players =
    activeLobby?.players.filter(({ teamId }) => teamId === 0) ?? []

  const team2Players =
    activeLobby?.players.filter(({ teamId }) => teamId === 1) ?? []

  return (
    <main className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <Toolbar />

      <section className="min-h-0 overflow-y-auto">
        <div className="max-w-9xl mx-auto grid h-full min-h-0 w-full grid-cols-[7fr_7fr_6fr] grid-rows-[minmax(0,1fr)] gap-4 p-4">
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 p-2">
              <div className="size-4 rounded-xs bg-blue-500" />
              <h2 className="font-oswald text-lg font-semibold uppercase">
                Team 1
              </h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
              {Array.from({ length: 5 }, (_, index) => {
                const assignment = team1Players[index]

                return (
                  <PlayerCard
                    key={assignment?.player.id ?? `team-1-slot-${index}`}
                    participant={assignment?.player ?? null}
                    team={0}
                    isCaptain={assignment?.isCaptain ?? false}
                    useOwnerView={isOwner}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 p-2">
              <div className="size-4 rounded-xs bg-rose-500" />
              <h2 className="font-oswald text-lg font-semibold uppercase">
                Team 2
              </h2>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
              {Array.from({ length: 5 }, (_, index) => {
                const assignment = team2Players[index]

                return (
                  <PlayerCard
                    key={assignment?.player.id ?? `team-2-slot-${index}`}
                    participant={assignment?.player ?? null}
                    team={1}
                    isCaptain={assignment?.isCaptain ?? false}
                    useOwnerView={isOwner}
                  />
                )
              })}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto bg-secondary p-2">
            <p className="-mt-0.5 mb-1.5 text-xs font-medium text-muted-foreground">
              {participantPool.length}/
              {participantPool.length + (activeLobby?.players.length ?? 0)}{" "}
              Players
            </p>
            {participantPool.map((participant) => (
              <PoolCard
                key={participant.id}
                participant={participant}
                useOwnerView={isOwner}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

const ROLE_ICONS: Partial<
  Record<RoomParticipant["roles"][number], typeof TopRoleIcon>
> = {
  TOP: TopRoleIcon,
  JUNGLE: JungleRoleIcon,
  MIDDLE: MiddleRoleIcon,
  BOTTOM: BottomRoleIcon,
  UTILITY: UtilityRoleIcon,
}

function PlayerPreferenceBadges({
  roles,
  rank,
}: Pick<RoomParticipant, "roles" | "rank">) {
  if (roles.length === 0 && !rank) return null

  return (
    <div className="flex flex-wrap items-center gap-1">
      {roles.map((role) => {
        const Icon = ROLE_ICONS[role]

        if (!Icon) return null

        const label =
          role === "UTILITY"
            ? "Support"
            : `${role[0]}${role.slice(1).toLowerCase()}`

        return (
          <Tooltip key={role}>
            <TooltipTrigger asChild>
              <span
                title={label}
                aria-label={`Preferred role: ${label}`}
                className="flex size-6 items-center justify-center rounded-full border bg-secondary/90 text-secondary-foreground shadow-sm"
              >
                <Icon className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      })}

      {rank && (
        <span className="inline-flex h-6 items-center rounded-full border bg-secondary/90 px-2 font-oswald text-[10px] font-semibold text-secondary-foreground uppercase shadow-sm">
          {rank}
        </span>
      )}
    </div>
  )
}

export function PoolCard({
  participant,
  useOwnerView,
}: {
  participant: RoomParticipant
  useOwnerView: boolean
}) {
  const content = (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border bg-secondary">
      {participant.player && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent"
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {participant.player && (
              <LevelBadge experience={participant.player.experience} />
            )}

            <PlayerPreferenceBadges
              roles={participant.roles}
              rank={participant.rank}
            />
          </div>

          <PlayerDropdownMenu
            useOwnerView={useOwnerView}
            participant={participant}
          />
        </div>

        <h2 className="font-oswald text-4xl font-semibold uppercase">
          {participant.displayName}
        </h2>
      </div>
    </div>
  )

  if (!participant.player) {
    return content
  }

  return (
    <BannerBackground bannerId={participant.player.bannerId}>
      {content}
    </BannerBackground>
  )
}

export function PlayerCard({
  participant,
  team,
  isCaptain,
  useOwnerView,
}: {
  participant: RoomParticipant | null
  team: 0 | 1
  isCaptain: boolean
  useOwnerView: boolean
}) {
  if (!participant) {
    return (
      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden border border-l-4 bg-secondary",
          team === 0 ? "border-l-blue-500" : "border-l-rose-500"
        )}
      />
    )
  }

  const content = (
    <div className="relative h-full">
      {participant.player && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent"
        />
      )}

      <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {isCaptain && (
              <div className="flex items-center gap-1 rounded-full border bg-secondary px-2 py-0.5">
                <PiCrownSimpleFill className="text-yellow-400" />

                <span className="font-oswald text-xs font-semibold uppercase">
                  Captain
                </span>
              </div>
            )}

            {participant.player && (
              <LevelBadge experience={participant.player.experience} />
            )}

            <PlayerPreferenceBadges
              roles={participant.roles}
              rank={participant.rank}
            />
          </div>

          <PlayerDropdownMenu
            useOwnerView={useOwnerView}
            participant={participant}
          />
        </div>

        <h2 className="font-oswald text-4xl font-semibold uppercase">
          {participant.displayName}
        </h2>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden border border-l-4 bg-secondary",
        team === 0 ? "border-l-blue-500" : "border-l-rose-500"
      )}
    >
      {participant.player ? (
        <BannerBackground bannerId={participant.player.bannerId}>
          {content}
        </BannerBackground>
      ) : (
        content
      )}
    </div>
  )
}

export function PlayerDropdownMenu({
  useOwnerView,
  participant,
}: {
  useOwnerView: boolean
  participant: RoomParticipant
}) {
  const { activeLobby, currentParticipant, roomId } = useRoom()
  const [isDrafting, startDraftTransition] = useTransition()

  const assignment = activeLobby?.players.find(
    ({ player: assignedParticipant }) =>
      assignedParticipant.id === participant.id
  )

  const currentAssignment = activeLobby?.players.find(
    ({ player }) => player.id === currentParticipant.id
  )

  const pickingTeam =
    activeLobby?.phase === "DRAFTING"
      ? DRAFT_PICK_ORDER[activeLobby.draftPickIndex]
      : undefined

  const canDraft =
    !assignment &&
    currentAssignment?.isCaptain === true &&
    currentAssignment.teamId === pickingTeam

  function draft() {
    if (!activeLobby || !canDraft) return

    startDraftTransition(async () => {
      try {
        await draftParticipant(activeLobby.id, participant.id)
      } catch {
        toast.error("Could not draft this player")
      }
    })
  }

  function move(teamId: 0 | 1) {
    if (!activeLobby) return

    void moveParticipantToTeam(activeLobby.id, participant.id, teamId)
  }

  function makeCaptain() {
    if (!activeLobby || !assignment) return

    void makeParticipantCaptain(activeLobby.id, participant.id)
  }

  function demoteCaptain() {
    if (!activeLobby || !assignment) return

    void demoteParticipantCaptain(activeLobby.id, participant.id)
  }

  function returnToPool() {
    if (!activeLobby || !assignment) return

    void returnParticipantToPool(activeLobby.id, participant.id)
  }

  function makeOwner() {
    if (!participant.player || participant.id === currentParticipant.id) return

    void makeParticipantOwner(roomId, participant.id).catch(() => {
      toast.error("Could not transfer room ownership")
    })
  }

  function kick() {
    if (participant.id === currentParticipant.id) return

    if (!window.confirm(`Kick ${participant.displayName} from this room?`)) {
      return
    }

    void kickParticipant(roomId, participant.id).catch(() => {
      toast.error("Could not kick this player")
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon-sm">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Player</DropdownMenuLabel>

          {participant.player && (
            <DropdownMenuItem asChild>
              <Link
                href={`/player/${safeSubstring(
                  participant.player.puuid,
                  0,
                  20
                )}`}
                target="_blank"
              >
                <FaUser className="text-chart-3 dark:text-chart-1" />
                View Profile
              </Link>
            </DropdownMenuItem>
          )}
          {canDraft && (
            <DropdownMenuItem disabled={isDrafting} onSelect={draft}>
              <FaCheckCircle className="text-chart-3 dark:text-chart-1" />
              {isDrafting ? "Drafting…" : "Draft Player"}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {useOwnerView && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!activeLobby || assignment?.teamId === 0}
                onSelect={() => move(0)}
              >
                <FaArrowCircleLeft className="text-chart-3 dark:text-chart-1" />
                Move to Team 1
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!activeLobby || assignment?.teamId === 1}
                onSelect={() => move(1)}
              >
                <FaArrowCircleRight className="text-chart-3 dark:text-chart-1" />
                Move to Team 2
              </DropdownMenuItem>

              {assignment ? (
                assignment.isCaptain ? (
                  <DropdownMenuItem onSelect={() => demoteCaptain()}>
                    <FaX className="text-chart-3 dark:text-chart-1" />
                    Demote Captain
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => makeCaptain()}>
                    <PiCrownSimpleFill className="text-chart-3 dark:text-chart-1" />
                    Make Captain
                  </DropdownMenuItem>
                )
              ) : null}

              {assignment && (
                <DropdownMenuItem onSelect={returnToPool}>
                  <FaTrash className="text-chart-3 dark:text-chart-1" />
                  Return to Pool
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Danger</DropdownMenuLabel>
              <DropdownMenuItem
                variant="destructive"
                disabled={
                  !participant.player ||
                  participant.id === currentParticipant.id
                }
                onSelect={makeOwner}
              >
                <PiCrownSimpleFill />
                Make Owner
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={
                  participant.id === currentParticipant.id ||
                  (Boolean(assignment) && activeLobby?.phase !== "OPEN")
                }
                onSelect={kick}
              >
                <FaTrash />
                Kick Player
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
