import type { Metadata } from "next"
import { Oswald, Roboto } from "next/font/google"
import "./globals.css"
import { NavbarLayout, NavbarLink } from "@repo/ui/Navbar"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PiCrownSimpleFill } from "react-icons/pi"
import MainContentFrame from "@repo/ui/MainContentFrame"
import { ClerkProvider, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import UserButton from "@/components/UserButton"
import { dark } from "@clerk/themes"
import { SearchButton } from "@/components/Search"
import { currentUser } from "@clerk/nextjs/server"
import { Analytics } from "@vercel/analytics/next"
import { FaUserGroup } from "react-icons/fa6"
import { IoSparkles } from "react-icons/io5"
// import { claimCurrentUsersProfile } from "@/app/player/[pid]/claim/page"
import UserBalance from "@/components/UserBalance"

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
})

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
})

const title = "BLUEWARD (* ^ ω ^)つロ"
const description = "Stats, leaderboards, and player profiles for collegiate League of Legends clubs."

export const metadata: Metadata = {
  metadataBase: new URL("https://blueward.lol"),

  title: title,
  description: description,

  openGraph: {
    type: "website",
    siteName: "BLUEWARD",
    url: "https://blueward.lol",
    title: title,
    description: description,
    images: [{ url: "/og-image.jpg", width: 1280, height: 720, alt: "BLUEWARD" }],
  },

  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: ["/og-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: { colorPrimary: "#3aa4fc" },
        cssLayerName: "clerk",
      }}
    >
      <html lang="en">
        <body className={`${oswald.variable} ${roboto.className} ${roboto.variable}`}>
          <SpeedInsights />
          <Analytics />

          <MainContentFrame Navbar={<Navbar />} backgroundPatternUrl="/grid.svg" backgroundPatternSize={512}>
            {children}
          </MainContentFrame>
        </body>
      </html>
    </ClerkProvider>
  )
}

function Navbar() {
  return (
    <NavbarLayout signInButtons={<SignInButtons />}>
      <NavbarLink
        href="/leaderboard/kills"
        icon={<PiCrownSimpleFill className="inline-block text-blue-500 rotate-35" size={14} />}
      >
        Leaderboards
      </NavbarLink>

      <NavbarLink href="/shop" icon={<IoSparkles className="inline-block text-blue-500" size={12} />}>
        Shop
      </NavbarLink>

      {/* <LightningButton href="/fightclub">Fight Club</LightningButton> */}
    </NavbarLayout>
  )
}

async function SignInButtons() {
  const user = await currentUser()
  const puuid = user?.privateMetadata.puuid as string | undefined
  const hasRiotAccountConnected = user && user.externalAccounts.some((account) => account.provider === "oauth_custom_riot_games")
  const isAdmin = user && user.privateMetadata.role === "admin"

  // if (hasRiotAccountConnected && !puuid) {
  //   // The user must have just connected their Riot account so we attempt to claim their Blueward profile automatically
  //   const result = await claimCurrentUsersProfile()

  //   if (!result.ok) {
  //     console.error("Failed to claim profile:", result.message)
  //     return
  //   }

  //   console.log("Claimed puuid:", result.puuid)
  // }

  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <SignUpButton>
          <div className="flex items-center gap-2 rounded-xl px-6 py-1.5 border border-blue-500 bg-blue-600/80 hover:bg-blue-600 transition-colors duration-200">
            <FaUserGroup size={14} />
            <span className="text-sm uppercase">Sign Up</span>
          </div>
        </SignUpButton>
      </SignedOut>

      <SearchButton />

      <SignedIn>
        {hasRiotAccountConnected && puuid && <UserBalance />}
        <UserButton puuid={puuid} riotConnected={hasRiotAccountConnected} isAdmin={isAdmin} />
      </SignedIn>
    </div>
  )
}
