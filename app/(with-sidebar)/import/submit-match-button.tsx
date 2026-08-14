"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SubmitMatchButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="font-oswald font-semibold uppercase"
    >
      {pending ? <Spinner /> : "Submit for approval"}
    </Button>
  )
}
