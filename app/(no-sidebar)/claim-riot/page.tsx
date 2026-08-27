import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ClaimRiotClient } from "./claim-riot-client"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  const destination =
    typeof next === "string" && /^\/(?![\\/])/.test(next) ? next : "/"

  const user = await currentUser()

  if (typeof user?.privateMetadata.puuid === "string") {
    redirect(destination)
  }

  return <ClaimRiotClient destination={destination} />
}
