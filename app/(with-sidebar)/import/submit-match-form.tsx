"use client"

import { useActionState, type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { XIcon } from "lucide-react"

type SubmitMatchState = {
  error?: string
}

type SubmitMatchAction = (
  previousState: SubmitMatchState,
  formData: FormData
) => Promise<SubmitMatchState>

export function SubmitMatchForm({
  submitAction,
  children,
}: {
  submitAction: SubmitMatchAction
  children: ReactNode
}) {
  const [state, formAction] = useActionState(submitAction, {})

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      {state.error && (
        <Card className="flex-row items-start gap-3 lg:col-span-2">
          <XIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-oswald font-semibold uppercase">Error Occured</p>
            <p className="text-sm">{state.error}</p>
          </div>
        </Card>
      )}

      {children}
    </form>
  )
}
