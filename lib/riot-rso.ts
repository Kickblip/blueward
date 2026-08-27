"use server"

import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { fetchWithRetry } from "@/app/(with-sidebar)/import/actions"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { safeSubstring } from "@/lib/utils"
import { updateTag } from "next/cache"

const CPID_TO_PLATFORM: Record<string, string> = {
  NA1: "na1",
  EUW1: "euw1",
  EUN1: "eun1",
  KR: "kr",
  JP1: "jp1",
  BR1: "br1",
  LA1: "la1",
  LA2: "la2",
  OC1: "oc1",
  RU: "ru",
  TR1: "tr1",
  PH2: "ph2",
  SG2: "sg2",
  TH2: "th2",
  TW2: "tw2",
  VN2: "vn2",
}

const CPID_TO_ACCOUNT_REGION: Record<string, "americas" | "europe" | "asia"> = {
  NA1: "americas",
  BR1: "americas",
  LA1: "americas",
  LA2: "americas",

  EUW1: "europe",
  EUN1: "europe",
  RU: "europe",
  TR1: "europe",

  KR: "asia",
  JP1: "asia",
  OC1: "asia",
  PH2: "asia",
  SG2: "asia",
  TH2: "asia",
  TW2: "asia",
  VN2: "asia",
}

type ErrorResult = { ok: false; code: number; message: string }

type RiotIdentityResult =
  | {
      ok: true
      puuid: string
      riotIdGameName: string
      riotIdTagline: string
      platform: string
      userId: string
      client: Awaited<ReturnType<typeof clerkClient>>
    }
  | ErrorResult

type ClaimProfileResult = { ok: true; puuid: string } | ErrorResult

export async function getCurrentRiotIdentity(): Promise<RiotIdentityResult> {
  const user = await currentUser()
  if (!user) {
    return {
      ok: false,
      code: 401,
      message: "User not authenticated. Please log in!",
    }
  }

  const client = await clerkClient()
  const provider = await client.users.getUserOauthAccessToken(
    user.id,
    "custom_riot_games"
  )
  const riotToken = provider.data[0]?.token

  if (!riotToken) {
    return { ok: false, code: 401, message: "Missing Riot access token." }
  }

  const userinfoRes = await fetchWithRetry(
    "https://auth.riotgames.com/userinfo",
    {
      headers: { Authorization: `Bearer ${riotToken}` },
    }
  )

  if (!userinfoRes.ok) {
    return {
      ok: false,
      code: userinfoRes.status,
      message: "Failed to fetch Riot userinfo.",
    }
  }

  const userinfo = await userinfoRes.json()
  const cpid: string | undefined = userinfo?.cpid

  if (!cpid) {
    return {
      ok: false,
      code: 400,
      message:
        "No cpid returned. Make sure your OAuth scopes include cpid when initiating Riot login.",
    }
  }

  const platform = CPID_TO_PLATFORM[cpid]
  if (!platform) {
    return { ok: false, code: 400, message: `Unknown cpid: ${cpid}` }
  }

  const accountRegion = CPID_TO_ACCOUNT_REGION[cpid]
  if (!accountRegion) {
    return {
      ok: false,
      code: 400,
      message: `Unknown account region for cpid: ${cpid}`,
    }
  }

  const accountRes = await fetchWithRetry(
    `https://${accountRegion}.api.riotgames.com/riot/account/v1/accounts/me`,
    {
      headers: { Authorization: `Bearer ${riotToken}` },
    }
  )

  if (!accountRes.ok) {
    return {
      ok: false,
      code: accountRes.status,
      message: "Failed to fetch Riot account.",
    }
  }

  const account = await accountRes.json()
  const puuid: string | undefined = account?.puuid
  const riotIdGameName: string | undefined = account?.gameName
  const riotIdTagline: string | undefined = account?.tagLine

  if (!puuid) {
    return {
      ok: false,
      code: 500,
      message: "No puuid returned from Riot account endpoint.",
    }
  }

  if (!riotIdGameName || !riotIdTagline) {
    return {
      ok: false,
      code: 500,
      message: "Missing Riot ID game name or tagline.",
    }
  }

  return {
    ok: true,
    puuid,
    riotIdGameName,
    riotIdTagline,
    platform,
    userId: user.id,
    client,
  }
}

export async function claimProfileByPuuid(args: {
  puuid: string
  riotIdGameName: string
  riotIdTagline: string
  platform: string
  userId: string
  client: Awaited<ReturnType<typeof clerkClient>>
}): Promise<ClaimProfileResult> {
  const { puuid, riotIdGameName, platform, riotIdTagline, userId, client } =
    args

  const player = await db.query.players.findFirst({
    where: eq(players.puuid, puuid),
  })

  if (!player) {
    await db.insert(players).values({
      authId: userId,
      bannerId: 0,
      banners: [0, 1, 2, 3],
      puuid,
      riotIdGameName,
      riotIdTagline,
    })
  } else {
    if (player.authId && player.authId !== userId) {
      return { ok: false, code: 409, message: "Player already claimed." }
    }

    await db
      .update(players)
      .set({
        authId: userId,
        riotIdGameName,
        riotIdTagline,
      })
      .where(eq(players.id, player.id))
  }

  const summonerRes = await fetchWithRetry(
    `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
    {
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY!,
      },
    }
  )

  if (!summonerRes.ok) {
    return {
      ok: false,
      code: summonerRes.status,
      message: "Failed to fetch League profile.",
    }
  }

  const { profileIconId } = (await summonerRes.json()) as {
    profileIconId?: number
  }

  if (typeof profileIconId !== "number") {
    return {
      ok: false,
      code: 500,
      message: "League profile icon was missing.",
    }
  }

  const iconResponse = await fetch(
    `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/profileicon/${profileIconId}.png`
  )

  if (!iconResponse.ok) {
    return {
      ok: false,
      code: 502,
      message: "Failed to download League profile icon.",
    }
  }

  await client.users.updateUserProfileImage(userId, {
    file: await iconResponse.blob(),
  })

  await client.users.updateUser(userId, {
    username: riotIdGameName,
  })

  await client.users.updateUserMetadata(userId, {
    privateMetadata: { puuid },
  })

  updateTag(`player-card:${safeSubstring(puuid, 0, 20)}`)

  return { ok: true, puuid }
}

export async function claimCurrentUsersProfile(): Promise<ClaimProfileResult> {
  const identity = await getCurrentRiotIdentity()
  if (!identity.ok) return identity

  return claimProfileByPuuid(identity)
}

export async function claimProfileByPid(
  pid: string
): Promise<ClaimProfileResult> {
  const identity = await getCurrentRiotIdentity()
  if (!identity.ok) return identity

  if (safeSubstring(identity.puuid, 0, 20) !== pid) {
    return {
      ok: false,
      code: 400,
      message:
        "Your connected Riot account does not match the profile you are trying to claim.",
    }
  }

  return claimProfileByPuuid(identity)
}
