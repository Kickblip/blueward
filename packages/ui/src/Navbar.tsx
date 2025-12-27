import Link from "next/link"
import Logo from "./Logo"

export function NavbarLayout({ children, signInButtons }: { children?: React.ReactNode; signInButtons?: React.ReactNode }) {
  return (
    <div className="max-w-7xl w-full mx-auto flex justify-between py-4 font-oswald">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Logo />
        </Link>

        {children ?? null}
      </div>

      {signInButtons}
    </div>
  )
}

export function NavbarLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="relative inline-block mt-1">
      <Link href={href} className="font-medium uppercase text-md hover:text-zinc-300 transition-colors duration-200">
        {children}
      </Link>
      {icon && <span className="pointer-events-none absolute -top-3 -right-3">{icon}</span>}
    </span>
  )
}
