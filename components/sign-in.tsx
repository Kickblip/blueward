"use client"

import Link from "next/link"
import { SiRiotgames } from "react-icons/si"
import { Button } from "./ui/button"
import { useSignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"

export function SignIn() {
  const { signIn, fetchStatus } = useSignIn()
  const searchParams = useSearchParams()

  const signInWithRiot = async () => {
    const redirectUrl = searchParams.get("redirect_url") ?? "/"

    const { error } = await signIn.sso({
      strategy: "oauth_custom_riot_games",
      redirectUrl,
      redirectCallbackUrl: "/sso-callback",
    })

    if (error) console.error(error)
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-oswald text-lg font-semibold uppercase">
          Sign in to Blueward
        </span>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Use your Riot account to continue
        </p>
      </div>

      <Button
        type="button"
        onClick={signInWithRiot}
        disabled={fetchStatus === "fetching"}
        size="lg"
        className="w-full bg-[#D13639] font-oswald font-semibold text-white uppercase hover:bg-[#D13639]/90"
      >
        <SiRiotgames className="size-4.5" />
        <span>Continue with Riot</span>
      </Button>

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
