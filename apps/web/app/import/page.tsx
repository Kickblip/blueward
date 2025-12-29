import { currentUser, clerkClient } from "@clerk/nextjs/server"
import ErrorMessage from "@repo/ui/ErrorMessage"
import pLimit from "p-limit"

async function fetchWithRetry(url: string, opts: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, opts)
    if (res.status !== 429) return res

    const sleep = Number(res.headers.get("retry-after") ?? "1") * 1_000
    await new Promise((r) => setTimeout(r, sleep))
  }
  throw new Error("Exceeded retry budget (429)")
}

export default async function Import() {
  console.time("Import total")
  const user = await currentUser()
  if (!user) {
    return <ErrorMessage code={401} message="User not authenticated" />
  }

  const hasRiotAccountConnected = user && user.externalAccounts.some((account) => account.provider === "oauth_custom_riot_games")
  if (!hasRiotAccountConnected) {
    return <ErrorMessage code={400} message="Please connect your Riot account in your profile settings to import game data." />
  }

  const client = await clerkClient()
  const provider = await client.users.getUserOauthAccessToken(user.id, "custom_riot_games")
  const riotToken = provider.data[0]?.token || ""

  const matchIdsRes = await fetchWithRetry(`${process.env.NEXT_PUBLIC_RIOT_RSO_API_ROOT}/matches/ids?start=0&count=5`, {
    headers: { Authorization: `Bearer ${riotToken}` },
  })
  if (!matchIdsRes.ok) {
    return <ErrorMessage code={matchIdsRes.status} message="Failed to fetch match IDs from Riot API." />
  }
  const matchIds: string[] = await matchIdsRes.json()

  const limit = pLimit(5)
  const rawMatches = await Promise.all(
    matchIds.map((id) =>
      limit(async () => {
        const r = await fetchWithRetry(`${process.env.NEXT_PUBLIC_RIOT_RSO_API_ROOT}/matches/${id}`, {
          headers: { Authorization: `Bearer ${riotToken}` },
        })
        return r.ok ? await r.json() : null
      }),
    ),
  )

  console.timeEnd("Import total")

  return <>{JSON.stringify(rawMatches)}</>
}
