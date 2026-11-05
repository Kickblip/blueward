"use client"

import { useState } from "react"
import { EllipsisIcon } from "lucide-react"
import { FaShield, FaTrash, FaUser } from "react-icons/fa6"
import { PiCrownSimpleFill } from "react-icons/pi"
import {
  demoteToMember,
  makeOwner,
  promoteToAdmin,
  removeMember,
} from "./actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MemberRole = "OWNER" | "ADMIN" | "MEMBER"
type MemberAction = "promote" | "demote" | "owner" | "remove"

const actionDetails: Record<
  MemberAction,
  {
    title: string
    description: (name: string) => string
    confirmLabel: string
  }
> = {
  promote: {
    title: "Promote to Admin?",
    description: (name: string) =>
      `Promote ${name} to club admin? They will have access to admin permissions.`,
    confirmLabel: "Promote",
  },
  demote: {
    title: "Demote to Member?",
    description: (name: string) =>
      `Demote ${name} to a regular club member? They will lose admin permissions.`,
    confirmLabel: "Demote",
  },
  owner: {
    title: "Make Owner?",
    description: (name: string) =>
      `Transfer club ownership to ${name}? You will become an admin.`,
    confirmLabel: "Make Owner",
  },
  remove: {
    title: "Remove Member?",
    description: (name: string) =>
      `Remove ${name} from this club? They will no longer be a member.`,
    confirmLabel: "Remove Member",
  },
}

export function MemberActions({
  slug,
  playerId,
  name,
  role,
  currentMemberRole,
  isCurrentMember,
}: {
  slug: string
  playerId: number
  name: string
  role: MemberRole
  currentMemberRole?: MemberRole
  isCurrentMember: boolean
}) {
  const [activeAction, setActiveAction] = useState<MemberAction | null>(null)

  const action = activeAction
    ? {
        promote: promoteToAdmin,
        demote: demoteToMember,
        owner: makeOwner,
        remove: removeMember,
      }[activeAction].bind(null, slug, playerId)
    : null
  const details = activeAction ? actionDetails[activeAction] : null

  async function submitAction() {
    if (!action) return
    await action()
    setActiveAction(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${name}`}
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {role === "MEMBER" && (
            <DropdownMenuItem onSelect={() => setActiveAction("promote")}>
              <FaShield className="size-3 text-chart-3 dark:text-chart-1" />
              <span className="font-oswald font-semibold uppercase">
                Promote to Admin
              </span>
            </DropdownMenuItem>
          )}

          {role === "ADMIN" && !isCurrentMember && (
            <DropdownMenuItem onSelect={() => setActiveAction("demote")}>
              <FaUser className="size-3 text-chart-3 dark:text-chart-1" />
              <span className="font-oswald font-semibold uppercase">
                Demote to Member
              </span>
            </DropdownMenuItem>
          )}

          {currentMemberRole === "OWNER" && !isCurrentMember && (
            <DropdownMenuItem onSelect={() => setActiveAction("owner")}>
              <PiCrownSimpleFill className="size-3 text-chart-3 dark:text-chart-1" />
              <span className="font-oswald font-semibold uppercase">
                Make Owner
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onSelect={() => setActiveAction("remove")}>
            <FaTrash className="size-3 text-chart-3 dark:text-chart-1" />
            <span className="font-oswald font-semibold uppercase">Remove</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={activeAction !== null}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null)
        }}
      >
        <DialogContent>
          {details && (
            <>
              <DialogHeader>
                <DialogTitle className="font-oswald font-semibold uppercase">
                  {details.title}
                </DialogTitle>
                <DialogDescription>
                  {details.description(name)}
                </DialogDescription>
              </DialogHeader>

              <form action={submitAction}>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    variant={activeAction === "promote" ? "default" : "destructive"}
                  >
                    {details.confirmLabel}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
