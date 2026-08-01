"use client"

import Link from "next/link"
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

function getNext() {
  return new URLSearchParams(window.location.search).get("next") ?? "/"
}

function getClaimUrl() {
  return `/claim-riot?next=${encodeURIComponent(getNext())}`
}

export default function Page() {
  const clerk = useClerk()
  const {
    signIn,
    errors: signInErrors,
    fetchStatus: signInFetchStatus,
  } = useSignIn()
  const {
    signUp,
    errors: signUpErrors,
    fetchStatus: signUpFetchStatus,
  } = useSignUp()

  const started = useRef(false)

  const [processingCallback, setProcessingCallback] = useState(true)
  const [callbackError, setCallbackError] = useState<string>()
  const [emailAddress, setEmailAddress] = useState("")
  const [code, setCode] = useState("")

  const isFetching =
    signInFetchStatus === "fetching" || signUpFetchStatus === "fetching"

  async function finalizeSignUp() {
    const { error } = await signUp.finalize({
      navigate: async ({ decorateUrl }) => {
        window.location.href = decorateUrl(getClaimUrl())
      },
    })

    if (error) {
      setCallbackError(error.longMessage ?? error.message)
    }
  }

  useEffect(() => {
    if (!clerk.loaded || started.current) return
    started.current = true

    void (async () => {
      try {
        /*
         * Normally a completed OAuth sign-in uses redirectUrl and skips this
         * page, but handling it here makes the callback resilient.
         */
        if (signIn.status === "complete") {
          const { error } = await signIn.finalize({
            navigate: async ({ decorateUrl }) => {
              window.location.href = decorateUrl(getClaimUrl())
            },
          })

          if (error) throw error
          return
        }

        /*
         * A signup that found an existing user must transfer back to sign-in.
         */
        if (signUp.isTransferable) {
          const { error } = await signIn.create({ transfer: true })

          if (error) throw error

          if (signIn.status === "complete") {
            const { error } = await signIn.finalize({
              navigate: async ({ decorateUrl }) => {
                window.location.href = decorateUrl(getClaimUrl())
              },
            })

            if (error) throw error
            return
          }
        }

        /*
         * Riot authenticated successfully, but no Clerk user exists.
         * Transfer the pending sign-in into a signup.
         */
        if (signIn.isTransferable) {
          const { error } = await signUp.create({ transfer: true })

          if (error) throw error
        }

        if (signUp.status === "complete") {
          const { error } = await signUp.finalize({
            navigate: async ({ decorateUrl }) => {
              window.location.href = decorateUrl(getClaimUrl())
            },
          })

          if (error) throw error
          return
        }

        /*
         * The transferred signup needs additional information. Stop showing
         * the spinner and render the appropriate form below.
         */
        if (signUp.status === "missing_requirements") {
          setProcessingCallback(false)
          return
        }

        /*
         * Handle an OAuth account already attached to another active session.
         */
        const existingSessionId =
          signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId

        if (existingSessionId) {
          await clerk.setActive({
            session: existingSessionId,
            navigate: async ({ decorateUrl }) => {
              window.location.href = decorateUrl(getClaimUrl())
            },
          })

          return
        }

        throw new Error(`Unexpected sign-in status: ${signIn.status}`)
      } catch (error) {
        setCallbackError(
          error instanceof Error ? error.message : "Could not complete sign-in."
        )
        setProcessingCallback(false)
      }
    })()
  }, [clerk, signIn, signUp])

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { error } = await signUp.update({
      emailAddress: emailAddress.trim(),
    })

    if (error) return

    if (signUp.status === "complete") {
      await finalizeSignUp()
      return
    }

    if (signUp.unverifiedFields.includes("email_address")) {
      await signUp.verifications.sendEmailCode()
    }
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    })

    if (error) return

    if (signUp.status === "complete") {
      await finalizeSignUp()
    }
  }

  const globalError =
    callbackError ??
    signUpErrors.global?.[0]?.longMessage ??
    signUpErrors.global?.[0]?.message ??
    signInErrors.global?.[0]?.longMessage ??
    signInErrors.global?.[0]?.message

  const needsEmail = signUp.missingFields.includes("email_address")
  const needsEmailVerification =
    signUp.unverifiedFields.includes("email_address")

  const unsupportedFields = signUp.missingFields.filter(
    (field) => field !== "email_address" && field !== "protect_check"
  )

  if (processingCallback) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Spinner />
        <div id="clerk-captcha" />
      </main>
    )
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-secondary">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-md border bg-background p-4">
        <div>
          <h1 className="font-oswald text-lg font-semibold uppercase">
            Finish creating your account
          </h1>

          <p className="text-sm text-muted-foreground">
            Complete the remaining information to continue.
          </p>
        </div>

        {globalError && (
          <p role="alert" className="text-sm text-destructive">
            {globalError}
          </p>
        )}

        {needsEmailVerification ? (
          <form className="flex flex-col gap-3" onSubmit={verifyEmail}>
            <Input
              required
              name="code"
              value={code}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Verification code"
              onChange={(event) => setCode(event.target.value)}
            />

            {signUpErrors.fields.code && (
              <p className="text-sm text-destructive">
                {signUpErrors.fields.code.message}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isFetching || !code.trim()}
              className="font-oswald font-semibold uppercase"
            >
              {isFetching && <Spinner />}
              Verify email
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isFetching}
              onClick={() => signUp.verifications.sendEmailCode()}
            >
              Send another code
            </Button>
          </form>
        ) : needsEmail ? (
          <form className="flex flex-col gap-3" onSubmit={submitEmail}>
            <Input
              required
              type="email"
              name="email"
              value={emailAddress}
              autoComplete="email"
              placeholder="Email address"
              onChange={(event) => setEmailAddress(event.target.value)}
            />

            {signUpErrors.fields.emailAddress && (
              <p className="text-sm text-destructive">
                {signUpErrors.fields.emailAddress.message}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isFetching || !emailAddress.trim()}
              className="font-oswald font-semibold uppercase"
            >
              {isFetching && <Spinner />}
              Continue
            </Button>
          </form>
        ) : unsupportedFields.length > 0 ? (
          <p className="text-sm text-destructive">
            This signup requires additional fields:{" "}
            {unsupportedFields.join(", ")}
          </p>
        ) : (
          <Spinner />
        )}

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>

        <div id="clerk-captcha" />
      </div>
    </main>
  )
}
