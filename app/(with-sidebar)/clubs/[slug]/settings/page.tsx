import { ClubSettingsForm } from "@/components/club-settings-form"
import { fetchClubBySlug } from "../actions"
import { notFound } from "next/navigation"
import { ClubSettingsImageUpload } from "@/components/club-settings-image-upload"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const club = await fetchClubBySlug(slug)

  if (!club) return notFound()

  return (
    <div className="flex max-w-xl flex-col gap-16">
      <ClubSettingsImageUpload
        clubId={club.id}
        clubName={club.name}
        logoKey={club.logoKey}
        bannerKey={club.bannerKey}
      />
      <ClubSettingsForm club={club} />
    </div>
  )
}
