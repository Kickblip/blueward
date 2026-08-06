// slug: display name
export const statList = {
  kills: "Kills",
  deaths: "Deaths",
  assists: "Assists",
  cs: "CS",
  kda: "KDA",
  damagedealt: "Damage Dealt to Champions",
  visionscore: "Vision Score",
  missingpings: "Missing Pings",
  crit: "Largest Critical Strikes",
  buffsteals: "Buffs Stolen",
  heals: "Heals on Allies",
  mitigated: "Damage Self-mitigated",
  turretdamage: "Turret Damage",
  turretplates: "Turret Plates",
} as const

export type StatKey = keyof typeof statList
