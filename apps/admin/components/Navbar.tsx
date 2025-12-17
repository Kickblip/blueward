import Link from "next/link"
import Logo from "@repo/ui/Logo"

export default function Navbar() {
  return (
    <div className="max-w-7xl w-full mx-auto flex justify-between py-4 font-oswald">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Logo />
        </Link>

        <span className="relative inline-block mt-1">
          <Link
            href="/leaderboard/kills"
            className="font-medium uppercase text-md hover:text-zinc-300 transition-colors duration-200"
          >
            Leaderboards
          </Link>
        </span>
      </div>
    </div>
  )
}
