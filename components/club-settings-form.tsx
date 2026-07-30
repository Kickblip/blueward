"use client"

import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ClubSettingsFormProps = {
  club: {
    id: number
    name: string
    slug: string
    bio: string | null
  }
}

export function ClubSettingsForm({ club }: ClubSettingsFormProps) {
  async function updateClub(formData: FormData) {
    const response = await fetch(`/api/clubs/${club.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    })

    const { club: updatedClub } = await response.json()

    window.location.assign(`/clubs/${updatedClub.slug}`)
  }

  return (
    <form action={updateClub}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="club-name">Club name</FieldLabel>
          <Input id="club-name" name="name" defaultValue={club.name} />
        </Field>

        <Field>
          <FieldLabel htmlFor="club-slug">Slug</FieldLabel>

          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://blueward.lol/clubs/</InputGroupText>
            </InputGroupAddon>

            <InputGroupInput
              id="club-slug"
              name="slug"
              defaultValue={club.slug}
            />
          </InputGroup>

          <FieldDescription>
            URL slugs can only contain letters, numbers, and hyphens.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="club-bio">Bio</FieldLabel>
          <Textarea
            id="club-bio"
            name="bio"
            rows={5}
            defaultValue={club.bio ?? ""}
          />
        </Field>

        <Button type="submit">Save changes</Button>
      </FieldGroup>
    </form>
  )
}
