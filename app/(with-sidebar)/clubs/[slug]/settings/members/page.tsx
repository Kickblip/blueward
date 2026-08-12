import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { db } from "@/lib/db"
import { clubs } from "@/lib/schema"

import { columns } from "./columns"
import { DataTable } from "./data-table"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
    with: {
      members: {
        columns: {
          playerId: true,
          role: true,
        },
        with: {
          player: {
            columns: {
              riotIdGameName: true,
              riotIdTagline: true,
            },
          },
        },
      },
    },
  })

  if (!club) notFound()

  const data = club.members.map(({ playerId, role, player }) => ({
    id: playerId,
    name: `${player.riotIdGameName}#${player.riotIdTagline}`,
    role,
  }))

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
