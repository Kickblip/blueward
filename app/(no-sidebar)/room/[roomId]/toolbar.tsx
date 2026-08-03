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
import { Spinner } from "@/components/ui/spinner"
import { FaPlay } from "react-icons/fa"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { FaGear } from "react-icons/fa6"
import {
  BottomRoleIcon,
  JungleRoleIcon,
  MiddleRoleIcon,
  TopRoleIcon,
  UtilityRoleIcon,
} from "@/lib/icons"

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-lg">
              <FaGear className="text-chart-3 dark:text-chart-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Roles</DropdownMenuLabel>
              <div className="flex items-center gap-1">
                <Button size="icon-lg" variant="secondary">
                  <TopRoleIcon />
                </Button>
                <Button size="icon-lg" variant="secondary">
                  <JungleRoleIcon />
                </Button>
                <Button size="icon-lg" variant="secondary">
                  <MiddleRoleIcon />
                </Button>
                <Button size="icon-lg" variant="secondary">
                  <BottomRoleIcon />
                </Button>
                <Button size="icon-lg" variant="secondary">
                  <UtilityRoleIcon />
                </Button>
              </div>

              <DropdownMenuLabel>Rank</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Select</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Iron</DropdownMenuItem>
                    <DropdownMenuItem>Bronze</DropdownMenuItem>
                    <DropdownMenuItem>Silver</DropdownMenuItem>
                    <DropdownMenuItem>Gold</DropdownMenuItem>
                    <DropdownMenuItem>Platinum</DropdownMenuItem>
                    <DropdownMenuItem>Emerald</DropdownMenuItem>
                    <DropdownMenuItem>Diamond</DropdownMenuItem>
                    <DropdownMenuItem>Master</DropdownMenuItem>
                    <DropdownMenuItem>Grandmaster</DropdownMenuItem>
                    <DropdownMenuItem>Challenger</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {showStartDraft && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex"
                tabIndex={isStartDraftDisabled ? 0 : undefined}
              >
                <Button
                  variant="destructive"
                  size="icon-lg"
                  disabled={isStartDraftDisabled}
                  onClick={handleStartDraft}
                >
                  <span className="font-oswald text-lg font-semibold uppercase">
                    {isStartingDraft ? <Spinner /> : <FaPlay />}
                  </span>
                </Button>
              </span>
            </TooltipTrigger>

            <TooltipContent>
              {isStartDraftDisabled
                ? "Two captains are required for the draft to begin"
                : "Start draft for this lobby"}
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
