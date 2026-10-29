import { Card } from "@/components/ui/card"
import { clubs } from "@/lib/schema"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { FaDiscord } from "react-icons/fa6"
import { ClubTag } from "./club-tag"

export function ClubInfoCard({ club }: { club: typeof clubs.$inferSelect }) {
  return (
    <Card className="p-0">
      <div className="relative aspect-[2/1] w-full">
        <div className="relative h-full w-full overflow-hidden rounded-t-md">
          {club.bannerKey ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${club.bannerKey}`}
              alt="Club banner"
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
            />
          ) : (
            <Image
              src="/club-default-banner.webp"
              alt="Club banner"
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
            />
          )}
        </div>

        <div className="absolute -bottom-8 left-4 h-24 w-24 overflow-hidden rounded-xl border-4 border-secondary bg-secondary">
          {club.logoKey ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${club.logoKey}`}
              alt="Club logo"
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-950 text-3xl font-semibold text-white">
              {club.name.trim().charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="absolute right-2 bottom-2 z-20">
          {club.discordInvite && (
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`https://discord.gg/${club.discordInvite}`}
                className="flex items-center gap-1 font-oswald font-semibold uppercase"
                target="_blank"
              >
                <FaDiscord className="mt-[1px]" />
                <span className="text-xs">Join on Discord</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-8 pb-4">
        <h2 className="font-oswald text-3xl font-semibold uppercase transition-colors duration-200 group-hover:text-chart-3 dark:group-hover:text-chart-1">
          {club.name}
        </h2>

        <ClubTag tag={club.tag} iconId={club.iconId} />

        <p className="text-sm font-medium text-muted-foreground">
          {club.bio ?? "No description provided."}
        </p>
      </div>
    </Card>
  )
}
