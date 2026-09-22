import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusIcon } from "lucide-react"
import { FaUsers } from "react-icons/fa"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { createClub, fetchClubs } from "./actions"
import Link from "next/link"
import { ClubInfoCard } from "@/components/club-info-card"

export default async function Page() {
  const clubs = await fetchClubs()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUsers className="size-6 text-chart-3 dark:text-chart-1" />
          <h1 className="font-oswald text-2xl font-semibold uppercase">
            Clubs
          </h1>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="gap-1 px-4 font-oswald font-semibold uppercase"
            >
              <PlusIcon className="size-4" />
              Create new club
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={createClub}>
              <FieldGroup>
                <FieldSet>
                  <FieldLegend className="font-oswald font-semibold uppercase">
                    Create a new Blueward club
                  </FieldLegend>
                  <FieldDescription>
                    Create a new club to manage members and track statistics
                    within your club.
                  </FieldDescription>
                  <FieldGroup>
                    <Field>
                      <FieldLabel
                        htmlFor="club-name"
                        className="font-oswald font-semibold uppercase"
                      >
                        Name
                      </FieldLabel>
                      <Input
                        id="club-name"
                        name="name"
                        placeholder="My Club"
                        required
                        minLength={2}
                        maxLength={64}
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <Button
                  type="submit"
                  className="font-oswald font-semibold uppercase"
                >
                  Create club
                </Button>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clubs.map((club) => (
          <Link key={club.id} href={`/clubs/${club.slug}`} className="group">
            <ClubInfoCard club={club} />
          </Link>
        ))}
      </div>
    </div>
  )
}
