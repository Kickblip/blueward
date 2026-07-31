"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, type ChangeEvent, type SubmitEvent } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "./ui/button"
import { FaPencil } from "react-icons/fa6"
import { Field, FieldLabel } from "./ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group"
import { Skeleton } from "./ui/skeleton"
import { useReverification, useUser } from "@clerk/nextjs"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { isReverificationCancelledError } from "@clerk/nextjs/errors"

export function ProfileSettingsForm() {
  const { user } = useUser()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [savingUsername, setSavingUsername] = useState(false)
  const updateUsername = useReverification((username: string | null) =>
    user?.update({ username })
  )

  if (!user) return null

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file || !user) return

    setUploading(true)

    try {
      await user.setProfileImage({ file })
      router.refresh()
      toast.success("Profile picture updated", {
        position: "top-center",
      })
    } catch {
      toast.error("Error updating profile picture", {
        position: "top-center",
      })
    } finally {
      setUploading(false)
      input.value = ""
    }
  }

  async function handleUsernameSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) return

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get("username") ?? "").trim()

    setSavingUsername(true)

    try {
      await updateUsername(username || null)

      toast.success("Username updated", {
        position: "top-center",
      })
    } catch (error) {
      if (!isReverificationCancelledError(error)) {
        toast.error("Error updating username", {
          position: "top-center",
        })
      }
    } finally {
      setSavingUsername(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-20">
          <AvatarImage src={user.imageUrl} alt="Your profile picture" />
          <AvatarFallback>
            <Skeleton className="h-20 w-20 rounded-full" />
          </AvatarFallback>
        </Avatar>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Change profile picture"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-0 bottom-0 size-7 translate-x-1/4 translate-y-1/4 rounded-full shadow-md"
            >
              {uploading ? (
                <Spinner />
              ) : (
                <FaPencil className="size-3.5 text-chart-3 dark:text-chart-1" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Up to 2 MB</TooltipContent>
        </Tooltip>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
      <form onSubmit={handleUsernameSave} className="min-w-0 flex-1">
        <Field className="gap-2">
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <InputGroup>
            <InputGroupInput
              name="username"
              id="username"
              autoComplete="username"
              defaultValue={user.username ?? ""}
              placeholder="Optional"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                type="submit"
                className="px-2 font-oswald text-xs font-semibold uppercase"
                disabled={savingUsername}
              >
                {savingUsername ? <Spinner /> : "Save username"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </form>
    </div>
  )
}
