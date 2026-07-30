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
import { useState } from "react"

export function Toolbar() {
  const { presentPlayers, playerPool } = useRoom()
  const [randomPlayer, setRandomPlayer] = useState<string | null>(null)

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
          <TooltipContent>
            <p>Exit room</p>
          </TooltipContent>
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
          <TooltipContent>
            <p>Generate teams automatically</p>
          </TooltipContent>
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
              <p>Select a random player from the pool</p>
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
                if (playerPool.length <= 0) return

                const randomIndex = Math.floor(
                  Math.random() * playerPool.length
                )
                const randomPlayer = playerPool[randomIndex]
                setRandomPlayer(randomPlayer.riotIdGameName)
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
            <p>Create and edit available prediction markets</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
        <AvatarGroup>
          {presentPlayers.slice(0, 3).map((player) => (
            <Tooltip key={player.id}>
              <TooltipTrigger asChild>
                <Avatar tabIndex={0}>
                  <AvatarImage
                    src={player.avatarUrl ?? undefined}
                    alt={player.riotIdGameName}
                  />
                  <AvatarFallback>
                    {player.riotIdGameName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>

              <TooltipContent>
                <p>{player.riotIdGameName}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {presentPlayers.length > 3 && (
            <AvatarGroupCount>+{presentPlayers.length - 3}</AvatarGroupCount>
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
