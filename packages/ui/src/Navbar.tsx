import Link from "next/link"
import Logo from "./Logo"
import { LogoSmall } from "./Logo"

export function NavbarLayout({ children, signInButtons }: { children?: React.ReactNode; signInButtons?: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl justify-between py-4 md:px-0 px-4 font-oswald">
      <div className="flex items-center gap-8">
        <Link href="/" aria-label="Home">
          <>
            <span className="block sm:hidden">
              <LogoSmall />
            </span>

            <span className="hidden sm:block">
              <Logo />
            </span>
          </>
        </Link>

        {children ?? null}
      </div>

      {signInButtons}
    </div>
  )
}

export function NavbarLink({
  href,
  children,
  icon,
  className = "",
}: {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <span className="relative inline-block mt-1">
      <Link
        href={href}
        className={`font-medium uppercase text-md transition-colors duration-200 hover:text-zinc-300 ${className}`}
      >
        {children}
      </Link>
      {icon && <span className="pointer-events-none absolute -top-3 -right-3">{icon}</span>}
    </span>
  )
}
