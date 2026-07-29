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
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {user && <DailyReward claimed={claimed} />}
          </div>
          <div className="flex items-center gap-2 px-4">
            <SearchButton />
          </div>
        </header>
        <main className="z-10 mx-auto flex w-full max-w-7xl flex-col p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
