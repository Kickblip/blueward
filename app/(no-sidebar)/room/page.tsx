import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { createRoom } from "./actions"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { ErrorMessage } from "@/components/error-message"
import { clubMembers, players } from "@/lib/schema"
import { db } from "@/lib/db"
import { and, eq, inArray } from "drizzle-orm"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

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
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button variant="secondary" size="sm" className="w-fit" asChild>
          <Link href="/">
            <ChevronLeft />
            <span className="">Return Home</span>
          </Link>
        </Button>

        <h1 className="font-oswald text-xl font-semibold uppercase">
          Create a Team-Drafting Room
        </h1>

        <form action={createRoom} className="flex flex-col gap-4">
          <FieldLabel htmlFor="force-sign-in">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Force Sign In</FieldTitle>
                <FieldDescription>
                  Require players to sign in before joining. Guests cannot join.
                  Allows the owner to ban players from this room.
                </FieldDescription>
              </FieldContent>
              <Switch name="forceSignIn" id="force-sign-in" value="true" />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor="force-rank-roles">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Force Rank and Roles (Recommended)</FieldTitle>
                <FieldDescription>
                  Require players to select a rank and role before they can be
                  drafted.
                </FieldDescription>
              </FieldContent>
              <Switch
                name="forceRankRoles"
                id="force-rank-roles"
                value="true"
                defaultChecked
              />
            </Field>
          </FieldLabel>

          <Button
            type="submit"
            size="lg"
            className="font-oswald text-lg font-semibold uppercase"
          >
            Create a room
          </Button>
        </form>
      </div>
    </div>
  )
}
