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
import { Show } from "@clerk/nextjs"

export default async function Page() {
  const clubs = await fetchClubs()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUsers className="size-6 text-chart-3 dark:text-chart-1" />
          <h1 className="font-oswald text-2xl font-semibold uppercase">
            Clubs
          </h1>
        </div>
        <Show when="signed-in">
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
                          htmlFor="new-club-name"
                          className="font-oswald font-semibold uppercase"
                        >
                          Name
                        </FieldLabel>
                        <Input
                          id="new-club-name"
                          name="name"
                          placeholder="SK Telecom"
                          required
                          minLength={2}
                          maxLength={64}
                        />
                      </Field>

                      <Field>
                        <FieldLabel
                          htmlFor="new-club-tag"
                          className="font-oswald font-semibold uppercase"
                        >
                          Tag
                        </FieldLabel>
                        <Input
                          id="new-club-tag"
                          name="tag"
                          placeholder="SKT"
                          required
                          minLength={1}
                          maxLength={6}
                          pattern="[A-Za-z0-9]{1,6}"
                          className="uppercase"
                        />
                        <FieldDescription>
                          Displayed on member profiles
                        </FieldDescription>
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
        </Show>
      </div>

      <div className="mt-4 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3">
        {clubs.map((club) => (
          <div key={club.id} className="group relative isolate grid">
            <Link
              href={`/clubs/${club.slug}`}
              aria-label={club.name}
              className="absolute inset-0 z-10 rounded-md"
            />
            <ClubInfoCard club={club} />
          </div>
        ))}
      </div>
    </div>
  )
}
