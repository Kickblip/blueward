import { type NextRequest, NextResponse } from "next/server"
import { AwsClient } from "aws4fetch"
import {
  MAX_CLUB_BANNER_SIZE_BYTES,
  IMAGE_UPLOAD_EXPIRES_SECONDS,
  FILE_EXTENSIONS,
  IMAGE_MIME_TYPES,
} from "@/lib/config"
import * as z from "zod"
import { db } from "@/lib/db"
import { clubMembers, clubs, players } from "@/lib/schema"
import { revalidateTag } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { and, eq, inArray } from "drizzle-orm"

const requestSchema = z.object({
  contentType: z.enum(IMAGE_MIME_TYPES),
  size: z.number().int().positive().max(MAX_CLUB_BANNER_SIZE_BYTES),
  clubId: z.coerce.number().int().positive(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { userId } = await auth()
  const { clubId } = await params

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsedRequest = requestSchema.safeParse({ ...body, clubId })

  if (!parsedRequest.success) {
    return NextResponse.json(
      { ok: false, error: "Malformed request" },
      { status: 400 }
    )
  }

  const [access] = await db
    .select({ previousSlug: clubs.slug })
    .from(clubMembers)
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .innerJoin(clubs, eq(clubs.id, clubMembers.clubId))
    .where(
      and(
        eq(clubMembers.clubId, parsedRequest.data.clubId),
        eq(players.authId, userId),
        inArray(clubMembers.role, ["OWNER", "ADMIN"])
      )
    )
    .limit(1)

  if (!access) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const r2 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  })

  const extension = FILE_EXTENSIONS[parsedRequest.data.contentType]
  const uuid = crypto.randomUUID()
  const key = `clubs/banners/${clubId}/${uuid}.${extension}`

  const url = new URL(
    `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`
  )
  url.searchParams.set("X-Amz-Expires", IMAGE_UPLOAD_EXPIRES_SECONDS.toString())
  url.searchParams.set("Content-Type", parsedRequest.data.contentType)
  url.searchParams.set("Content-Length", parsedRequest.data.size.toString())

  const signed = await r2.sign(new Request(url, { method: "PUT" }), {
    aws: { signQuery: true },
  })

  return NextResponse.json(
    {
      ok: true,
      url: signed.url,
      key,
      error: null,
    },
    { status: 200 }
  )
}

const patchRequestSchema = z.object({
  key: z.string(),
  clubId: z.coerce.number().int().positive(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { userId } = await auth()
  const { clubId } = await params

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsedRequest = patchRequestSchema.safeParse({ ...body, clubId })

  if (!parsedRequest.success) {
    return NextResponse.json(
      { ok: false, error: "Malformed request" },
      { status: 400 }
    )
  }

  const [access] = await db
    .select({ previousSlug: clubs.slug })
    .from(clubMembers)
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .innerJoin(clubs, eq(clubs.id, clubMembers.clubId))
    .where(
      and(
        eq(clubMembers.clubId, parsedRequest.data.clubId),
        eq(players.authId, userId),
        inArray(clubMembers.role, ["OWNER", "ADMIN"])
      )
    )
    .limit(1)

  if (!access) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const [updatedClub] = await db
    .update(clubs)
    .set({
      bannerKey: parsedRequest.data.key,
    })
    .where(eq(clubs.id, parsedRequest.data.clubId))
    .returning({ id: clubs.id })

  if (!updatedClub) {
    return NextResponse.json(
      { ok: false, error: "Club not found" },
      { status: 404 }
    )
  }

  revalidateTag("clubs", { expire: 0 })

  return NextResponse.json(
    {
      ok: true,
      error: null,
    },
    { status: 200 }
  )
}
