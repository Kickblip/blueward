"use client"

import { cn, safeSubstring } from "@/lib/utils"
import type { RoomParticipant, RoomSnapshot } from "@/lib/room-state"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { useEffect, useState, useMemo } from "react"
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
  moveParticipantToTeam,
  returnParticipantToPool,
  demoteParticipantCaptain,
} from "./actions"
import { useSession } from "@clerk/nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client"

export function RoomClient({
  initialSnapshot,
  viewerAuthId,
  participant,
}: {
  initialSnapshot: RoomSnapshot
  viewerAuthId: string | null
  participant: RoomParticipant
}) {
  const { session } = useSession()

  const supabase = useMemo(() => {
    // Guests use their Supabase anonymous-auth cookie session.
    if (viewerAuthId === null) {
      return createSupabaseBrowserClient()
    }

    // Clerk may still be loading its browser session.
    if (!session) return null

    // Signed-in users send their native Clerk token to Supabase.
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        accessToken: () => session.getToken(),
      }
    )
  }, [session, viewerAuthId])

  if (!supabase) {
    return <aside>Connecting…</aside>
  }

  return (
    <RoomProvider
      supabase={supabase}
      initialSnapshot={initialSnapshot}
      currentParticipant={participant}
      viewerAuthId={viewerAuthId}
    >
      <RoomContents />
    </RoomProvider>
  )
}

function RoomContents() {
  const { activeLobby, participantPool, isOwner } = useRoom()

  return (
    <main className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <Toolbar />

      <section className="min-h-0 overflow-y-auto">
        <div className="max-w-9xl mx-auto grid h-full min-h-0 w-full grid-cols-[7fr_7fr_6fr] grid-rows-[minmax(0,1fr)_90px] gap-4 p-4">
          <div className="row-span-2 min-h-0 overflow-y-auto bg-secondary p-2">
            {([0, 1] as const).map((team) => {
              const players =
                activeLobby?.players.filter(({ teamId }) => teamId === team) ??
                []

              return (
                <div key={team} className="flex min-h-0 flex-col">
                  <div className="flex items-center gap-2 p-2">
                    <div
                      className={cn(
                        "size-4 rounded-xs",
                        team === 0 ? "bg-blue-500" : "bg-rose-500"
                      )}
                    />

                    <h2 className="font-oswald text-lg font-semibold uppercase">
                      Team {team + 1}
                    </h2>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-4 p-2">
                    {Array.from({ length: 5 }, (_, index) => {
                      const assignment = players[index]

                      return (
                        <PlayerCard
                          key={
                            assignment?.player.id ??
                            `team-${team + 1}-slot-${index}`
                          }
                          participant={assignment?.player ?? null}
                          team={team}
                          isCaptain={assignment?.isCaptain ?? false}
                          useOwnerView={isOwner}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

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

export function PoolCard({
  participant,
  useOwnerView,
}: {
  participant: RoomParticipant
  useOwnerView: boolean
}) {
  const content = (
    <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-secondary">
      <div className="flex h-full flex-col justify-between gap-2 p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {participant.player && (
              <LevelBadge experience={participant.player.experience} />
            )}
          </div>

          <PlayerDropdownMenu
            useOwnerView={useOwnerView}
            participant={participant}
          />
        </div>

        <h2
          className={cn(
            "font-oswald text-4xl font-semibold uppercase",
            participant.player && "text-white"
          )}
        >
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
          "h-32 border border-l-4 bg-secondary",
          team === 0 ? "border-l-blue-500" : "border-l-rose-500"
        )}
      />
    )
  }

  const content = (
    <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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
        </div>

        <PlayerDropdownMenu
          useOwnerView={useOwnerView}
          participant={participant}
        />
      </div>

      <h2
        className={cn(
          "font-oswald text-4xl font-semibold uppercase",
          participant.player && "text-white"
        )}
      >
        {participant.displayName}
      </h2>
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
  const { activeLobby } = useRoom()

  const assignment = activeLobby?.players.find(
    ({ player: assignedParticipant }) =>
      assignedParticipant.id === participant.id
  )

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
          <DropdownMenuItem>
            <FaCheckCircle className="text-chart-3 dark:text-chart-1" />
            Draft Player
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {useOwnerView && activeLobby && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() =>
                  void moveParticipantToTeam(activeLobby.id, participant.id, 0)
                }
              >
                <FaArrowCircleLeft className="text-chart-3 dark:text-chart-1" />
                Move to Team 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  void moveParticipantToTeam(activeLobby.id, participant.id, 1)
                }
              >
                <FaArrowCircleRight className="text-chart-3 dark:text-chart-1" />
                Move to Team 2
              </DropdownMenuItem>

              {assignment && (
                <DropdownMenuItem
                  onSelect={() =>
                    void (assignment.isCaptain
                      ? demoteParticipantCaptain(activeLobby.id, participant.id)
                      : makeParticipantCaptain(activeLobby.id, participant.id))
                  }
                >
                  {assignment.isCaptain ? (
                    <FaX className="text-chart-3 dark:text-chart-1" />
                  ) : (
                    <PiCrownSimpleFill className="text-chart-3 dark:text-chart-1" />
                  )}
                  {assignment.isCaptain ? "Demote Captain" : "Make Captain"}
                </DropdownMenuItem>
              )}

              {assignment && (
                <DropdownMenuItem
                  onSelect={() =>
                    void returnParticipantToPool(activeLobby.id, participant.id)
                  }
                >
                  <FaTrash className="text-chart-3 dark:text-chart-1" />
                  Return to Pool
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Danger</DropdownMenuLabel>
              <DropdownMenuItem variant="destructive">
                <PiCrownSimpleFill />
                Make Owner
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
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
