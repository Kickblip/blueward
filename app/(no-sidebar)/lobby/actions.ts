"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { lobbies } from "@/lib/schema"

export async function createLobby() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/signin")
  }

  const id = randomUUID()

  await db.insert(lobbies).values({
    id,
    createdByAuthId: userId,
  })

  redirect(`/lobby/${id}`)
}
