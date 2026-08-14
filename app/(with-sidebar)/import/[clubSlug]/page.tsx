import { and, eq } from "drizzle-orm"

import { ErrorMessage } from "@/components/error-message"
import { RecentGame } from "@/components/recent-game"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { matchSubmissions } from "@/lib/schema"
import {
  getClubReviewer,
  reviewMatchSubmission,
  riotMatchSchema,
} from "../actions"

export default async function Page({
  params,
}: {
  params: Promise<{ clubSlug: string }>
}) {
  const { clubSlug } = await params
  const reviewer = await getClubReviewer(clubSlug)

  if (!reviewer) {
    return (
      <ErrorMessage message="Only this club's owners and admins can review match submissions." />
    )
  }

  const submissions = await db.query.matchSubmissions.findMany({
    where: and(
      eq(matchSubmissions.clubId, reviewer.clubId),
      eq(matchSubmissions.status, "PENDING")
    ),
    orderBy: (submission, { desc }) => [desc(submission.createdAt)],
    with: {
      submitter: {
        columns: {
          riotIdGameName: true,
          riotIdTagline: true,
        },
      },
    },
  })

  return (
    <div className="flex min-h-[80dvh] flex-col gap-4">
      <div>
        <h1 className="font-oswald text-3xl font-semibold uppercase">
          Pending matches
        </h1>
        <p className="text-sm text-muted-foreground">{reviewer.clubName}</p>
      </div>

      {submissions.length === 0 ? (
        <p className="py-8 text-center font-oswald text-lg font-semibold uppercase">
          No pending match submissions
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {submissions.map((submission) => {
            const match = riotMatchSchema.safeParse(submission.rawMatch)

            return (
              <div key={submission.id} className="flex flex-col gap-2">
                {match.success ? (
                  <RecentGame
                    players={match.data.info.participants.map(
                      (participant) => ({
                        puuid: participant.puuid,
                        riotIdGameName: participant.riotIdGameName,
                        championName: participant.championName,
                        kills: participant.kills,
                        deaths: participant.deaths,
                        assists: participant.assists,
                      })
                    )}
                    gameEndTimestamp={match.data.info.gameEndTimestamp}
                    interactive={false}
                  />
                ) : (
                  <Card>
                    <ErrorMessage message="This submission contains invalid match data." />
                  </Card>
                )}

                <form
                  action={reviewMatchSubmission}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="hidden"
                    name="submissionId"
                    value={submission.id}
                  />
                  <p className="min-w-0 flex-1 truncate text-muted-foreground">
                    Submitted by {submission.submitter.riotIdGameName}#
                    {submission.submitter.riotIdTagline}
                  </p>
                  <Button
                    type="submit"
                    name="decision"
                    value="REJECT"
                    size="sm"
                    variant="destructive"
                    className="font-oswald font-semibold uppercase"
                  >
                    Reject
                  </Button>
                  <Button
                    type="submit"
                    name="decision"
                    value="APPROVE"
                    size="sm"
                    disabled={!match.success}
                    className="font-oswald font-semibold uppercase"
                  >
                    Approve
                  </Button>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
