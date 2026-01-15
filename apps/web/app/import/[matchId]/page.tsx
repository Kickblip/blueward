import { fetchWithRetry, importMatchJson } from "../helpers"
import { currentUser, clerkClient } from "@clerk/nextjs/server"
import ErrorMessage from "@repo/ui/ErrorMessage"
import { toErrorMessage } from "@repo/ui/helpers"
import RevalidateAfterImport from "./RevalidateAfterImport"

export default async function Import({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params

  const user = await currentUser()
  if (!user) {
    return <ErrorMessage code={401} message="User not authenticated" />
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

  const r = await fetchWithRetry(`${process.env.NEXT_PUBLIC_RIOT_RSO_API_ROOT}/matches/${matchId}`, {
    headers: { Authorization: `Bearer ${riotToken}` },
  })

  const matchData = r.ok ? await r.json() : null

  if (!matchData) {
    return <ErrorMessage code={r.status} message="Failed to fetch match data from Riot API." />
  }

  try {
    await importMatchJson(matchData)

    return (
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-oswald font-semibold">Import complete for {matchId}</h1>
        <RevalidateAfterImport />
      </div>
    )
  } catch (err) {
    console.error("Import failed", { matchId, err })
    return <ErrorMessage code={500} message={`DB import failed: ${toErrorMessage(err)}`} />
  }
}
