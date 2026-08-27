import { eq } from "drizzle-orm"
import { EllipsisIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { FaShield, FaTrash, FaUser } from "react-icons/fa6"
import { PiCrownSimpleFill } from "react-icons/pi"
import { makeOwner, promoteToAdmin, removeMember } from "./actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${name}`}
                          >
                            <EllipsisIcon />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          <form
                            action={promoteToAdmin.bind(
                              null,
                              slug,
                              member.playerId
                            )}
                            method="post"
                          >
                            <DropdownMenuItem asChild>
                              <button
                                type="submit"
                                className="w-full cursor-pointer font-oswald font-semibold uppercase"
                              >
                                <FaShield className="size-3 text-chart-3 dark:text-chart-1" />
                                Promote to Admin
                              </button>
                            </DropdownMenuItem>
                          </form>

                          <form
                            action={makeOwner.bind(null, slug, member.playerId)}
                            method="post"
                          >
                            <DropdownMenuItem asChild>
                              <button
                                type="submit"
                                className="w-full cursor-pointer font-oswald font-semibold uppercase"
                              >
                                <PiCrownSimpleFill className="size-3 text-chart-3 dark:text-chart-1" />
                                Make Owner
                              </button>
                            </DropdownMenuItem>
                          </form>

                          <form
                            action={removeMember.bind(
                              null,
                              slug,
                              member.playerId
                            )}
                            method="post"
                          >
                            <DropdownMenuItem asChild>
                              <button
                                type="submit"
                                className="w-full cursor-pointer font-oswald font-semibold uppercase"
                              >
                                <FaTrash className="size-3 text-chart-3 dark:text-chart-1" />
                                Remove
                              </button>
                            </DropdownMenuItem>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
