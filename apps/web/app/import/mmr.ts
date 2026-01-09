export function calculateMMR(participant: any): number {
  let points = 0

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const tierScore = (value: number, tiers: { threshold: number; points: number }[]) => {
    let best = 0
    for (const t of tiers) {
      if (value >= t.threshold) best = Math.max(best, t.points)
    }
    return best
  }

  /* ------------------------------ outcome ----------------------------- */
  if (participant.win) {
    points += 8
  }

  /* --------------------------- staying alive -------------------------- */
  const deaths = participant.deaths ?? 0
  if (deaths <= 2) points += 4
  else if (deaths <= 5) points += 2
  else if (deaths <= 7) points += 0
  else if (deaths <= 9) points -= 4
  else points -= 8

  /* ----------------------------- teamplay ----------------------------- */
  const killParticipation = participant.challenges.killParticipation ?? 0
  const takedowns = (participant.kills ?? 0) + (participant.assists ?? 0)

  const kpPoints = tierScore(killParticipation, [
    { threshold: 0.5, points: 3 },
    { threshold: 0.6, points: 6 },
    { threshold: 0.7, points: 10 },
  ])

  const takedownPoints = tierScore(takedowns, [
    { threshold: 12, points: 3 },
    { threshold: 16, points: 6 },
    { threshold: 20, points: 10 },
  ])

  points += clamp(Math.max(kpPoints, takedownPoints), 0, 10)

  /* --------------------------- primary impact -------------------------- */
  const carryPoints = tierScore(participant.challenges.teamDamagePercentage ?? 0, [
    { threshold: 0.25, points: 6 },
    { threshold: 0.3, points: 10 },
  ])

  const tankPoints = tierScore(participant.challenges.damageTakenOnTeamPercentage ?? 0, [
    { threshold: 0.25, points: 6 },
    { threshold: 0.3, points: 10 },
  ])

  const enchanterPoints = tierScore(participant.challenges.effectiveHealAndShielding ?? 0, [
    { threshold: 4000, points: 6 },
    { threshold: 8000, points: 10 },
  ])

  const ccPoints = tierScore(participant.totalTimeCCDealt ?? 0, [
    { threshold: 35, points: 6 },
    { threshold: 60, points: 10 },
  ])

  points += clamp(Math.max(carryPoints, tankPoints, enchanterPoints, ccPoints), 0, 10)

  /* ------------------------------ vision ------------------------------ */
  const visionScore = participant.visionScore ?? 0
  const visionPoints = tierScore(visionScore, [
    { threshold: 20, points: 3 },
    { threshold: 30, points: 6 },
    { threshold: 40, points: 10 },
  ])

  points += clamp(visionPoints, 0, 10)

  /* ---------------------------- objectives ----------------------------- */
  const turretPoints = tierScore(participant.turretTakedowns ?? 0, [
    { threshold: 2, points: 5 },
    { threshold: 4, points: 10 },
  ])

  const platePoints = tierScore(participant.challenges.turretPlatesTaken ?? 0, [
    { threshold: 3, points: 5 },
    { threshold: 5, points: 10 },
  ])

  const objectiveDamagePoints = tierScore(participant.damageDealtToObjectives ?? 0, [
    { threshold: 6000, points: 5 },
    { threshold: 12000, points: 10 },
  ])

  const epicStealPoints = (participant.challenges.epicMonsterSteals ?? 0) >= 1 ? 10 : 0

  points += clamp(Math.max(turretPoints, platePoints, objectiveDamagePoints, epicStealPoints), 0, 10)

  /* ------------------------------ farming ------------------------------ */
  const laneCsPoints = tierScore(participant.challenges.laneMinionsFirst10Minutes ?? 0, [
    { threshold: 70, points: 4 },
    { threshold: 90, points: 8 },
  ])

  const jungleCsPoints = tierScore(participant.challenges.jungleCsBefore10Minutes ?? 0, [
    { threshold: 55, points: 4 },
    { threshold: 70, points: 8 },
  ])

  const visionWork = (participant.challenges.controlWardsPlaced ?? 0) + (participant.challenges.wardTakedowns ?? 0)

  const supportVisionPoints = tierScore(visionWork, [
    { threshold: 8, points: 4 },
    { threshold: 14, points: 8 },
  ])

  points += clamp(Math.max(laneCsPoints, jungleCsPoints, supportVisionPoints), 0, 8)

  /* ----------------------------- highlights ---------------------------- */
  let highlightPoints = 0
  if ((participant.pentaKills ?? 0) > 0) highlightPoints = 4
  else if ((participant.quadraKills ?? 0) > 0) highlightPoints = 3
  else if ((participant.tripleKills ?? 0) > 0) highlightPoints = 2

  points += clamp(highlightPoints, 0, 4)

  /* ------------------------------ result ------------------------------- */
  return Math.round(points)
}
