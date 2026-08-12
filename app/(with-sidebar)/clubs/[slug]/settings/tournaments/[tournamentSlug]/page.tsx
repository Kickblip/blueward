export default async function Page({
  params,
}: {
  params: Promise<{
    slug: string
    tournamentSlug: string
  }>
}) {
  const { slug, tournamentSlug } = await params

  return <div>Tournament: {tournamentSlug}</div>
}
