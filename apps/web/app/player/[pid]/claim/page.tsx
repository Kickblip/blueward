import { currentUser, clerkClient } from "@clerk/nextjs/server"
import ErrorMessage from "@repo/ui/ErrorMessage"
import { fetchWithRetry } from "@/app/import/helpers"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { eq, isNull, and } from "drizzle-orm"

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

export default async function ClaimProfile({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params

  const user = await currentUser()
  if (!user) return <ErrorMessage code={401} message="User not authenticated. Please log in!" />

  const client = await clerkClient()
  const provider = await client.users.getUserOauthAccessToken(user.id, "custom_riot_games")
  const riotToken = provider.data[0]?.token
  if (!riotToken) return <ErrorMessage code={401} message="Missing Riot access token." />

  const userinfoRes = await fetchWithRetry("https://auth.riotgames.com/userinfo", {
    headers: { Authorization: `Bearer ${riotToken}` },
  })
  if (!userinfoRes.ok) {
    return <ErrorMessage code={userinfoRes.status} message="Failed to fetch Riot userinfo." />
  }
  const userinfo = await userinfoRes.json()
  const cpid: string | undefined = userinfo?.cpid
  if (!cpid) {
    return (
      <ErrorMessage code={400} message="No cpid returned. Make sure your OAuth scopes include cpid when initiating Riot login." />
    )
  }

  const platform = CPID_TO_PLATFORM[cpid]
  if (!platform) return <ErrorMessage code={400} message={`Unknown cpid: ${cpid}`} />

  const summonerRes = await fetchWithRetry(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/me`, {
    headers: { Authorization: `Bearer ${riotToken}` },
  })
  if (!summonerRes.ok) {
    return <ErrorMessage code={summonerRes.status} message="Failed to fetch summoner from Riot." />
  }
  const summoner = await summonerRes.json()
  const puuid: string | undefined = summoner?.puuid
  if (!puuid) return <ErrorMessage code={500} message="No puuid returned from summoner/me." />

  if (puuid.substring(0, 20) !== pid) {
    return <ErrorMessage code={400} message="Your connected Riot account does not match the profile you are trying to claim." />
  }

  const player = await db.query.players.findFirst({
    where: and(eq(players.puuid, puuid), isNull(players.authId)),
  })

  if (!player) {
    return <ErrorMessage code={404} message="Player not found or already claimed." />
  }

  await db.update(players).set({ authId: user.id }).where(eq(players.id, player.id))

  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      puuid,
    },
  })

  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className="text-xl font-oswald font-semibold">Successfully claimed this account</h1>
    </div>
  )
}
