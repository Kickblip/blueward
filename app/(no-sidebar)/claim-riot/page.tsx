import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ClaimRiotClient } from "./claim-riot-client"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next = "/" } = await searchParams
  const destination =
    next.startsWith("/") && !next.startsWith("//") ? next : "/"

  const user = await currentUser()

  if (!user) {
    redirect(`/signin?redirect_url=${encodeURIComponent(destination)}`)
  }

  if (typeof user.privateMetadata.puuid === "string") {
    redirect(destination)
  }

  return <ClaimRiotClient destination={destination} />
}
