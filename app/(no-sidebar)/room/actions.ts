"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { clubMembers, players } from "@/lib/schema"
import { and, eq, inArray } from "drizzle-orm"
import { callRoomService } from "@/lib/spacetime/server"

export async function createRoom(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/signin")
  }

  const [managedMembership] = await db
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

  if (!managedMembership) {
    throw new Error("You must be a club owner or admin to create a room")
  }

  const roomId = randomUUID()
  const lobbyId = randomUUID()

  await callRoomService("create_room", {
    roomId,
    lobbyId,
    ownerAuthId: userId,
    forceSignIn: formData.get("forceSignIn") === "true",
    forceRankRoles: formData.get("forceRankRoles") === "true",
  })

  redirect(`/room/${roomId}`)
}
