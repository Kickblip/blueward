import { ClubSettingsForm } from "@/components/club-settings-form"
import { fetchClubBySlug } from "../actions"
import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const club = await fetchClubBySlug(slug)

  if (!club) return notFound()

  return (
    <div>
      <ClubSettingsForm club={club} />
    </div>
  )
}
