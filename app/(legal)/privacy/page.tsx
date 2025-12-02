import Link from "next/link"
import { SOCIAL_LINK_CONFIG } from "@/components/Footer"

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen py-10">
      <h1 className="text-5xl font-oswald scale-y-150 font-semibold mb-10">Privacy Policy</h1>

      <div>
        <strong>Last Updated: 06-23-2024</strong>

        <p>
          This Privacy Policy covers how Blueward (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) manages your personal and
          non-personal information. This primarily includes data gathered from your usage of our website,{" "}
          <Link href="https://blueward.lol/" className="text-blue-500 underline">
            https://blueward.lol/
          </Link>
          . By using Blueward, you agree to the terms of this Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">1. Personal Data</h2>
        <p>
          We collect certain user data associated with your League of Legends and Riot account (such as usernames or statistics),
          some of which is non-public.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Non-Personal Data</h2>
        <p>
          We may use basic analytics such as page views, browser type, and other device details. This data helps us analyze trends
          and improve our services. We do not use cookies on Blueward.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Personal Data Sharing</h2>
        <p>We do not share your personal data with any third parties.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Children&#39;s Data</h2>
        <p>
          Blueward is not intended for users under the age of&nbsp;18. We do not knowingly collect personal information of
          children. If you have any concerns regarding the data of a child, please contact us.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Updates and Contact</h2>
        <p>
          Updates to this Privacy Policy will be reflected on this page. For any questions or concerns, join our Discord server at{" "}
          <Link href={SOCIAL_LINK_CONFIG.discord} className="text-blue-500 underline">
            {SOCIAL_LINK_CONFIG.discord}
          </Link>{" "}
        </p>
      </div>
    </div>
  )
}
