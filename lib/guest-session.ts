import "server-only"

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import * as z from "zod"

const COOKIE_NAME = "blueward_guest"
const MAX_AGE = 60 * 60 * 24 * 30

export const guestDisplayNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a display name")
  .max(32, "Display name must be 32 characters or fewer")

const guestSessionSchema = z.object({
  id: z.uuid(),
  displayName: guestDisplayNameSchema,
  expiresAt: z.number().int(),
})

export type GuestSession = z.infer<typeof guestSessionSchema>

function sign(payload: string) {
  const secret = process.env.GUEST_SESSION_SECRET

  if (!secret) {
    throw new Error("GUEST_SESSION_SECRET is not configured")
  }

  return createHmac("sha256", secret).update(payload).digest()
}

function encode(session: GuestSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")
  const signature = sign(payload).toString("base64url")

  return `${payload}.${signature}`
}

function decode(value: string | undefined): GuestSession | null {
  if (!value) return null

  const [payload, signature, extra] = value.split(".")

  if (!payload || !signature || extra) return null

  const expected = sign(payload)
  const received = Buffer.from(signature, "base64url")

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null
  }

  try {
    const result = guestSessionSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString())
    )

    if (!result.success || result.data.expiresAt <= Date.now()) {
      return null
    }

    return result.data
  } catch {
    return null
  }
}

export async function getGuestSession() {
  const cookieStore = await cookies()
  return decode(cookieStore.get(COOKIE_NAME)?.value)
}

export async function saveGuestSession(displayName: string) {
  const cookieStore = await cookies()
  const existing = decode(cookieStore.get(COOKIE_NAME)?.value)

  const session: GuestSession = {
    id: existing?.id ?? randomUUID(),
    displayName,
    expiresAt: Date.now() + MAX_AGE * 1000,
  }

  cookieStore.set(COOKIE_NAME, encode(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}
