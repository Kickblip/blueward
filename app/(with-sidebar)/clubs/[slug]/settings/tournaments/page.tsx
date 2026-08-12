import { Button } from "@/components/ui/button"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { db } from "@/lib/db"
import { clubs } from "@/lib/schema"
import { NewTournamentForm } from "./new-tournament-form"
import Link from "next/link"

export default async function Page({
  params,
}: {
  params: Promise<{
    slug: string
  }>
}) {
  const { slug } = await params

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
    columns: {
      id: true,
    },
    with: {
      tournaments: true,
    },
  })

  if (!club) notFound()

  const tournaments = club.tournaments

  return (
    <div className="flex flex-col">
      <NewTournamentForm clubId={club.id} />

      {tournaments.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2">
          <p className="font-oswald text-lg font-semibold uppercase">
            No tournaments
          </p>
          <p className="text-sm text-muted-foreground">
            Create a new tournament to get started
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {tournaments.map((tournament) => (
            <li key={tournament.id}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start font-oswald font-semibold uppercase"
                asChild
              >
                <Link
                  href={`/clubs/${slug}/settings/tournaments/${tournament.slug}`}
                >
                  {tournament.name}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
