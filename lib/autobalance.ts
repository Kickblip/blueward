import type { playerSettings, players } from "@/lib/schema"

type PlayerSettings = typeof playerSettings.$inferSelect
type Player = typeof players.$inferSelect
type Rank = PlayerSettings["peakRank"]

export type AutobalanceRole = Exclude<
  PlayerSettings["rejectedRoles"][number],
  "FILL"
>

export type AutobalancePlayer = PlayerSettings &
  Pick<Player, "riotIdGameName" | "riotIdTagline">

export type AutobalanceTeam = Record<AutobalanceRole, AutobalancePlayer>

export type AutobalanceMatchup = {
  score: number
  team1: AutobalanceTeam
  team2: AutobalanceTeam
}

export type AutobalanceOptions = {
  players: AutobalancePlayer[]
  matchupCount?: number
  usePlayerPreferences?: boolean
}

const ROLES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"] as const

const SKILL_RANK_FIELDS = {
  TOP: "topSkillRank",
  JUNGLE: "jungleSkillRank",
  MIDDLE: "middleSkillRank",
  BOTTOM: "bottomSkillRank",
  UTILITY: "supportSkillRank",
} as const satisfies Record<AutobalanceRole, keyof PlayerSettings>

const RANK_SCORES: Record<Rank, number> = {
  IRON: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  EMERALD: 5,
  DIAMOND: 6,
  MASTER: 7,
  GRANDMASTER: 8,
  CHALLENGER: 9,
}

type ScoredPlayer = {
  player: AutobalancePlayer
  skills: Record<AutobalanceRole, number>
}

function scorePlayer(
  player: AutobalancePlayer,
  usePlayerPreferences: boolean
): ScoredPlayer {
  const seasonsWeight = 2 + player.seasonsSincePeak ** 2
  const overallSkill =
    (4 * RANK_SCORES[player.peakRank] +
      RANK_SCORES[player.currentRank] * seasonsWeight) /
    (4 + seasonsWeight)

  return {
    player,
    skills: Object.fromEntries(
      ROLES.map((role) => {
        const roleRank = RANK_SCORES[player[SKILL_RANK_FIELDS[role]] as Rank]
        const isUnavailable =
          roleRank === 0 ||
          player.rejectedRoles.includes(role) ||
          (usePlayerPreferences && player.dislikedRoles.includes(role))

        return [role, isUnavailable ? 0 : (2 * roleRank + overallSkill) / 3]
      })
    ) as Record<AutobalanceRole, number>,
  }
}

export function autobalance({
  players,
  matchupCount = 1,
  usePlayerPreferences = false,
}: AutobalanceOptions): AutobalanceMatchup[] {
  if (players.length !== 10) {
    throw new Error(
      `Autobalance requires exactly 10 players; received ${players.length}`
    )
  }

  if (!Number.isInteger(matchupCount) || matchupCount < 1) {
    throw new Error("matchupCount must be a positive integer")
  }

  const scoredPlayers = players.map((player) =>
    scorePlayer(player, usePlayerPreferences)
  )
  const chosenPlayerIndexes = Array<number>(10)
  const used = Array<boolean>(10).fill(false)
  const bestMatchups: AutobalanceMatchup[] = []
  const selectedScores = new Set<number>()

  function saveMatchup() {
    let matchScore = 0
    let laneMatchupDifferenceSum = 0

    ROLES.forEach((role, laneIndex) => {
      const team1 = scoredPlayers[chosenPlayerIndexes[laneIndex * 2]]
      const team2 = scoredPlayers[chosenPlayerIndexes[laneIndex * 2 + 1]]
      const laneScore = (team1.skills[role] - team2.skills[role]) ** 3
      matchScore += laneScore
      laneMatchupDifferenceSum += Math.abs(laneScore)
    })
    const score = matchScore ** 2 + 1e6 * laneMatchupDifferenceSum ** 2

    if (
      selectedScores.has(score) ||
      (bestMatchups.length === matchupCount &&
        score >= bestMatchups[bestMatchups.length - 1].score)
    ) {
      return
    }

    const team1 = {} as AutobalanceTeam
    const team2 = {} as AutobalanceTeam

    ROLES.forEach((role, laneIndex) => {
      team1[role] = scoredPlayers[chosenPlayerIndexes[laneIndex * 2]].player
      team2[role] = scoredPlayers[chosenPlayerIndexes[laneIndex * 2 + 1]].player
    })

    bestMatchups.push({
      score,
      team1,
      team2,
    })
    selectedScores.add(score)
    bestMatchups.sort((a, b) => a.score - b.score)

    if (bestMatchups.length > matchupCount) {
      selectedScores.delete(bestMatchups.pop()!.score)
    }
  }

  function assignPosition(position: number) {
    if (position === 10) {
      saveMatchup()
      return
    }

    const role = ROLES[Math.floor(position / 2)]

    for (
      let playerIndex = 0;
      playerIndex < scoredPlayers.length;
      playerIndex++
    ) {
      if (used[playerIndex] || scoredPlayers[playerIndex].skills[role] === 0) {
        continue
      }

      used[playerIndex] = true
      chosenPlayerIndexes[position] = playerIndex
      assignPosition(position + 1)
      used[playerIndex] = false
    }
  }

  assignPosition(0)
  return bestMatchups
}
