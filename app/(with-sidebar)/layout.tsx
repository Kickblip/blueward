import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SearchButton } from "@/components/search"
import { DailyReward } from "@/components/daily-reward"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { players } from "@/lib/schema"
import { Footer } from "@/components/footer"
import { AdSlot } from "@/components/ad-slot"
import { UserBalance } from "@/components/user-balance"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await currentUser()

  let claimed = false
  if (user) {
    const player = user.id
      ? await db.query.players.findFirst({
          where: eq(players.authId, user.id),
          columns: { lastDailyClaimDate: true },
        })
      : null

    const today = new Date().toISOString().slice(0, 10)
    claimed = player?.lastDailyClaimDate === today
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" variant="secondary" />
            {user && <DailyReward claimed={claimed} />}
          </div>
          <div className="flex items-center gap-2 px-4">
            {user && <UserBalance />}
            <SearchButton />
          </div>
        </header>

        <div className="z-10 flex w-full gap-4 p-4">
          <AdSlot
            name="left-rail"
            className="hidden h-[600px] w-[160px] shrink-0 2xl:grid"
          />

          <main className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col">
            {children}
          </main>

          <AdSlot
            name="right-rail"
            className="hidden h-[600px] w-[160px] shrink-0 2xl:grid"
          />
        </div>

        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
