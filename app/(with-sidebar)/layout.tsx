import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        // className="min-w-0"
        // style={{
        //   backgroundImage: 'url("/grid.svg")',
        //   backgroundRepeat: "repeat",
        //   backgroundSize: "512px 512px",
        // }}
        className="relative min-w-0 before:pointer-events-none before:absolute before:inset-0 before:bg-foreground before:[mask-image:url('/grid.svg')] before:[mask-size:512px_512px] before:[mask-repeat:repeat] before:content-['']"
      >
        <header className="z-10 flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <main className="z-10 mx-auto flex w-full max-w-7xl flex-col p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
