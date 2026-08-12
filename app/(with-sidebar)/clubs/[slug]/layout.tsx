import { Button } from "@/components/ui/button"
import { IoPodium } from "react-icons/io5"
import Link from "next/link"
import { FaGear } from "react-icons/fa6"
import { RiHome6Fill } from "react-icons/ri"

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ slug: string }>
}>) {
  const { slug } = await params

  return (
    <main className="flex min-h-screen flex-col">
      <nav className="mb-4 flex items-center gap-4 border-b pb-2">
        <Button
          variant="ghost"
          size="lg"
          className="gap-2 font-oswald text-lg font-semibold uppercase"
          asChild
        >
          <Link href={`/clubs/${slug}`}>
            <RiHome6Fill className="size-6 text-chart-3 dark:text-chart-1" />
            <span>Home</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="gap-2 font-oswald text-lg font-semibold uppercase"
          asChild
        >
          <Link href={`/clubs/${slug}/leaderboards`}>
            <IoPodium className="size-5 text-chart-3 dark:text-chart-1" />
            <span>Leaderboards</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="gap-2 font-oswald text-lg font-semibold uppercase"
          asChild
        >
          <Link href={`/clubs/${slug}/settings`}>
            <FaGear className="size-5 text-chart-3 dark:text-chart-1" />
            <span>Settings</span>
          </Link>
        </Button>
      </nav>

      {children}
    </main>
  )
}
