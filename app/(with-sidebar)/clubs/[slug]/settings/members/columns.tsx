"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-features"

import { EllipsisIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaShield, FaUser } from "react-icons/fa6"
import { PiCrownSimpleFill } from "react-icons/pi"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = {
  id: number
  name: string
  role: "OWNER" | "ADMIN" | "MEMBER"
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Member>()

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => {
      return (
        <span className="font-oswald text-xs font-semibold uppercase">
          {row.original.name}
        </span>
      )
    },
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: ({ row }) => {
      switch (row.original.role) {
        case "OWNER":
          return (
            <span className="flex items-center gap-1">
              <PiCrownSimpleFill className="size-4 text-yellow-500" />
              <span className="font-oswald text-xs font-semibold text-yellow-500 uppercase">
                Owner
              </span>
            </span>
          )

        case "ADMIN":
          return (
            <span className="flex items-center gap-1">
              <FaShield className="size-4 text-rose-500" />
              <span className="font-oswald text-xs font-semibold text-rose-500 uppercase">
                Admin
              </span>
            </span>
          )

        default:
          return (
            <span className="flex items-center gap-1">
              <FaUser className="size-4 text-blue-500" />
              <span className="font-oswald text-xs font-semibold text-blue-500 uppercase">
                Member
              </span>
            </span>
          )
      }
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const member = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${member.name}`}
              >
                <EllipsisIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem>Change role</DropdownMenuItem>

              <DropdownMenuItem variant="destructive">
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  }),
])
