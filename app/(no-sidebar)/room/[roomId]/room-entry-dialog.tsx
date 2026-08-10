"use client"

import { useActionState, useState } from "react"
import { SignIn } from "@/components/sign-in"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { continueAsGuest } from "./actions"
import { Spinner } from "@/components/ui/spinner"

export function RoomEntryDialog({ roomId }: { roomId: string }) {
  const [mode, setMode] = useState<"sign-in" | "guest">("sign-in")
  const [state, formAction, pending] = useActionState(continueAsGuest, {})

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        {mode === "guest" && (
          <DialogHeader>
            <DialogTitle className="text-center">
              Fill in some additional information
            </DialogTitle>
          </DialogHeader>
        )}

        {mode === "sign-in" ? (
          <div className="flex flex-col gap-4">
            <SignIn redirectUrl={`/room/${roomId}`} />

            <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              Or
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-oswald font-semibold uppercase"
              onClick={() => setMode("guest")}
            >
              Continue as guest
            </Button>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="roomId" value={roomId} />

            <Field data-invalid={Boolean(state.error)}>
              <FieldLabel htmlFor="guest-display-name">Display name</FieldLabel>

              <Input
                id="guest-display-name"
                name="displayName"
                autoComplete="nickname"
                placeholder="Required"
                minLength={1}
                maxLength={32}
                required
                autoFocus
                aria-invalid={Boolean(state.error)}
              />
              <FieldError>{state.error}</FieldError>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("sign-in")}
              >
                Back
              </Button>

              <Button type="submit" disabled={pending}>
                {pending ? <Spinner /> : "Join lobby"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
