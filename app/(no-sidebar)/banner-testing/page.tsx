import Image from "next/image"
import type { ReactNode } from "react"
import { BannerBackground } from "@/components/banner-background"
import { Card } from "@/components/ui/card"
import { BANNER_CONFIG } from "@/lib/config"

const BANNER_ID = 11

function Preview({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h2 className="font-oswald text-xl font-semibold uppercase">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

export default function Page() {
  const banner = BANNER_CONFIG[BANNER_ID as keyof typeof BANNER_CONFIG]
  const bannerName = banner?.name ?? `Banner ${BANNER_ID}`

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 p-4 md:p-8">
      <header className="space-y-2">
        <h1 className="font-oswald text-4xl font-semibold uppercase">
          Banner testing
        </h1>
        <p className="text-muted-foreground">
          #{BANNER_ID} · {bannerName}. Change <code>BANNER_ID</code> at the top
          of this page to preview another banner.
        </p>
        <p className="text-sm text-muted-foreground">
          Resize the window to check responsive crops. Background previews use
          the same animation and image positioning as the site; thumbnails use
          the compressed, centered image.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Preview
          title="Profile / featured / set list / ownership popup"
          description="2:1 · Banner background"
        >
          <BannerBackground bannerId={BANNER_ID}>
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-4 left-4 font-oswald text-4xl font-semibold text-white uppercase">
                {bannerName}
              </p>
            </div>
          </BannerBackground>
        </Preview>

        <Preview
          title="Shop / banner selector"
          description="2:1 · Static compressed thumbnail"
        >
          <div className="relative aspect-[2/1] overflow-hidden rounded-md">
            <Image
              src={`/banners/compressed/${BANNER_ID}.webp`}
              alt={bannerName}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <p className="font-oswald text-lg font-semibold">
                75,000 crystals
              </p>
              <p className="font-oswald text-3xl font-semibold uppercase">
                {bannerName}
              </p>
            </div>
          </div>
        </Preview>

        {[
          { title: "Climb podium", compressed: false },
          { title: "Stat leaderboard podium", compressed: true },
        ].map(({ title, compressed }) => (
          <Preview
            key={title}
            title={title}
            description={`16:9 · ${compressed ? "Static compressed thumbnail" : "Banner background (shown on desktop)"}`}
          >
            <div className="max-w-72">
              {compressed ? (
                <div className="relative aspect-video">
                  <Image
                    src={`/banners/compressed/${BANNER_ID}.webp`}
                    alt={bannerName}
                    fill
                    sizes="288px"
                    className="rounded-md object-cover"
                  />
                </div>
              ) : (
                <BannerBackground bannerId={BANNER_ID}>
                  <div className="aspect-video rounded-md" />
                </BannerBackground>
              )}
              <div className="relative -mt-6 flex flex-col items-center gap-1">
                <Image
                  src="/defaultpfp.webp"
                  alt="Sample player avatar"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-background"
                />
                <p className="font-oswald text-2xl font-semibold uppercase">
                  SamplePlayer
                </p>
                <p className="text-sm text-muted-foreground">1,250 points</p>
              </div>
            </div>
          </Preview>
        ))}
      </div>

      <div className="max-w-[848px] space-y-8">
        {(["large", "small"] as const).map((size) => (
          <Preview
            key={size}
            title={`Home podium · ${size}`}
            description={`Fluid width · ${size === "large" ? "168px / 240px" : "128px / 168px"} content height on mobile / desktop, plus card padding and border`}
          >
            <BannerBackground bannerId={BANNER_ID}>
              <Card className="flex-col gap-2 bg-cover">
                <div
                  className={`flex flex-col justify-between text-white ${size === "large" ? "h-42 md:h-60" : "h-32 md:h-42"}`}
                >
                  <div className="grid grid-cols-2">
                    {[
                      ["MMR", "1,850"],
                      ["Played", "128"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <h3 className="text-xs font-semibold uppercase">
                          {label}
                        </h3>
                        <p
                          className={`font-oswald font-semibold tabular-nums ${size === "large" ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`mb-5 flex items-center justify-between font-oswald font-semibold ${size === "large" ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl"}`}
                  >
                    <p className="scale-y-150 tabular-nums">SamplePlayer</p>
                    <p className="opacity-80">#{size === "large" ? 1 : 2}</p>
                  </div>
                </div>
              </Card>
            </BannerBackground>
          </Preview>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {[
          {
            title: "Room · player pool",
            description:
              "Content-driven height · Drag the bottom-right corner to change the width",
            className:
              "w-full min-w-64 max-w-full resize-x overflow-auto rounded-md border bg-secondary",
          },
          {
            title: "Room · team player",
            description:
              "Viewport-driven height · 128px example; drag the bottom-right corner to resize",
            className:
              "h-32 min-h-24 w-full min-w-64 max-w-full resize overflow-auto border border-l-4 border-l-blue-500 bg-secondary",
          },
        ].map(({ title, description, className }) => (
          <Preview key={title} title={title} description={description}>
            <div className={className}>
              <BannerBackground bannerId={BANNER_ID}>
                <div className="relative h-full">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {["Level 50", "Mid", "Diamond"].map((label) => (
                        <span
                          key={label}
                          className="inline-flex h-6 items-center rounded-full border bg-secondary/90 px-2 font-oswald text-xs font-semibold uppercase"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <p className="font-oswald text-4xl font-semibold uppercase">
                      SamplePlayer
                    </p>
                  </div>
                </div>
              </BannerBackground>
            </div>
          </Preview>
        ))}
      </div>
    </main>
  )
}
