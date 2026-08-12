"use client"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { type SubmitEvent, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FaPlus } from "react-icons/fa"

export function NewTournamentForm({ clubId }: { clubId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const response = await fetch(`/api/clubs/${clubId}/tournaments`, {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        slug: formData.get("slug"),
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      toast.error("Failed to create tournament", { position: "top-center" })
      return
    }

    form.reset()
    router.refresh()
    setIsOpen(false)
    toast.success("Tournament created", { position: "top-center" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="font-oswald font-semibold uppercase">
          <FaPlus className="size-3" />
          <span>Create New Tournament</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-oswald text-lg font-semibold uppercase">
            Create New Tournament
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Tournament Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={128}
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="slug">URL</FieldLabel>

              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>blueward.lol/tournament/</InputGroupText>
                </InputGroupAddon>

                <InputGroupInput
                  id="slug"
                  name="slug"
                  required
                  maxLength={64}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                />
              </InputGroup>

              <FieldDescription>
                URL slugs can only contain letters, numbers, and hyphens.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button type="submit" className="font-oswald font-semibold uppercase">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
