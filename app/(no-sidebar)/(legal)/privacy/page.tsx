import { Section, TextLink } from "../terms/page"
import { SOCIAL_LINK_CONFIG } from "@/lib/config"
import Link from "next/link"

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
            Privacy Policy
          </h1>
        </header>

        <article className="space-y-8">
          <p className="text-sm leading-6">
            This Privacy Policy describes how Blueward (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
            information when you use our website at
            <TextLink href="/">blueward.lol</TextLink>. Our
            <TextLink href="/terms">Terms of Service</TextLink> govern your use
            of Blueward. Accepting those Terms does not by itself constitute
            consent to advertising cookies or personalized advertising.
          </p>

          <Section title="1. Personal Data">
            <p>
              We collect certain user data associated with your League of
              Legends and Riot account (such as usernames or statistics), some
              of which may be non-public. We also collect account and guest
              session information, such as display names, to provide our
              services.
            </p>
          </Section>

          <Section title="2. Automatically Collected Information and Cookies">
            <p>
              We use analytics and performance information, such as page views,
              browser type, and device details, to understand usage and improve
              our services. We and our service providers use cookies and similar
              storage technologies for functions such as authentication, guest
              sessions, and remembering preferences. When advertising is
              enabled, advertising providers may also collect information as
              described below. Device identifiers and usage information may
              constitute personal information under applicable law.
            </p>
          </Section>

          <Section title="3. Personal Data Sharing">
            <p>
              We use service providers to operate Blueward, including Clerk for
              authentication and Vercel for analytics and performance
              monitoring. These providers process information to provide their
              services. When advertising is enabled, Google and participating
              advertising partners may also collect or receive information from
              your browser to serve, personalize, and measure ads, subject to
              applicable consent requirements and your choices.
            </p>
          </Section>

          <Section title="4. Advertising and Your Choices">
            <p>
              Blueward may display advertisements through Google AdSense. When
              these ads are enabled, third-party vendors, including Google, may
              place and read cookies or use web beacons, IP addresses, and other
              identifiers to collect information about your device, the pages
              you visit, and your interactions with ads. This information helps
              deliver and measure advertising and prevent fraud.
            </p>
            <p>
              When personalized advertising is enabled and any required consent
              has been obtained, Google and its partners may use advertising
              cookies to serve ads based on your prior visits to Blueward and
              other websites. Other participating advertising vendors and
              networks may also use cookies for these purposes. Non-personalized
              ads may still use cookies for purposes such as limiting repeated
              ads and measuring ad performance.
            </p>
            <p>
              Learn more about
              <TextLink href="https://policies.google.com/technologies/partner-sites">
                how Google uses information from partner sites
              </TextLink>
              . You can manage or opt out of Google&apos;s personalized
              advertising through
              <TextLink href="https://adssettings.google.com/">
                Google Ads Settings
              </TextLink>
              . You can also learn about participating third-party vendors and
              their personalized advertising opt-outs at
              <TextLink href="https://www.aboutads.info/choices/">
                the Digital Advertising Alliance&apos;s choices page
              </TextLink>
              . Opting out of personalized advertising does not necessarily
              remove advertisements.
            </p>
            <p>
              Where offered, you can use Blueward&apos;s privacy controls to
              review or change your cookie and advertising consent choices.
              Consent required for advertising is separate from accepting our
              Terms or participating in games or tournaments. You can also
              manage cookies through your browser settings; blocking functional
              cookies may affect features such as signing in or guest sessions.
            </p>
          </Section>

          <Section title="5. Children&#39;s Data">
            <p>
              Blueward is not intended for users under the age of 18. We do not
              knowingly collect personal information of children. If you have
              any concerns regarding the data of a child, please contact us.
            </p>
          </Section>

          <Section title="6. Updates and Contact">
            <p>
              Updates to this Privacy Policy will be reflected on this page. For
              privacy questions or requests concerning your personal data,
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
