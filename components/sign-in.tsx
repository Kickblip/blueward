"use client"

import Link from "next/link"
import { SiRiotgames } from "react-icons/si"
import { FaDiscord } from "react-icons/fa6"
import { Button } from "./ui/button"
import { useSignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Input } from "./ui/input"
import { Field } from "./ui/field"
import { IoMdMail } from "react-icons/io"

export function SignIn() {
  const { signIn, fetchStatus } = useSignIn()
  const searchParams = useSearchParams()

  const signInWithRiot = async () => {
    const next = searchParams.get("redirect_url") ?? "/"
    const callbackUrl = `/sso-callback?next=${encodeURIComponent(next)}`

    const { error: resetError } = await signIn.reset()

    if (resetError) {
      console.error(resetError)
      return
    }

    const { error } = await signIn.sso({
      strategy: "oauth_custom_riot_games",
      redirectUrl: `/claim-riot?next=${encodeURIComponent(next)}`,
      redirectCallbackUrl: callbackUrl,
    })

    if (error) {
      console.error(error)
      return
    }

    if (signIn.isTransferable) {
      window.location.assign(callbackUrl)
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

      <form className="w-full">
        <Field>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="example@gmail.com"
          />
        </Field>
        <Button
          type="submit"
          className="w-full font-oswald font-semibold uppercase"
          size="lg"
        >
          <IoMdMail />
          <span>Continue with Email</span>
        </Button>
      </form>

      <div className="flex w-full items-center gap-3 font-oswald text-xs font-semibold text-muted-foreground uppercase before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        Or sign in with
      </div>

      <Button
        type="button"
        onClick={signInWithRiot}
        disabled={fetchStatus === "fetching"}
        size="lg"
        className="relative w-full bg-[#D13639] font-oswald font-semibold text-white uppercase hover:bg-[#D13639]/90"
      >
        <span className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-yellow-950 shadow">
          Last Used
        </span>

        <SiRiotgames className="size-4.5" />
        <span>Riot</span>
      </Button>

      <Button
        type="button"
        onClick={signInWithRiot}
        disabled={fetchStatus === "fetching"}
        size="lg"
        className="w-full bg-[#7289DA] font-oswald font-semibold text-white uppercase hover:bg-[#7289DA]/90"
      >
        <FaDiscord className="size-4.5" />
        <span>Discord</span>
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
