export function epochToRelativeTime(epochTime: number): string {
  const diffMs = Date.now() - epochTime

  const seconds = Math.floor(diffMs / 1_000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

  if (days) return rtf.format(-days, "day") // “2 days ago”
  if (hours) return rtf.format(-hours, "hour") // “an hour ago”
  if (minutes) return rtf.format(-minutes, "minute")
  return rtf.format(-seconds, "second") // “just now”
}

export function timestampToRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  return epochToRelativeTime(date.getTime())
}

export function toNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function getThresholdTextColor({ value, max }: { value: number; max: number }) {
  let colorClass = "text-blue-100"

  if (value >= max) colorClass = "text-yellow-400"
  else if (value >= max * 0.75) colorClass = "text-blue-600"
  else if (value >= max * 0.5) colorClass = "text-blue-500"
  else if (value >= max * 0.3) colorClass = "text-blue-400"
  else if (value >= max * 0.2) colorClass = "text-blue-300"
  else if (value >= max * 0.15) colorClass = "text-blue-200"
  return colorClass
}

export function toErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  return "Unknown error"
}

export function safeSubstring(value: unknown, start = 0, end?: number, fallback = ""): string {
  if (typeof value !== "string") return fallback

  const len = value.length

  const s0 = Number.isFinite(start) ? Math.trunc(start) : 0
  const e0 = end === undefined ? len : Number.isFinite(end) ? Math.trunc(end) : len

  const s = Math.max(0, Math.min(len, s0))
  const e = Math.max(0, Math.min(len, e0))

  const from = Math.min(s, e)
  const to = Math.max(s, e)

  return value.substring(from, to)
}
