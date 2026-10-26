import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-12">
      <Card className="w-full max-w-md items-center gap-0 px-6 py-10 text-center sm:px-10">
        <Logo size={48} />

        <p className="mt-8 font-oswald text-8xl leading-none font-semibold sm:text-9xl">
          404
        </p>

        <h1 className="mt-6 font-oswald text-2xl font-semibold uppercase">
          Page Not Found
        </h1>

        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          We couldn&apos;t find this page. The link may be outdated or the
          address incorrect.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 w-full font-oswald font-semibold uppercase"
        >
          <Link href="/">Return home</Link>
        </Button>
      </Card>
    </main>
  )
}
