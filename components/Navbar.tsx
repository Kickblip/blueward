import Link from "next/link"
import { SiRiotgames } from "react-icons/si"
import GlowingCard from "./ui/GlowingCard"
import LightningButton from "./LightningButton"
import Logo from "./ui/Logo"
import { PiCrownSimpleFill } from "react-icons/pi"
import { RiSwordFill } from "react-icons/ri"

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
          <span className="pointer-events-none absolute -top-3 -right-3 rotate-35">
            <PiCrownSimpleFill className="inline-block text-blue-500" size={14} />
          </span>
        </span>

        <span className="relative inline-block mt-1">
          <Link href="/map" className="font-medium uppercase text-md hover:text-zinc-300 transition-colors duration-200">
            Conquest
          </Link>
          <span className="pointer-events-none absolute -top-3 -right-3 -rotate-25">
            <RiSwordFill className="inline-block text-blue-500" size={14} />
          </span>
        </span>

        <LightningButton href="/fightclub">Fight Club</LightningButton>
      </div>

      <Link href="/">
        <GlowingCard glow="heavy" className="flex flex-row items-center gap-2 px-6 py-2 text-blue-100">
          <span className="uppercase font-semibold text-sm">Sign In</span>
          <SiRiotgames />
        </GlowingCard>
      </Link>
    </div>
  )
}
