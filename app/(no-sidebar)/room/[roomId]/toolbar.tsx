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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useTransition } from "react"
import {
  adjustDraftPickIndex,
  saveLobbyPreferences,
  startDraft,
} from "./actions"
import { Spinner } from "@/components/ui/spinner"
import { FaPlay } from "react-icons/fa"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { FaGear, FaUser } from "react-icons/fa6"
import {
  BottomRoleIcon,
  JungleRoleIcon,
  MiddleRoleIcon,
  TopRoleIcon,
  UtilityRoleIcon,
} from "@/lib/icons"
import type { RoomParticipant } from "@/lib/room-state"
import { toast } from "sonner"
import { DRAFT_PICK_ORDER } from "@/lib/draft"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { addDummy } from "./actions"
import { Input } from "@/components/ui/input"

const ROLE_OPTIONS = [
  { value: "TOP", label: "Top", Icon: TopRoleIcon },
  { value: "JUNGLE", label: "Jungle", Icon: JungleRoleIcon },
  { value: "MIDDLE", label: "Middle", Icon: MiddleRoleIcon },
  { value: "BOTTOM", label: "Bottom", Icon: BottomRoleIcon },
  { value: "UTILITY", label: "Support", Icon: UtilityRoleIcon },
] as const

const RANK_OPTIONS = [
  { value: "IRON", label: "Iron" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "EMERALD", label: "Emerald" },
  { value: "DIAMOND", label: "Diamond" },
  { value: "MASTER", label: "Master" },
  { value: "GRANDMASTER", label: "Grandmaster" },
  { value: "CHALLENGER", label: "Challenger" },
] as const

