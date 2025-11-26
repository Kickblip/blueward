import Logo from "./ui/Logo"
import Link from "next/link"
import { SiRiotgames } from "react-icons/si"
import Image from "next/image"
import GlowingCard from "./ui/GlowingCard"

export default function Navbar() {
  return (
    <div className="max-w-7xl w-full mx-auto flex justify-between py-4 font-oswald">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Logo />
        </Link>

        <span className="relative inline-block mt-1">
          <Link href="/leaderboards" className="font-medium uppercase text-md hover:text-zinc-300 transition-colors duration-200">
            Leaderboards
          </Link>
          <span className="pointer-events-none absolute -top-3 -right-3 rotate-35">
            <Image src={"/crown.svg"} alt="" width={13} height={13} className="inline-block" />
          </span>
        </span>
      </div>

      <Link href="/signin">
        <GlowingCard glow="heavy" className="flex flex-row items-center gap-2 px-6 py-2">
          <SiRiotgames className="text-blue-100" /> <span className="uppercase text-blue-100 font-semibold text-sm">Sign In</span>
        </GlowingCard>
      </Link>
    </div>
  )
}
