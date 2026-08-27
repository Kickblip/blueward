import { BASE_LEVEL_XP, LEVEL_GROWTH } from "./config"

export function calculateMatchXp(
  gameDurationSeconds: number,
  win: boolean
): number {
  const minutes = Math.floor(gameDurationSeconds / 60)

  if (minutes < 10) return 0

  const durationBonus = Math.min(20, Math.floor((minutes - 10) / 2))

  return 80 + durationBonus + (win ? 20 : 0)
}

export function calculateLevel(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp))
  const growth = LEVEL_GROWTH - 1

  return (
    1 +
    Math.floor(Math.log1p((xp * growth) / BASE_LEVEL_XP) / Math.log1p(growth))
  )
}
