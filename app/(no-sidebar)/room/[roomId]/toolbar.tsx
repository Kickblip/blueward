"use client"

import { Logo } from "@/components/logo"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { RiRobot3Fill } from "react-icons/ri"
import { MdOutlineShuffleOn } from "react-icons/md"
import { IoSparkles } from "react-icons/io5"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { useRoom } from "./room-context"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useState, useTransition } from "react"
import { startDraft } from "./actions"

export function Toolbar() {
  const { presentParticipants, participantPool, activeLobby, isOwner } =
    useRoom()
  const [randomPlayer, setRandomPlayer] = useState<string | null>(null)
  const [isStartingDraft, startTransition] = useTransition()

  const showStartDraft = isOwner && activeLobby?.phase === "OPEN"

  const hasBothCaptains =
    activeLobby?.players.some(
      ({ teamId, isCaptain }) => teamId === 0 && isCaptain
    ) &&
    activeLobby.players.some(
      ({ teamId, isCaptain }) => teamId === 1 && isCaptain
    )

  const isStartDraftDisabled = !hasBothCaptains || isStartingDraft

  function handleStartDraft() {
    if (!activeLobby || activeLobby.phase !== "OPEN") return

    const lobbyId = activeLobby.id

    startTransition(async () => {
      await startDraft(lobbyId)
    })
  }

  return (
    <header className="flex items-center justify-between gap-4 p-2">
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" size="icon-lg" asChild>
              <Link href="/">
                <Logo className="size-8 text-primary [--logo-end:#ffffff] [--logo-start:#ffffff]" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exit room</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="lg">
              <RiRobot3Fill className="size-6 text-chart-3 dark:text-chart-1" />
              <span className="font-oswald text-lg font-semibold uppercase">
                Autobalance
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate teams automatically</TooltipContent>
        </Tooltip>

        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="lg">
                  <MdOutlineShuffleOn className="size-6 text-chart-3 dark:text-chart-1" />
                  <span className="font-oswald text-lg font-semibold uppercase">
                    Random pick
                  </span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              Select a random player from the pool
            </TooltipContent>
          </Tooltip>

          <DialogContent>
            <p className="font-oswald text-lg font-semibold uppercase">
              {randomPlayer || "No player yet"}
            </p>

            <Button
              size="lg"
              className="font-oswald font-semibold uppercase"
              onClick={() => {
                if (participantPool.length === 0) return

                const randomIndex = Math.floor(
                  Math.random() * participantPool.length
                )

                const randomParticipant = participantPool[randomIndex]

                setRandomPlayer(randomParticipant.displayName)
              }}
            >
              Randomize
            </Button>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="lg">
              <IoSparkles className="size-6 text-chart-3 dark:text-chart-1" />
              <span className="font-oswald text-lg font-semibold uppercase">
                Predictions
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Create and edit available prediction markets
          </TooltipContent>
        </Tooltip>

        {showStartDraft && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex"
                tabIndex={isStartDraftDisabled ? 0 : undefined}
              >
                <Button
                  variant="destructive"
                  size="lg"
                  disabled={isStartDraftDisabled}
                  onClick={handleStartDraft}
                >
                  <span className="font-oswald text-lg font-semibold uppercase">
                    {isStartingDraft
                      ? "Starting Draft…"
                      : "Start Draft for this lobby"}
                  </span>
                </Button>
              </span>
            </TooltipTrigger>

            <TooltipContent>
              Two captains are required for the draft to begin
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-4">
        <AvatarGroup>
          {presentParticipants.slice(0, 3).map((participant) => (
            <Tooltip key={participant.id}>
              <TooltipTrigger asChild>
                <Avatar tabIndex={0}>
                  <AvatarImage
                    src={participant.player?.avatarUrl ?? undefined}
                    alt={participant.displayName}
                  />

                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </TooltipTrigger>

              <TooltipContent>
                <p>{participant.displayName}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {presentParticipants.length > 3 && (
            <AvatarGroupCount>
              +{presentParticipants.length - 3}
            </AvatarGroupCount>
          )}
        </AvatarGroup>
        <div
          className={cn(
            "px-6! font-oswald text-lg! font-semibold uppercase",
            buttonVariants({ size: "lg" })
          )}
        >
          Team 1 picking
        </div>
      </div>
    </header>
  )
}
