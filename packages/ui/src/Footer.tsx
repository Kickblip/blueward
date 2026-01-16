import Logo from "./Logo"
import Link from "next/link"
import { FaTwitch, FaInstagram, FaDiscord } from "react-icons/fa6"

function FooterLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`text-zinc-400 text-xs hover:text-zinc-200 transition-colors duration-200 ${className}`}
      target="_blank"
    >
      {children}
    </Link>
  )
}

export type config = {
  discord: string
  instagram: string
  twitch: string
  wyattwebsite: string
  pixels: string
  docs: string
  changelog: string
  repo: string
  clubsite: string
}

export default function Footer({ config }: { config: config }) {
  return (
    <div className="max-w-7xl w-full mx-auto mb-8 mt-6 flex flex-col gap-6">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <Logo />

          <p className="text-zinc-400 text-xs max-w-sm">
            Blueward is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially
            involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or
            registered trademarks of Riot Games, Inc
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-zinc-200 font-semibold">Resources</h3>
            <FooterLink href={config.repo}>Open Source</FooterLink>
            <FooterLink href={config.docs}>Documentation</FooterLink>
            <FooterLink href={config.changelog}>Changelog</FooterLink>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-zinc-200 font-semibold">Related</h3>
            <FooterLink href={config.clubsite}>Longhorn LoL</FooterLink>
            <FooterLink href={config.pixels}>Pixels Minigame</FooterLink>

            <div className="flex gap-3 mt-2">
              <FooterLink href={config.discord}>
                <FaDiscord size={18} className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200" />
              </FooterLink>
              <FooterLink href={config.instagram}>
                <FaInstagram size={18} className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200" />
              </FooterLink>
              <FooterLink href={config.twitch}>
                <FaTwitch size={18} className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200" />
              </FooterLink>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-t border-zinc-800" />

      <div className="flex justify-between">
        <p className="text-zinc-500 text-xs">&copy; {new Date().getFullYear()} Blueward. All rights reserved.</p>

        <p className="text-zinc-400 text-xs">
          Built by{" "}
          <FooterLink href={config.wyattwebsite} className="underline">
            Kickball
          </FooterLink>
        </p>

        <div className="flex gap-4">
          <p className="text-xs">🐝</p>
          <Link href="/terms" className="text-zinc-400 text-xs hover:text-zinc-200 transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-zinc-400 text-xs hover:text-zinc-200 transition-colors duration-200">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
