import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SOCIAL_LINK_CONFIG } from "@/lib/config"

export function TextLink({
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
      className={cn(
        "text-blue-400 underline underline-offset-4 transition-colors hover:text-blue-300",
        className ? className : ""
      )}
    >
      {" "}
      {children}
    </Link>
  )
}

export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-sm leading-6">{children}</div>
    </section>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="font-oswald font-semibold text-blue-400 uppercase underline"
        >
          Return to Home
        </Link>

        <header className="my-10 space-y-3">
          <p className="text-sm">
            <span className="font-semibold">Last Updated:</span>{" "}
            <time dateTime="2025-12-13">12 / 13 / 2025</time>
          </p>
          <h1 className="scale-y-150 font-oswald text-5xl font-semibold">
            Terms of Service
          </h1>
        </header>

        <article className="space-y-8">
          <p className="text-sm leading-6">
            These Terms of Service describe how Blueward&apos;s ("we," "us," or
            "our") services may be used, including our website at{" "}
            <TextLink href="/">blueward.lol</TextLink>. By using our services,
            you agree to these terms. These Terms are governed by Texas law in
            the United States. Blueward is not endorsed by Riot Games and does
            not reflect the views or opinions of Riot Games or anyone officially
            involved in producing or managing Riot Games properties. Riot Games
            and all associated properties are trademarks or registered
            trademarks of Riot Games, Inc
          </p>

          <Section title="1. Our Services">
            <p>
              Blueward is a stat tracker for the video game League of Legends.
            </p>
          </Section>

          <Section title="2. Data Collection and Privacy">
            <p>
              We collect and store user data (including player usernames League
              of Legends match data) to provide our services.
              <TextLink href="/privacy">
                Please review our Privacy Policy
              </TextLink>
              . We also collect data for basic analytics and to track interest
              in our services. We do not use cookies. By participating in custom
              games or tournaments related to Longhorn League of Legends
              (“Longhorn LoL”), you consent to the collection and use of your
              data as described in these Terms and our Privacy Policy.
            </p>
          </Section>

          <Section title="3. Updates and Contact">
            <p>
              Updates to these Terms will be reflected on this page. For
              questions,
              <TextLink href={SOCIAL_LINK_CONFIG.discord}>
                join our Discord.
              </TextLink>
            </p>
          </Section>
        </article>
      </div>
    </main>
  )
}
