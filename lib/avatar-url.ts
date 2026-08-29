import "server-only"

import { clerkClient } from "@clerk/nextjs/server"

export async function fetchAvatarUrlByAuthId(
  authId: string | null | undefined
): Promise<string | null> {
  "use server"

  if (!authId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(authId)
    return user.imageUrl ?? null
  } catch {
    return null
  }
}
