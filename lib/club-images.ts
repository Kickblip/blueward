const clubImageFilenamePattern =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\.(?:jpg|png|webp)$/

export function isClubImageKey(
  key: string,
  kind: "logos" | "banners",
  clubId: number
) {
  const prefix = `clubs/${kind}/${clubId}/`

  return (
    key.startsWith(prefix) &&
    clubImageFilenamePattern.test(key.slice(prefix.length))
  )
}
