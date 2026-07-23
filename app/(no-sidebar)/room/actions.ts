"use server"

import { randomUUID } from "node:crypto"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { rooms } from "@/lib/schema"

export async function createRoom() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/signin")
  }

  const id = randomUUID()

  await db.insert(rooms).values({
    id,
    createdByAuthId: userId,
  })

  redirect(`/room/${id}`)
}
