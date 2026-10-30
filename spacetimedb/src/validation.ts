import { z } from "zod"
import { ROOM_ROLES, ROOM_RANKS } from "../../lib/room-types"

export const uuid = z.uuid()
export const displayName = z.string().trim().min(1).max(32)
export const preferences = z.object({
  roles: z
    .array(z.enum(ROOM_ROLES))
    .max(5)
    .refine((roles) => new Set(roles).size === roles.length),
  rank: z.enum(ROOM_RANKS).nullable(),
})

const profile = z.object({
  id: z.number().int().positive(),
  puuid: z.string().min(1).max(128),
  riotIdGameName: z.string().max(64),
  riotIdTagline: z.string().max(16),
  experience: z.number().finite().nonnegative(),
  bannerId: z.number().int().nonnegative(),
  avatarUrl: z
    .string()
    .max(2048)
    .regex(/^https:\/\/[^\s]+$/)
    .nullable(),
})

const profileJson = z
  .string()
  .max(8192)
  .transform((value, ctx) => {
    try {
      return JSON.stringify(profile.parse(JSON.parse(value)))
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid player profile" })
      return z.NEVER
    }
  })
  .nullable()

const identityKey = z
  .string()
  .max(160)
  .regex(/^(clerk:[A-Za-z0-9_-]+|guest:[0-9a-f-]{36})$/)

export const ticketPayload = z.object({
  ticket: uuid,
  roomId: uuid,
  clientIdentity: z.string().regex(/^[0-9a-f]{64}$/),
  identityKey,
  displayName,
  profileJson,
  expiresAtMs: z.number().int().positive().safe(),
  refresh: z.boolean(),
})

export const roomPayload = z.object({
  roomId: uuid,
  lobbyId: uuid,
  ownerAuthId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
  forceSignIn: z.boolean().default(false),
  forceRankRoles: z.boolean().default(true),
})
