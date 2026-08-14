import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { CheckCircle2Icon } from "lucide-react"
import pLimit from "p-limit"
import { ErrorMessage } from "@/components/error-message"
import { RecentGame } from "@/components/recent-game"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { players } from "@/lib/schema"
import { fetchWithRetry, riotMatchSchema, submitMatch } from "./actions"
import { SubmitMatchForm } from "./submit-match-form"
import { eq } from "drizzle-orm"
import { SubmitMatchButton } from "./submit-match-button"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const { submitted } = await searchParams
  const user = await currentUser()
  if (!user) {
    return <ErrorMessage message="Please sign in" />
  }

  const player = await db.query.players.findFirst({
    where: eq(players.authId, user.id),
    columns: {
      id: true,
      puuid: true,
    },
    with: {
      clubMemberships: {
        columns: {
          clubId: true,
        },
        with: {
          club: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!player) {
    return (
      // Should never happen but this would be from an unclaimed account
      <ErrorMessage message="Unclaimed account" />
    )
  }

  if (player.clubMemberships.length === 0) {
    return <ErrorMessage message="You must join a club to submit matches" />
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

          if (!res.ok) return null

          const match = riotMatchSchema.safeParse(await res.json())
          return match.success ? match.data : null
        })
      )
    )
  ).filter((match) => match !== null)

  if (matchIds.length > 0 && rawMatches.length === 0) {
    return (
      <ErrorMessage message="Riot is rate limiting match requests. Please wait and try again." />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <h1 className="font-oswald text-2xl font-semibold uppercase">
        Recently Played
      </h1>

      {submitted && (
        <Card className="flex-row items-start gap-3">
          <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-chart-3 dark:text-chart-1" />
          <div>
            <p className="font-oswald font-semibold uppercase">
              Match submitted
            </p>
            <p className="text-sm">
              Your club&apos;s admins can now review it.
            </p>
          </div>
        </Card>
      )}

      <SubmitMatchForm submitAction={submitMatch}>
        <div className="flex flex-col gap-4">
          {rawMatches.map((match, idx) => (
            <label key={match.metadata.matchId} className="cursor-pointer">
              <input
                type="radio"
                name="matchId"
                value={match.metadata.matchId}
                defaultChecked={idx === 0}
                required
                className="peer sr-only"
              />
              <div className="rounded-md ring-offset-background peer-checked:ring-2 peer-checked:ring-chart-3 peer-focus-visible:ring-2 peer-focus-visible:ring-ring dark:peer-checked:ring-chart-1">
                <RecentGame
                  players={match.info.participants.map((participant) => ({
                    puuid: participant.puuid,
                    riotIdGameName: participant.riotIdGameName,
                    championName: participant.championName,
                    kills: participant.kills,
                    deaths: participant.deaths,
                    assists: participant.assists,
                  }))}
                  gameEndTimestamp={match.info.gameEndTimestamp}
                  interactive={false}
                />
              </div>
            </label>
          ))}
        </div>

        <Card title="Submit match" className="gap-4 lg:sticky lg:top-4">
          <p className="text-sm text-muted-foreground">
            Select a recent game and the club that should review it
          </p>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <select
              name="clubId"
              required
              defaultValue={player.clubMemberships[0].clubId}
              className="h-9 rounded-md border bg-background px-3"
            >
              {player.clubMemberships.map(({ clubId, club }) => (
                <option key={clubId} value={clubId}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>

          <SubmitMatchButton disabled={rawMatches.length === 0} />
        </Card>
      </SubmitMatchForm>
    </div>
  )
}
