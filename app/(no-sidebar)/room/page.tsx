import { Button } from "@/components/ui/button"
import { ChevronLeft, PlusIcon } from "lucide-react"
import { createRoom } from "./actions"
import { Logo } from "@/components/logo"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { auth } from "@clerk/nextjs/server"
import { ErrorMessage } from "@/components/error-message"
import { clubMembers, players } from "@/lib/schema"
import { db } from "@/lib/db"
import { and, eq, inArray } from "drizzle-orm"

export default async function Page() {
  const { userId } = await auth()

  if (!userId) {
    return <ErrorMessage message="Please Sign In" />
  }

  const managedMembership = userId
    ? (
        await db
          .select({ role: clubMembers.role })
          .from(players)
          .innerJoin(clubMembers, eq(clubMembers.playerId, players.id))
          .where(
            and(
              eq(players.authId, userId),
              inArray(clubMembers.role, ["OWNER", "ADMIN"])
            )
          )
          .limit(1)
      )[0]
    : undefined

  const isOwnerOrAdmin = Boolean(managedMembership)

  if (!isOwnerOrAdmin) {
    return (
      <ErrorMessage message="You must be a club owner or admin to create a room" />
    )
  }

  return (
    <div className="grid min-h-screen w-full place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/">
                <ChevronLeft />
                <Logo className="size-8!" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Return Home</TooltipContent>
        </Tooltip>

        <h1 className="font-oswald text-2xl font-semibold uppercase sm:text-3xl">
          Create a New Room
        </h1>

        <form action={createRoom}>
          <Button
            type="submit"
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <PlusIcon className="size-6!" />
            <span className="pl-1 font-oswald text-lg font-semibold uppercase">
              Create a room
            </span>
          </Button>
        </form>
      </div>
    </div>
  )
}
