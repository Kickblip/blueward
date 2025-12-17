import { Footer, Layout, Navbar } from "nextra-theme-docs"
import { Banner, Head } from "nextra/components"
import { getPageMap } from "nextra/page-map"
import "nextra-theme-docs/style.css"
import "../globals.css"
import Logo from "../components/Logo"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata = {
  title: "Blueward Docs",
  description: "Documentation for Blueward",
}

// const banner = <Banner storageKey="some-key">Banner Text Here 🎉</Banner>;
const navbar = <Navbar logo={<Logo />} />
// const footer = <Footer>MIT {new Date().getFullYear()} © Longhorn LoL</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      // suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head>{/* additional tags should be passed as `children` of `<Head>` element */}</Head>
      <body className={inter.className}>
        <Layout
          // banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Kickblip/blueward/blob/main"
          // footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
