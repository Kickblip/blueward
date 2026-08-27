"use client"

import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs"
import { useEffect, useRef, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { autoClaimRiotProfile } from "./actions"

export function ClaimRiotClient({ destination }: { destination: string }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const started = useRef(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!isLoaded || started.current) return
    started.current = true

    void (async () => {
      const claimUrl = `/claim-riot?next=${encodeURIComponent(destination)}`

      const finalize = async () => {
        if (signIn.status === "complete") {
          const { error } = await signIn.finalize({
            navigate: ({ decorateUrl }) => {
              window.location.replace(decorateUrl(claimUrl))
            },
          })

          if (error) throw error
          return true
        }

        if (signUp.status === "complete") {
          const { error } = await signUp.finalize({
            navigate: ({ decorateUrl }) => {
              window.location.replace(decorateUrl(claimUrl))
            },
          })

          if (error) throw error
          return true
        }

        return false
      }

      try {
        if (!isSignedIn) {
          if (await finalize()) return

          if (signUp.isTransferable) {
            const { error } = await signIn.create({ transfer: true })
            if (error) throw error
            if (await finalize()) return
          }

          if (signIn.isTransferable) {
            const { error } = await signUp.create({ transfer: true })
            if (error) throw error
            if (await finalize()) return
          }

          window.location.replace(
            `/signin?redirect_url=${encodeURIComponent(destination)}`
          )
          return
        }

        const result = await autoClaimRiotProfile()

        if (!result.ok) {
          setError(result.message)
          return
        }

        window.location.replace(destination)
      } catch (error) {
        console.error(error)
        setError("Could not claim your Riot profile.")
      }
    })()
  }, [destination, isLoaded, isSignedIn, signIn, signUp])

  return (
    <div className="grid min-h-screen w-full place-items-center">
      {error ? (
        <p role="alert" className="text-center text-red-500">
          {error}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <p className="font-oswald font-semibold uppercase">
            Claiming your profile... Do not close this window
          </p>
          <p className="text-sm text-muted-foreground">
            This may take a few moments
          </p>
          <div id="clerk-captcha" />
        </div>
      )}
    </div>
  )
}
