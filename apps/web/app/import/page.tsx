import { currentUser, clerkClient } from "@clerk/nextjs/server"
import ErrorMessage from "@repo/ui/ErrorMessage"
import RecentGame from "@repo/ui/RecentGame"
import pLimit from "p-limit"
import Link from "next/link"
import { fetchWithRetry } from "./helpers"

export default async function RecentGames() {
  const user = await currentUser()
  if (!user) {
    return <ErrorMessage code={401} message="User not authenticated. Please log in!" />
  }

  if (user.privateMetadata.role !== "admin") {
    return <ErrorMessage code={403} message="User not authorized to import game data" />
  }

  const hasRiotAccountConnected = user && user.externalAccounts.some((account) => account.provider === "oauth_custom_riot_games")
  if (!hasRiotAccountConnected) {
    return <ErrorMessage code={400} message="Please connect your Riot account in your profile settings to import game data" />
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold font-oswald">Recently Played (Click to import)</h1>

      <div className="grid grid-cols-3 gap-4">
        {rawMatches.map((m, idx) => (
          <Link href={`/import/${m.metadata.matchId}`} key={idx}>
            <RecentGame
              key={idx}
              players={m.info.participants.map((p: any) => ({
                riotIdGameName: p.riotIdGameName,
                championName: p.championName,
                kills: p.kills,
                deaths: p.deaths,
                assists: p.assists,
              }))}
              gameEndTimestamp={m.info.gameEndTimestamp}
              interactive={false}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
