import Image from "next/image"
import { FaUserGroup } from "react-icons/fa6"
import Link from "next/link"
import { SiRiotgames } from "react-icons/si"

export default function Page() {
  return (
    <div className="flex gap-4">
      <div className="relative  aspect-[2/3] w-[300px] shrink-0 overflow-hidden rounded-md">
        <Image
          src="/take-down-dither-blue.webp"
          alt=""
          fill
          sizes="300px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FaUserGroup className="size-6 text-chart-3 dark:text-chart-1" />
          <span className="font-oswald text-lg font-semibold uppercase">
            Sign in to Blueward
          </span>
        </div>

        <div className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#D13639] p-4 font-oswald font-semibold text-white uppercase transition-colors duration-200 hover:opacity-90">
          <SiRiotgames className="size-4" />
          <span>Continue with Riot Games</span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>By continuing you agree to our</span>
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>
          <span>and</span>
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
