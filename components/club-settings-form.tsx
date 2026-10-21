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
import type { clubs } from "@/lib/schema"
import { toast } from "sonner"
import { discordInviteLinkToCode } from "@/lib/utils"

export function ClubSettingsForm({
  club,
}: {
  club: typeof clubs.$inferSelect
}) {
  async function updateClub(formData: FormData) {
    const response = await fetch(`/api/clubs/${club.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    })

    const data = await response.json()
    if (!response.ok) {
      toast.error(data.error ?? "Failed to update club.")
      return
    }

    window.location.assign(`/clubs/${data.club.slug}`)
  }

  return (
    <form action={updateClub}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="club-name">Club Name</FieldLabel>
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
          <FieldLabel htmlFor="club-tag">Club Name</FieldLabel>
          <Input id="club-tag" name="tag" defaultValue={club.tag} />
        </Field>

        <Field>
          <FieldLabel htmlFor="club-discord">Discord invite</FieldLabel>

          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://discord.gg/</InputGroupText>
            </InputGroupAddon>

            <InputGroupInput
              id="club-discord"
              name="discordInvite"
              placeholder="Invite code or link"
              defaultValue={discordInviteLinkToCode(club.discordInvite ?? "")}
              onChange={(event) => {
                event.currentTarget.value = discordInviteLinkToCode(
                  event.currentTarget.value
                )
              }}
            />
          </InputGroup>
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
