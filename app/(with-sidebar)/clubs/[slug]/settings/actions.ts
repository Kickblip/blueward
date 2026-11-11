"use server"

import { auth } from "@clerk/nextjs/server"
import { and, eq, exists } from "drizzle-orm"
import { AwsClient } from "aws4fetch"
import pLimit from "p-limit"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"
import * as z from "zod"
import { db } from "@/lib/db"
import { clubMembers, clubs, players } from "@/lib/schema"
import { isClubImageKey } from "@/lib/club-images"
import { safeSubstring } from "@/lib/utils"

const clubSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(parseInt(code, 16))
    )
}

async function deleteClubImages(clubId: number) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.R2_BUCKET_NAME
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new Error("Club image storage is not configured.")
  }

  const r2 = new AwsClient({ accessKeyId, secretAccessKey })
  const bucketUrl = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`
  )
  const limit = pLimit(10)

  for (const kind of ["logos", "banners"] as const) {
    let continuationToken: string | undefined

    do {
      const listUrl = new URL(bucketUrl)
      listUrl.searchParams.set("list-type", "2")
      listUrl.searchParams.set("encoding-type", "url")
      listUrl.searchParams.set("prefix", `clubs/${kind}/${clubId}/`)

      if (continuationToken) {
        listUrl.searchParams.set("continuation-token", continuationToken)
      }

      const listResponse = await fetch(await r2.sign(new Request(listUrl)))

      if (!listResponse.ok) {
        throw new Error(
          `Could not list club images in storage (${listResponse.status}).`
        )
      }

      const xml = await listResponse.text()
      const keys = Array.from(
        xml.matchAll(/<Key>([\s\S]*?)<\/Key>/g),
        ([, key]) => decodeURIComponent(decodeXmlEntities(key))
      )

      await Promise.all(
        keys.map((key) =>
          limit(async () => {
            if (!isClubImageKey(key, kind, clubId)) {
              throw new Error("Storage returned an image outside the club.")
            }

            const objectUrl = new URL(bucketUrl)
            objectUrl.pathname += `/${key
              .split("/")
              .map(encodeURIComponent)
              .join("/")}`

            const response = await fetch(
              await r2.sign(new Request(objectUrl, { method: "DELETE" }))
            )

            if (!response.ok) {
              throw new Error(
                `Could not delete a club image from storage (${response.status}).`
              )
            }
          })
        )
      )

      const isTruncated = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      const nextToken = xml.match(
        /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/
      )?.[1]

      if (isTruncated) {
        if (!nextToken) {
          throw new Error("Storage returned an incomplete club image listing.")
        }

        continuationToken = decodeXmlEntities(nextToken)
      } else {
        continuationToken = undefined
      }
    } while (continuationToken)
  }
}

export async function deleteClub(slug: string) {
  const parsedSlug = clubSlugSchema.safeParse(slug)

  if (!parsedSlug.success) {
    throw new Error("Invalid club.")
  }

  const { userId } = await auth()

  if (!userId) {
    redirect(`/signin?redirect_url=/clubs/${parsedSlug.data}/settings`)
  }

  const [club] = await db
    .select({ id: clubs.id })
    .from(clubs)
    .innerJoin(clubMembers, eq(clubMembers.clubId, clubs.id))
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(
      and(
        eq(clubs.slug, parsedSlug.data),
        eq(players.authId, userId),
        eq(clubMembers.role, "OWNER")
      )
    )
    .limit(1)

  if (!club) {
    throw new Error("Only the club owner can delete this club.")
  }

  const memberPlayers = await db
    .select({ puuid: players.puuid })
    .from(clubMembers)
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(eq(clubMembers.clubId, club.id))

  await deleteClubImages(club.id)

  const [deletedClub] = await db
    .delete(clubs)
    .where(
      and(
        eq(clubs.id, club.id),
        exists(
          db
            .select({ clubId: clubMembers.clubId })
            .from(clubMembers)
            .innerJoin(players, eq(players.id, clubMembers.playerId))
            .where(
              and(
                eq(clubMembers.clubId, clubs.id),
                eq(players.authId, userId),
                eq(clubMembers.role, "OWNER")
              )
            )
        )
      )
    )
    .returning({ id: clubs.id })

  if (!deletedClub) {
    throw new Error("Club ownership changed. Refresh and try again.")
  }

  for (const player of memberPlayers) {
    updateTag(`player-card:${safeSubstring(player.puuid, 0, 20)}`)
  }

  updateTag(`club:${parsedSlug.data}`)
  updateTag("clubs")
  revalidatePath("/clubs")
  redirect("/clubs")
}
