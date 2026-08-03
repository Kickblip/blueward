import { Logo } from "@/components/logo"
import Link from "next/link"
import { FaTwitch, FaInstagram, FaDiscord } from "react-icons/fa6"
import { SOCIAL_LINK_CONFIG } from "@/lib/config"

export function Footer() {
  return (
    <footer className="mx-auto mt-6 mb-8 flex w-full max-w-7xl flex-col gap-6">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Logo className="size-8!" />
            <span className="pointer-events-none font-oswald text-2xl font-semibold uppercase group-data-[collapsible=icon]:sr-only">
              Blueward
            </span>
          </div>

          <p className="max-w-sm text-xs text-muted-foreground">
            Blueward is not endorsed by Riot Games and does not reflect the
            views or opinions of Riot Games or anyone officially involved in
            producing or managing Riot Games properties. Riot Games and all
            associated properties are trademarks or registered trademarks of
            Riot Games, Inc
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Resources</h3>
            <FooterLink href={SOCIAL_LINK_CONFIG.repo}>Open Source</FooterLink>
            {/* <FooterLink href={SOCIAL_LINK_CONFIG.docs}>Documentation</FooterLink> */}
            <FooterLink href={SOCIAL_LINK_CONFIG.changelog}>
              Changelog
            </FooterLink>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Socials</h3>
            <FooterLink href={SOCIAL_LINK_CONFIG.clubsite}>
              Longhorn LoL
            </FooterLink>

            <div className="mt-2 flex gap-3">
              <FooterLink href={SOCIAL_LINK_CONFIG.discord}>
                <FaDiscord
                  size={18}
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                />
              </FooterLink>
              <FooterLink href={SOCIAL_LINK_CONFIG.instagram}>
                <FaInstagram
                  size={18}
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                />
              </FooterLink>
              <FooterLink href={SOCIAL_LINK_CONFIG.twitch}>
                <FaTwitch
                  size={18}
                  className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                />
              </FooterLink>
            </div>
          </div>
        </div>
      </div>

      <hr className="border" />

      <div className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Blueward. All rights reserved.
        </p>

        <p className="text-xs text-muted-foreground">
          Built by{" "}
          <FooterLink
            href={SOCIAL_LINK_CONFIG.wyattwebsite}
            className="underline"
          >
            Kickball
          </FooterLink>
        </p>

        <div className="flex gap-4">
          <p className="text-xs">🐝</p>
          <Link
            href="/terms"
            className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground ${className}`}
      target="_blank"
    >
      {children}
    </Link>
  )
}
