"use server"

import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import * as z from "zod"

import { db } from "@/lib/db"
import { playerSettings, players, rankEnum, roleEnum } from "@/lib/schema"

const rankSchema = z.enum(rankEnum.enumValues)
const roleSchema = z.enum(roleEnum.enumValues).exclude(["FILL"])

const settingsSchema = z.object({
  peakRank: rankSchema,
  seasonsSincePeak: z
    .string()
    .regex(/^(?:[0-9]|1[0-2])$/)
    .transform(Number),
  currentRank: rankSchema,

  topSkillRank: rankSchema,
  jungleSkillRank: rankSchema,
  middleSkillRank: rankSchema,
  bottomSkillRank: rankSchema,
  supportSkillRank: rankSchema,

  rejectedRoles: z.array(roleSchema).max(5),
  dislikedRoles: z.array(roleSchema).max(5),
})

export async function updatePlayerSettings(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/signin?redirect_url=/settings")
  }

  const result = settingsSchema.safeParse({
    peakRank: formData.get("peakRank"),
    seasonsSincePeak: formData.get("seasonsSincePeak"),
    currentRank: formData.get("currentRank"),

    topSkillRank: formData.get("topSkillRank"),
    jungleSkillRank: formData.get("jungleSkillRank"),
    middleSkillRank: formData.get("middleSkillRank"),
    bottomSkillRank: formData.get("bottomSkillRank"),
    supportSkillRank: formData.get("supportSkillRank"),

    rejectedRoles: formData.getAll("rejectedRoles"),
    dislikedRoles: formData.getAll("dislikedRoles"),
  })

  if (!result.success) {
    throw new Error("Invalid autobalancer settings")
  }

  const player = await db.query.players.findFirst({
    where: eq(players.authId, userId),
    columns: {
      id: true,
    },
  })

  if (!player) {
    throw new Error("Connect your Riot account before saving settings")
  }

  await db
    .insert(playerSettings)
    .values({
      playerId: player.id,
      ...result.data,
    })
    .onConflictDoUpdate({
      target: playerSettings.playerId,
      set: result.data,
    })

  revalidatePath("/settings")
}
