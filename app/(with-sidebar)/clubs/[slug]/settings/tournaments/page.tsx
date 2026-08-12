import { FaPlus } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { db } from "@/lib/db"
import { clubs } from "@/lib/schema"

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
      <Button size="lg" className="font-oswald font-semibold uppercase">
        <FaPlus className="size-3" />
        <span>Create New Tournament</span>
      </Button>

      {tournaments.length === 0 ? (
        <p className="text-chart-11 mt-4 text-sm">
          No tournaments found. Create a new tournament to get started.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {tournaments.map((tournament) => (
            <li key={tournament.id}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start font-oswald font-semibold uppercase"
              >
                {tournament.name}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
