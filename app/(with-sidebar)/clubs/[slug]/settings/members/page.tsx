import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { FaShield, FaUser } from "react-icons/fa6"
import { PiCrownSimpleFill } from "react-icons/pi"
import { MemberActions } from "./member-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { clubs } from "@/lib/schema"

const roleDisplay = {
  OWNER: {
    label: "Owner",
    icon: PiCrownSimpleFill,
    className: "text-yellow-500",
  },
  ADMIN: {
    label: "Admin",
    icon: FaShield,
    className: "text-rose-500",
  },
  MEMBER: {
    label: "Member",
    icon: FaUser,
    className: "text-blue-500",
  },
} as const

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { userId } = await auth()

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
              authId: true,
              riotIdGameName: true,
              riotIdTagline: true,
            },
          },
        },
      },
    },
  })

  if (!club) notFound()

  const currentMember = userId
    ? club.members.find((member) => member.player.authId === userId)
    : undefined

  return (
    <div className="container mx-auto py-10">
      <div className="overflow-hidden rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {club.members.map((member) => {
              const name = `${member.player.riotIdGameName}#${member.player.riotIdTagline}`
              const role = roleDisplay[member.role]
              const RoleIcon = role.icon

              return (
                <TableRow key={member.playerId}>
                  <TableCell>
                    <span className="font-oswald text-xs font-semibold uppercase">
                      {name}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`flex items-center gap-1 ${role.className}`}
                    >
                      <RoleIcon className="size-4" />
                      <span className="font-oswald text-xs font-semibold uppercase">
                        {role.label}
                      </span>
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex min-h-8 items-center justify-end">
                      <MemberActions
                        slug={slug}
                        playerId={member.playerId}
                        name={name}
                        role={member.role}
                        currentMemberRole={currentMember?.role}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {club.members.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No members.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
