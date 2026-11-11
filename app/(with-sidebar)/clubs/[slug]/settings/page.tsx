import { ClubSettingsForm } from "@/components/club-settings-form"
import { fetchClubBySlug } from "../actions"
import { notFound } from "next/navigation"
import { ClubSettingsImageUpload } from "@/components/club-settings-image-upload"
import { DeleteClubButton } from "./delete-club-button"
import { getClubReviewer } from "@/app/(with-sidebar)/import/actions"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const club = await fetchClubBySlug(slug)

  if (!club) return notFound()

  const reviewer = await getClubReviewer(slug)

  return (
    <div className="flex max-w-xl flex-col gap-16">
      <ClubSettingsImageUpload
        clubId={club.id}
        clubName={club.name}
        logoKey={club.logoKey}
        bannerKey={club.bannerKey}
      />
      <ClubSettingsForm club={club} />
      {reviewer?.role === "OWNER" && (
        <section className="flex flex-col gap-3 rounded-sm border border-destructive/50 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-oswald text-lg font-semibold uppercase">
              Delete Club
            </h2>
            <p className="text-sm text-muted-foreground">
              Permanently delete {club.name} and its associated club data.
            </p>
          </div>
          <DeleteClubButton slug={slug} clubName={club.name} />
        </section>
      )}
    </div>
  )
}
