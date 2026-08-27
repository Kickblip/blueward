import { SignIn } from "@/components/sign-in"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>
}) {
  const { redirect_url } = await searchParams
  const destination =
    typeof redirect_url === "string" && /^\/(?![\\/])/.test(redirect_url)
      ? redirect_url
      : "/"

  const user = await currentUser()

  if (user) {
    const claimed = typeof user.privateMetadata.puuid === "string"

    redirect(
      claimed
        ? destination
        : `/claim-riot?next=${encodeURIComponent(destination)}`
    )
  }

  return (
    <main className="grid h-dvh place-items-center bg-secondary">
      <div className="rounded-md border bg-background p-4">
        <SignIn redirectUrl={destination} />
      </div>
    </main>
  )
}
