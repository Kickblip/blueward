import Link from "next/link"
import { SOCIAL_LINK_CONFIG } from "@/components/Footer"

export default function Terms() {
  return (
    <div className="flex flex-col min-h-screen py-10">
      <h1 className="text-5xl font-oswald scale-y-150 font-semibold mb-10">Terms of Service</h1>

      <div>
        <strong>Last Updated: 06-30-2024</strong>

        <p>
          This Terms of Service agreement covers how Blueward&#39;s (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) services
          should be used, including our website,{" "}
          <Link href="https://blueward.lol/" className="text-blue-500 underline">
            https://blueward.lol/
          </Link>{" "}
          . By using our services or website, you agree to the terms of this agreement. These Terms of Service are governed in the
          United States under Texas law.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">1. Our Services</h2>
        <p>Blueward is a stat tracker for the video game League of Legends.</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Additional Data Collection and Privacy</h2>
        <p>
          We collect and store user data, including player usernames and other League of Legends related data, to provide our
          services. Please refer to our Privacy Policy at{" "}
          <Link href="https://blueward.lol/privacy" className="text-blue-500 underline">
            https://blueward.lol/privacy
          </Link>{" "}
          for additional information about how we use your data. Additionally, we collect non-personal data for basic analytics
          and to track interest in our services. We do not use cookies.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Updates and Contact</h2>
        <p>
          Updates to this Terms of Service will be reflected on this page. For any questions or concerns, join our Discord server
          at{" "}
          <Link href={SOCIAL_LINK_CONFIG.discord} className="text-blue-500 underline">
            {SOCIAL_LINK_CONFIG.discord}
          </Link>{" "}
        </p>
      </div>
    </div>
  )
}
