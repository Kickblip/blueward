import { Button } from "@/components/ui/button"
import { FaPencilRuler, FaUser } from "react-icons/fa"
import { FaTrophy } from "react-icons/fa6"
import Link from "next/link"
import { getClubReviewer } from "@/app/(with-sidebar)/import/actions"
import { notFound } from "next/navigation"

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ slug: string }>
}>) {
  const { slug } = await params
  const manager = await getClubReviewer(slug)

  if (!manager) {
    notFound()
  }

  return (
    <div className="grid grid-cols-[1fr_3fr] gap-4">
      <nav className="flex flex-col gap-1">
        <p className="mb-2 font-oswald text-lg font-semibold uppercase">
          Settings
        </p>

        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start gap-3 font-oswald text-lg font-semibold uppercase"
          asChild
        >
          <Link href={`/clubs/${slug}/settings`}>
            <FaPencilRuler className="size-5 text-chart-3 dark:text-chart-1" />
            <span>General</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start gap-3 font-oswald text-lg font-semibold uppercase"
          asChild
        >
          <Link href={`/clubs/${slug}/settings/members`}>
            <FaUser className="size-5 text-chart-3 dark:text-chart-1" />
            <span>Members</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start gap-3 font-oswald text-lg font-semibold uppercase"
          asChild
        >
          <Link href={`/clubs/${slug}/settings/tournaments`}>
            <FaTrophy className="size-5 text-chart-3 dark:text-chart-1" />
            <span>Tournaments</span>
          </Link>
        </Button>
      </nav>
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </div>
  )
}
