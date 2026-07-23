"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { lobbies, rooms } from "@/lib/schema"

export async function createRoom() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/signin")
  }

  const roomId = randomUUID()

  await db.transaction(async (tx) => {
    await tx.insert(rooms).values({
      id: roomId,
      ownerAuthId: userId,
    })

    await tx.insert(lobbies).values({
      id: randomUUID(),
      roomId,
      ordinal: 1,
    })
  })

  redirect(`/room/${roomId}`)
}
