import { SignIn } from "@/components/sign-in"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Page() {
  const user = await currentUser()

  if (user) {
    redirect("/")
  }

  return (
    <main className="grid h-dvh place-items-center bg-secondary">
      <div className="rounded-md border bg-background p-4">
        <SignIn />
      </div>
    </main>
  )
}
