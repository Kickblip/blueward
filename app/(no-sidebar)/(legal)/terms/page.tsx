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
            <time dateTime="2026-09-12">09 / 12 / 2026</time>
          </p>
          <h1 className="scale-y-150 font-oswald text-5xl font-semibold">
            Terms of Service
          </h1>
        </header>

        <article className="space-y-8">
          <p className="text-sm leading-6">
            These Terms of Service describe how the services provided by
            Blueward (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) may be
            used, including our website at{" "}
            <TextLink href="/">blueward.lol</TextLink>. By using our services,
            you agree to these terms. These Terms are governed by Texas law in
            the United States. Blueward is not endorsed by Riot Games and does
            not reflect the views or opinions of Riot Games or anyone officially
            involved in producing or managing Riot Games properties. Riot Games
            and all associated properties are trademarks or registered
            trademarks of Riot Games, Inc.
          </p>

          <Section title="1. Our Services">
            <p>
              Blueward is a stat tracker for the video game League of Legends.
            </p>
          </Section>

          <Section title="2. Data Collection and Privacy">
            <p>
              We collect and store user data, including player usernames and
              League of Legends match data, to provide our services. This may
              include data from custom games or tournaments related to Longhorn
              League of Legends (&quot;Longhorn LoL&quot;). We also use
              analytics and cookies or similar technologies to operate and
              improve Blueward. When advertising is enabled, advertising
              providers may use these technologies to serve and measure ads.
              <TextLink href="/privacy">
                Please review our Privacy Policy
              </TextLink>{" "}
              for details about data collection, sharing, cookies, and your
              choices. Accepting these Terms or participating in games or
              tournaments does not by itself constitute consent to advertising
              cookies or personalized advertising where separate consent is
              required.
            </p>
          </Section>

          <Section title="3. Advertising and Third-Party Links">
            <p>
              Blueward may display third-party advertisements, including ads
              provided through Google AdSense. Displaying an advertisement does
              not constitute our endorsement of the advertiser or its products
              or services. Third-party websites and services linked through ads
              have their own terms and privacy policies.
            </p>
          </Section>

          <Section title="4. Updates and Contact">
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
