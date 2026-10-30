export const ROOM_ROLES = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
] as const
export const ROOM_RANKS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const

export type RoomParticipant = {
  id: string
  displayName: string
  player: {
    id: number
    puuid: string
    riotIdGameName: string
    riotIdTagline: string
    experience: number
    bannerId: number
    avatarUrl: string | null
  } | null
  roles: (typeof ROOM_ROLES)[number][]
  rank: (typeof ROOM_RANKS)[number] | null
}

export type RoomSnapshot = {
  roomId: string
  ownerAuthId: string
  forceSignIn: boolean
  forceRankRoles: boolean
  dummies: RoomParticipant[]
  lobbies: {
    id: string
    ordinal: number
    phase: "OPEN" | "DRAFTING" | "READY" | "CLOSED"
    draftPickIndex: number
    players: {
      player: RoomParticipant
      teamId: 0 | 1
      isCaptain: boolean
    }[]
  }[]
}
