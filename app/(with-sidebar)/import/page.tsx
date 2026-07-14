import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { ErrorMessage } from "@/components/error-message"
import { RecentGame } from "@/components/recent-game"
import pLimit from "p-limit"
import Link from "next/link"
import { fetchWithRetry } from "./actions"

export default async function RecentGames() {
  const user = await currentUser()
  if (!user) {
    return (
      <ErrorMessage
        code={401}
        message="User not authenticated. Please log in!"
      />
    )
  }

  if (user.privateMetadata.role !== "admin") {
    return (
      <ErrorMessage
        code={403}
        message="User not authorized to import game data"
      />
    )
  }

  const hasRiotAccountConnected =
    user &&
    user.externalAccounts.some(
      (account) => account.provider === "oauth_custom_riot_games"
    )
  if (!hasRiotAccountConnected) {
    return (
      <ErrorMessage
        code={400}
        message="Please connect your Riot account in your profile settings to import game data"
      />
    )
  }

  const client = await clerkClient()
  const provider = await client.users.getUserOauthAccessToken(
    user.id,
    "custom_riot_games"
  )
  const riotToken = provider.data[0]?.token || ""

  const riotRequest = {
    headers: {
      Authorization: `Bearer ${riotToken}`,
    },
    next: {
      revalidate: 15,
    },
  } satisfies RequestInit

  const matchIdsRes = await fetchWithRetry(
    `${process.env.NEXT_PUBLIC_RIOT_RSO_API_ROOT}/matches/ids?start=0&count=5`,
    riotRequest
  )
  if (!matchIdsRes.ok) {
    return (
      <ErrorMessage
        code={matchIdsRes.status}
        message={
          matchIdsRes.status === 429
            ? "Riot is rate limiting requests. Please wait and try again."
            : "Failed to fetch match IDs from Riot API."
        }
      />
    )
  }
  const matchIds: string[] = await matchIdsRes.json()

  const limit = pLimit(2)

  const rawMatches = (
    await Promise.all(
      matchIds.map((id) =>
        limit(async () => {
          const res = await fetchWithRetry(
            `${process.env.NEXT_PUBLIC_RIOT_RSO_API_ROOT}/matches/${id}`,
            riotRequest
          )

          return res.ok ? await res.json() : null
        })
      )
    )
  ).filter((match) => match !== null)

  if (matchIds.length > 0 && rawMatches.length === 0) {
    return (
      <ErrorMessage
        code={429}
        message="Riot is rate limiting match requests. Please wait and try again."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-oswald text-2xl font-semibold">
        Recently Played (Click to import)
      </h1>

      <h1 className="font-oswald text-2xl font-semibold text-orange-500">
        IMPORTANT: THESE ARE NOT ONLY CUSTOM GAMES they are all recently played
        games
      </h1>
      <h1 className="font-oswald text-2xl font-semibold text-orange-500">
        IMPORTANT: ONLY IMPORT INHOUSES - not clol
      </h1>
      <h1 className="font-oswald text-2xl font-semibold text-red-500">
        BE CAREFUL WHAT YOU IMPORT
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {rawMatches.map((m, idx) => (
          <Link
            key={idx}
            href={`/import/${m.metadata.matchId}`}
            prefetch={false}
          >
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
