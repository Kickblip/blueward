"use client"

import { useReverification, useUser } from "@clerk/nextjs"
import type {
  ExternalAccountResource,
  OAuthStrategy,
} from "@clerk/nextjs/types"
import { useState } from "react"
import { FaDiscord } from "react-icons/fa6"
import { SiRiotgames } from "react-icons/si"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import { FaLink, FaUnlink } from "react-icons/fa"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

const connections = [
  {
    name: "Discord",
    strategy: "oauth_discord",
    provider: "discord",
    Icon: FaDiscord,
  },
  {
    name: "Riot",
    strategy: "oauth_custom_riot_games",
    provider: "custom_riot_games",
    Icon: SiRiotgames,
  },
] as const

export function SSOSettingsForm() {
  const { isLoaded, user } = useUser()
  const [pending, setPending] = useState<string | null>(null)

  const createExternalAccount = useReverification(
    (connection: (typeof connections)[number]) =>
      user?.createExternalAccount({
        strategy: connection.strategy,
        redirectUrl:
          connection.provider === "custom_riot_games"
            ? "/claim-riot?next=/settings"
            : "/settings",
      })
  )

  const destroyExternalAccount = useReverification(
    (account: ExternalAccountResource) => account.destroy()
  )

  if (!isLoaded || !user) return null

  async function connect(connection: (typeof connections)[number]) {
    setPending(connection.provider)

    try {
      const account = await createExternalAccount(connection)
      const redirectUrl = account?.verification?.externalVerificationRedirectURL

      if (!redirectUrl) {
        throw new Error("Clerk did not return an OAuth redirect URL.")
      }

      window.location.assign(redirectUrl.href)
    } catch {
      setPending(null)
      toast.error(`Could not connect ${connection.name}`, {
        position: "top-center",
      })
    }
  }

  async function disconnect(
    connection: (typeof connections)[number],
    account: ExternalAccountResource
  ) {
    if (!window.confirm(`Disconnect your ${connection.name} account?`)) return

    setPending(connection.provider)

    try {
      await destroyExternalAccount(account)
      toast.success(`${connection.name} disconnected`, {
        position: "top-center",
      })
    } catch {
      toast.error(`Could not disconnect ${connection.name}`, {
        position: "top-center",
      })
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {connections.map((connection) => {
        const account = user.externalAccounts.find(
          ({ provider }) => provider === connection.provider
        )
        const isPending = pending === connection.provider

        return (
          <div
            key={connection.provider}
            className="flex items-center justify-between gap-3 rounded-md border p-4"
          >
            <div className="flex items-center gap-2">
              <connection.Icon className="size-5 shrink-0" />

              <p className="font-oswald font-semibold uppercase">
                {connection.name}
              </p>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={account ? "destructive" : "default"}
                  disabled={pending !== null}
                  onClick={() =>
                    account
                      ? disconnect(connection, account)
                      : connect(connection)
                  }
                >
                  {isPending ? (
                    <Spinner />
                  ) : account ? (
                    <FaUnlink />
                  ) : (
                    <FaLink />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPending
                  ? "Connecting..."
                  : account
                    ? "Disconnect"
                    : "Connect"}
              </TooltipContent>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}
