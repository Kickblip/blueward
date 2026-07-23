import type { Metadata } from "next"
import { Oswald, Roboto, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
})

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const title = "BLUEWARD (* ^ ω ^)つロ"
const description =
  "Stats, leaderboards, and player profiles for collegiate League of Legends clubs."

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
    images: [
      { url: "/og-image.jpg", width: 1280, height: 720, alt: "BLUEWARD" },
    ],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable,
        oswald.variable
      )}
    >
      <body>
        <ClerkProvider
          appearance={{
            variables: { colorPrimary: "#3aa4fc" },
            cssLayerName: "clerk",
          }}
        >
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
