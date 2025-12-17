import { Section, TextLink } from "../terms/page"
import { SOCIAL_LINK_CONFIG } from "@repo/ui/Footer"

export default function Privacy() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="space-y-3 mb-10">
          <p className="text-sm text-zinc-400">
            <span className="font-semibold text-zinc-300">Last Updated:</span> <time dateTime="2025-12-13">12 / 13 / 2025</time>
          </p>
          <h1 className="text-5xl font-oswald font-semibold scale-y-150">Privacy Policy</h1>
        </header>

        <article className="space-y-8">
          <p className="text-sm leading-6 text-zinc-200">
            This Privacy Policy describes how Blueward ("we," "us," or "our") manages your personal and non-personal information.
            This primarily includes data gathered from your usage of our website at <TextLink href="/">blueward.lol</TextLink>. By
            using Blueward, you agree to the terms of this Privacy Policy and <TextLink href="/terms">Terms of Service</TextLink>.
          </p>

          <Section title="1. Personal Data">
            <p>
              We collect certain user data associated with your League of Legends and Riot account (such as usernames or
              statistics), some of which may be non-public.
            </p>
          </Section>

          <Section title="2. Non-Personal Data">
            <p>
              We may use basic analytics such as page views, browser type, and other device details. This data helps us analyze
              trends and improve our services. We do not use cookies on Blueward.
            </p>
          </Section>

          <Section title="3. Personal Data Sharing">
            <p>We do not share your personal data with any third parties.</p>
          </Section>

          <Section title="4. Children&#39;s Data">
            <p>
              Blueward is not intended for users under the age of 18. We do not knowingly collect personal information of
              children. If you have any concerns regarding the data of a child, please contact us.
            </p>
          </Section>

          <Section title="5. Updates and Contact">
            <p>
              Updates to this Privacy Policy will be reflected on this page. For questions,
              <TextLink href={SOCIAL_LINK_CONFIG.discord}>join our Discord.</TextLink>
            </p>
          </Section>
        </article>
      </div>
    </main>
  )
}
