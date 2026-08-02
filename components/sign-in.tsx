"use client"

import Link from "next/link"
import { SiRiotgames } from "react-icons/si"
import { Button } from "./ui/button"
import { useSignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Field } from "./ui/field"
import { Input } from "./ui/input"
import { IoMdMail } from "react-icons/io"

export function SignIn() {
  const { signIn, fetchStatus } = useSignIn()
  const searchParams = useSearchParams()

  const signInWithRiot = async () => {
    const next = searchParams.get("redirect_url") ?? "/"
    const claimUrl = `/claim-riot?next=${encodeURIComponent(next)}`

    const { error: resetError } = await signIn.reset()

    if (resetError) {
      console.error(resetError)
      return
    }

    const { error } = await signIn.sso({
      strategy: "oauth_custom_riot_games",
      redirectUrl: claimUrl,
      redirectCallbackUrl: claimUrl,
    })

    if (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-oswald text-lg font-semibold uppercase">
          Sign in to Blueward
        </span>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Select a method to continue
        </p>
      </div>

      <div className="flex w-full items-center gap-3 font-oswald text-xs font-semibold text-muted-foreground uppercase before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        Or sign in with
      </div>

      <Button
        type="button"
        onClick={signInWithRiot}
        disabled={fetchStatus === "fetching"}
        size="lg"
        className="w-full bg-[#D13639] font-oswald font-semibold text-white uppercase hover:bg-[#D13639]/90"
      >
        <SiRiotgames className="size-4.5" />
        <span>Riot</span>
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        The sign in system has been changed! If you encounter issues with your
        account please contact @kickball on Discord
      </p>

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>By continuing you agree to our</span>
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>
        <span>and</span>
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
