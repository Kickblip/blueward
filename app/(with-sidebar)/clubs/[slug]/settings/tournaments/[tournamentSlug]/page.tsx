import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default async function Page({
  params,
}: {
  params: Promise<{
    slug: string
    tournamentSlug: string
  }>
}) {
  const { slug, tournamentSlug } = await params

  const teams = [
    {
      id: "1",
      name: "Team 1",
    },
    {
      id: "2",
      name: "Team 2",
    },
  ]

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="font-semibold">Participants</h2>
            <p className="text-sm text-muted-foreground">
              Manage tournament participants.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Add participant</Button>
            </DialogTrigger>

            <DialogContent>{/* Participant name form */}</DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>

                <TableCell>
                  <DropdownMenu>{/* Rename and Remove actions */}</DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
