import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SearchButton } from "@/components/search"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
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