export function Toolbar() {
  const {
    roomId,
    presentParticipants,
    participantPool,
    currentParticipant,
    updateCurrentParticipant,
    activeLobby,
    isOwner,
  } = useRoom()

  const [randomPlayer, setRandomPlayer] = useState<string | null>(null)
  const [dummyRoles, setDummyRoles] = useState<RoomParticipant["roles"]>([])
  const [dummyRank, setDummyRank] = useState<RoomParticipant["rank"]>(null)
  const [dummyDialogOpen, setDummyDialogOpen] = useState(false)
  const [isStartingDraft, startTransition] = useTransition()
  const [isSavingPreferences, startSavingPreferences] = useTransition()
  const [isAdjustingPickOrder, startAdjustingPickOrder] = useTransition()
  const [isAddingDummy, startAddingDummy] = useTransition()

  const pickingTeam =
    activeLobby?.phase === "DRAFTING"
      ? (DRAFT_PICK_ORDER[activeLobby.draftPickIndex] ?? null)
      : null

  const phaseLabel =
    activeLobby?.phase === "OPEN"
      ? isStartingDraft
        ? "Starting draft"
        : "Waiting to start"
      : pickingTeam !== null
        ? `Team ${pickingTeam + 1} picking`
        : null

  const selectedRankLabel =
    RANK_OPTIONS.find(({ value }) => value === currentParticipant.rank)
      ?.label ?? "Select"

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

  function handleAdjustPickOrder(direction: -1 | 1) {
    if (!activeLobby || activeLobby.phase !== "DRAFTING") return

    startAdjustingPickOrder(async () => {
      try {
        await adjustDraftPickIndex(activeLobby.id, direction)
      } catch {
        toast.error("Could not adjust the picking order")
      }
    })
  }

  function commitPreferences(
    preferences: Pick<RoomParticipant, "roles" | "rank">
  ) {
    void updateCurrentParticipant(preferences).catch(() => {
      toast.error("Could not update your live lobby preferences")
    })

    if (!currentParticipant.player) return

    startSavingPreferences(async () => {
      try {
        await saveLobbyPreferences(roomId, preferences)
      } catch {
        toast.error("Preferences are live, but could not be saved")
      }
    })
  }

  function handleRoleToggle(
    selectedRole: (typeof ROLE_OPTIONS)[number]["value"]
  ) {
    const roles = currentParticipant.roles.includes(selectedRole)
      ? currentParticipant.roles.filter((role) => role !== selectedRole)
      : [...currentParticipant.roles, selectedRole]

    commitPreferences({
      roles,
      rank: currentParticipant.rank,
    })
  }

  function handleRankChange(value: string) {
    const rank = RANK_OPTIONS.find((option) => option.value === value)?.value

    if (!rank) return

    commitPreferences({
      roles: currentParticipant.roles,
      rank,
    })
  }

  function handleAddDummy(formData: FormData) {
    startAddingDummy(async () => {
      try {
        await addDummy(roomId, formData)
        setDummyDialogOpen(false)
      } catch {
        toast.error("Could not add dummy")
      }
    })
  }

  const dummyRankLabel =
    RANK_OPTIONS.find(({ value }) => value === dummyRank)?.label ??
    "Select rank"

  function handleDummyRoleToggle(
    selectedRole: RoomParticipant["roles"][number]
  ) {
    setDummyRoles((roles) =>
      roles.includes(selectedRole)
        ? roles.filter((role) => role !== selectedRole)
        : [...roles, selectedRole]
    )
  }

  function handleDummyRankChange(value: string) {
    const rank = RANK_OPTIONS.find(({ value: rank }) => rank === value)?.value

    if (rank) setDummyRank(rank)
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

        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="lg" disabled>
                <RiRobot3Fill className="size-6 text-chart-3 dark:text-chart-1" />
                <span className="font-oswald text-lg font-semibold uppercase">
                  Autobalance
                </span>
              </Button>
            </TooltipTrigger>
            {/* <TooltipContent>Generate teams automatically</TooltipContent> */}
            <TooltipContent>Coming Soon</TooltipContent>
          </Tooltip>
        )}

        {isOwner && (
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
        )}

        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="lg" disabled>
                <IoSparkles className="size-6 text-chart-3 dark:text-chart-1" />
                <span className="font-oswald text-lg font-semibold uppercase">
                  Predictions
                </span>
              </Button>
            </TooltipTrigger>
            {/* <TooltipContent>
            Create and edit available prediction markets
          </TooltipContent> */}
            <TooltipContent>Coming Soon</TooltipContent>
          </Tooltip>
        )}

        <DropdownMenu>
          <Tooltip defaultOpen>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-lg">
                  {isSavingPreferences ? (
                    <Spinner />
                  ) : (
                    <FaGear className="text-chart-3 dark:text-chart-1" />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Update your preferences</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Roles</DropdownMenuLabel>
              <div className="flex items-center gap-1">
                {ROLE_OPTIONS.map(({ value, label, Icon }) => {
                  const selected = currentParticipant.roles.includes(value)

                  return (
                    <Button
                      key={value}
                      type="button"
                      size="icon-lg"
                      variant={selected ? "default" : "secondary"}
                      aria-label={label}
                      aria-pressed={selected}
                      onClick={() => handleRoleToggle(value)}
                    >
                      <Icon />
                    </Button>
                  )
                })}
              </div>

              <DropdownMenuLabel>Rank</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {selectedRankLabel}
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={currentParticipant.rank ?? undefined}
                      onValueChange={handleRankChange}
                    >
                      {RANK_OPTIONS.map(({ value, label }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {showStartDraft && isOwner && (
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

        {isOwner && (
          <Dialog open={dummyDialogOpen} onOpenChange={setDummyDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="lg">
                    <FaUser className="size-5 text-chart-3 dark:text-chart-1" />
                    <span className="font-oswald text-lg font-semibold uppercase">
                      Add dummy
                    </span>
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                Add a placeholder player to the lobby
              </TooltipContent>
            </Tooltip>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-oswald font-semibold uppercase">
                  Add dummy player
                </DialogTitle>
              </DialogHeader>

              <form action={handleAddDummy} className="space-y-4">
                <Input
                  name="displayName"
                  placeholder="Player name"
                  maxLength={32}
                  required
                />

                {dummyRoles.map((role) => (
                  <input key={role} type="hidden" name="roles" value={role} />
                ))}

                <input type="hidden" name="rank" value={dummyRank ?? ""} />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Positions</p>

                  <div className="flex items-center gap-1">
                    {ROLE_OPTIONS.map(({ value, label, Icon }) => {
                      const selected = dummyRoles.includes(value)

                      return (
                        <Button
                          key={value}
                          type="button"
                          size="icon-lg"
                          variant={selected ? "default" : "secondary"}
                          aria-label={label}
                          aria-pressed={selected}
                          onClick={() => handleDummyRoleToggle(value)}
                        >
                          <Icon />
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Rank</p>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {dummyRankLabel}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                      <DropdownMenuRadioGroup
                        value={dummyRank ?? undefined}
                        onValueChange={handleDummyRankChange}
                      >
                        {RANK_OPTIONS.map(({ value, label }) => (
                          <DropdownMenuRadioItem key={value} value={value}>
                            {label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isAddingDummy || !dummyRank || dummyRoles.length === 0
                  }
                >
                  {isAddingDummy ? <Spinner /> : "Add player"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
        {isOwner && pickingTeam !== null && activeLobby && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Move backward in picking order"
              disabled={
                isAdjustingPickOrder || activeLobby.draftPickIndex === 0
              }
              onClick={() => handleAdjustPickOrder(-1)}
            >
              <ChevronLeftIcon />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Move forward in picking order"
              disabled={
                isAdjustingPickOrder ||
                activeLobby.draftPickIndex === DRAFT_PICK_ORDER.length - 1
              }
              onClick={() => handleAdjustPickOrder(1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}

        {phaseLabel && (
          <div
            className={cn(
              "gap-2 px-6! font-oswald text-lg! font-semibold uppercase",
              buttonVariants({ size: "lg" }),
              activeLobby?.phase === "OPEN" && "text-muted-foreground",
              pickingTeam === 0 && "text-blue-500",
              pickingTeam === 1 && "text-rose-500"
            )}
          >
            {phaseLabel}
            {activeLobby?.phase === "OPEN" &&
              (isStartingDraft ? (
                <Spinner />
              ) : (
                <span className="ml-1 size-2.5 animate-pulse rounded-full bg-current" />
              ))}
          </div>
        )}
      </div>
    </header>
  )
}
