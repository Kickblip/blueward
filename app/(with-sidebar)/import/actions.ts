import { db } from "@/lib/db"
import { calculateMMR } from "./mmr"
import { BLUEWARD_VERSION, SUPPORT_PAYOUT_MULTIPLIER } from "@/lib/config"
import { calculateMatchXp } from "@/lib/level"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { and, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import * as z from "zod"
import {
  clubMembers,
  clubs,
  matches,
  matchSubmissions,
  playerPerformances,
  players,
  teamObjectives,
  transactions,
} from "@/lib/schema"
import { safeSubstring } from "@/lib/utils"

const submissionSchema = z.object({
  matchId: z.string().trim().min(1).max(32),
  clubId: z.coerce.number().int().positive(),
})

export const riotMatchSchema = z.looseObject({
  metadata: z.looseObject({
    matchId: z.string(),
    participants: z.array(z.string()),
  }),
  info: z.looseObject({
    gameEndTimestamp: z.number(),
    gameDuration: z.number(),
    gameMode: z.string(),
    gameType: z.string(),
    participants: z.array(
      z.looseObject({
        puuid: z.string(),
        riotIdGameName: z.string(),
        riotIdTagline: z.string(),
        championName: z.string(),
        kills: z.number(),
        deaths: z.number(),
        assists: z.number(),
      })
    ),
  }),
})

const reviewSchema = z.object({
  submissionId: z.coerce.number().int().positive(),
  decision: z.enum(["APPROVE", "REJECT"]),
})

type ImportTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function getClubReviewer(clubSlug: string) {
  const { userId } = await auth()
  if (!userId) return null

  const [reviewer] = await db
    .select({
      clubId: clubs.id,
      clubName: clubs.name,
      playerId: players.id,
    })
    .from(clubs)
    .innerJoin(clubMembers, eq(clubMembers.clubId, clubs.id))
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(
      and(
        eq(clubs.slug, clubSlug),
        eq(players.authId, userId),
        inArray(clubMembers.role, ["OWNER", "ADMIN"])
      )
    )
    .limit(1)

  return reviewer ?? null
}

export type SubmitMatchState = {
  error?: string
}

export async function submitMatch(
  _previousState: SubmitMatchState,
  formData: FormData
): Promise<SubmitMatchState> {
  "use server"

  const input = submissionSchema.safeParse({
    matchId: formData.get("matchId"),
    clubId: formData.get("clubId"),
  })

  if (!input.success) {
    return { error: "Invalid match submission." }
  }

  const { userId } = await auth()

  if (!userId) {
    return { error: "You must be signed in." }
  }

  const { matchId, clubId } = input.data

  const [membership] = await db
    .select({
      playerId: players.id,
      puuid: players.puuid,
    })
    .from(players)
    .innerJoin(clubMembers, eq(clubMembers.playerId, players.id))
    .where(and(eq(players.authId, userId), eq(clubMembers.clubId, clubId)))
    .limit(1)

  if (!membership) {
    return { error: "You are not a member of this club." }
  }

  const [existingMatch, existingSubmission] = await Promise.all([
    db.query.matches.findFirst({
      where: eq(matches.matchId, matchId),
      columns: { id: true },
    }),
    db.query.matchSubmissions.findFirst({
      where: eq(matchSubmissions.matchId, matchId),
      columns: { status: true },
    }),
  ])

  if (existingMatch) {
    return { error: "This match has already been imported." }
  }

  if (existingSubmission && existingSubmission.status !== "REJECTED") {
    return {
      error: `This match is already ${existingSubmission.status.toLowerCase()}.`,
    }
  }

  const client = await clerkClient()
  const provider = await client.users.getUserOauthAccessToken(
    userId,
    "custom_riot_games"
  )
  const riotToken = provider.data[0]?.token

  if (!riotToken) {
    return { error: "Connect your Riot account before submitting a match." }
  }

  const response = await fetchWithRetry(
    `${process.env.NEXT_PUBLIC_RIOT_RSO_API_ROOT!}/matches/${encodeURIComponent(matchId)}`,
    {
      headers: {
        Authorization: `Bearer ${riotToken}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    return { error: `Failed to fetch match from Riot (${response.status}).` }
  }

  const match = riotMatchSchema.safeParse(
    await response.json().catch(() => null)
  )

  if (!match.success || match.data.metadata.matchId !== matchId) {
    return { error: "Riot returned invalid match data." }
  }

  if (!match.data.metadata.participants.includes(membership.puuid)) {
    return { error: "You can only submit matches you participated in." }
  }

  const [submission] = await db
    .insert(matchSubmissions)
    .values({
      clubId,
      matchId,
      submittedByPlayerId: membership.playerId,
      rawMatch: match.data,
    })
    .onConflictDoUpdate({
      target: matchSubmissions.matchId,
      set: {
        clubId,
        submittedByPlayerId: membership.playerId,
        rawMatch: match.data,
        status: "PENDING",
        reviewedByPlayerId: null,
        reviewedAt: null,
        createdAt: new Date(),
      },
      setWhere: eq(matchSubmissions.status, "REJECTED"),
    })
    .returning({ id: matchSubmissions.id })

  if (!submission) {
    return { error: "This match has already been submitted." }
  }

  revalidatePath("/import")
  redirect(`/import?submitted=${submission.id}`)
}

export async function reviewMatchSubmission(formData: FormData) {
  "use server"

  const input = reviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    decision: formData.get("decision"),
  })

  if (!input.success) throw new Error("Invalid review decision.")

  const { userId } = await auth()
  if (!userId) throw new Error("You must be signed in.")

  const { submissionId, decision } = input.data

  const reviewed = await db.transaction(async (tx) => {
    const access = await getAuthorizedPendingSubmission(
      tx,
      submissionId,
      userId
    )

    if (!access) {
      throw new Error("Submission not found or you cannot review it.")
    }

    const match =
      decision === "APPROVE" ? riotMatchSchema.safeParse(access.rawMatch) : null

    if (match && !match.success) {
      throw new Error("Stored match data is invalid.")
    }

    const [claimed] = await tx
      .update(matchSubmissions)
      .set({
        status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedByPlayerId: access.reviewerPlayerId,
      })
      .where(
        and(
          eq(matchSubmissions.id, access.submissionId),
          eq(matchSubmissions.status, "PENDING")
        )
      )
      .returning({ id: matchSubmissions.id })

    if (!claimed) throw new Error("Submission has already been reviewed.")

    if (match?.success) {
      await importMatchJsonWithTx(tx, match.data)
    }

    return {
      clubSlug: access.clubSlug,
      puuids: match?.success ? match.data.metadata.participants : null,
    }
  })

  if (reviewed.puuids) revalidateImportedMatch(reviewed.puuids)
  revalidatePath(`/import/${reviewed.clubSlug}`)
  redirect(`/import/${reviewed.clubSlug}`)
}

async function getAuthorizedPendingSubmission(
  tx: ImportTransaction,
  submissionId: number,
  userId: string
) {
  const [submission] = await tx
    .select({
      submissionId: matchSubmissions.id,
      rawMatch: matchSubmissions.rawMatch,
      clubSlug: clubs.slug,
      reviewerPlayerId: players.id,
    })
    .from(matchSubmissions)
    .innerJoin(clubs, eq(clubs.id, matchSubmissions.clubId))
    .innerJoin(clubMembers, eq(clubMembers.clubId, clubs.id))
    .innerJoin(players, eq(players.id, clubMembers.playerId))
    .where(
      and(
        eq(matchSubmissions.id, submissionId),
        eq(matchSubmissions.status, "PENDING"),
        eq(players.authId, userId),
        inArray(clubMembers.role, ["OWNER", "ADMIN"])
      )
    )
    .limit(1)

  return submission ?? null
}

function revalidateImportedMatch(puuids: string[]) {
  revalidateTag("recent-games", "max")
  revalidateTag("top-players-by-mmr", "max")
  revalidatePath("/leaderboard/[stat]", "page")
  revalidatePath("/")

  for (const puuid of puuids) {
    revalidateTag(`recent-matches:${safeSubstring(puuid, 0, 20)}`, "max")
  }
}

export async function fetchWithRetry(
  url: string,
  opts: RequestInit,
  retries = 3
) {
  let res = await fetch(url, opts)

  for (let attempt = 1; res.status === 429 && attempt < retries; attempt++) {
    const retryAfter = Number(res.headers.get("retry-after") ?? "1")
    const delay = Number.isFinite(retryAfter) ? retryAfter * 1_000 : 1_000

    await new Promise((resolve) => setTimeout(resolve, delay))
    res = await fetch(url, opts)
  }

  return res
}

async function importMatchJsonWithTx(tx: ImportTransaction, m: any) {
  const matchRow = mapMatchRow(m)

  // ponytail: matchId uniqueness is the import guard; add idempotent writes only if partial retries are introduced.
  const [insertedMatch] = await tx
    .insert(matches)
    .values(matchRow)
    .returning({ id: matches.id })

  if (!insertedMatch) throw new Error("Failed to insert match.")
  const matchRowId = insertedMatch.id

  const performanceRows = mapPerformanceRows(m, matchRowId)

  await tx.insert(playerPerformances).values(performanceRows)

  const objectiveRows = mapObjectiveRows(m, matchRowId)

  await tx.insert(teamObjectives).values(objectiveRows)

  await upsertPlayersFromMatch(tx, m)

  await tx.execute(sql`
      insert into ${transactions} (player_id, type, match_row_id, amount)
      select
        ${players.id},
        'MATCH_EARN'::transaction_type,
        ${matchRowId},
        (
          case
            when ${playerPerformances.role} = 'UTILITY'::role
              then round(${playerPerformances.goldEarned} * (${SUPPORT_PAYOUT_MULTIPLIER}::numeric))
            else ${playerPerformances.goldEarned}::numeric
          end
        )::int
      from ${playerPerformances}
      join ${players} on ${players.puuid} = ${playerPerformances.puuid}
      where ${playerPerformances.matchRowId} = ${matchRowId}
  `)
}

async function upsertPlayersFromMatch(tx: ImportTransaction, m: any) {
  const info = m.info
  const participants = info.participants ?? []

  const rows = participants.map((p: any) => ({
    puuid: String(p.puuid),
    riotIdGameName: String(p.riotIdGameName),
    riotIdTagline: String(p.riotIdTagline),
    experience: calculateMatchXp(Number(info.gameDuration), Boolean(p.win)),
  }))

  await tx
    .insert(players)
    .values(rows)
    .onConflictDoUpdate({
      target: players.puuid,
      set: {
        riotIdGameName: sql`excluded.riot_id_game_name`,
        riotIdTagline: sql`excluded.riot_id_tagline`,
        experience: sql`${players.experience} + excluded.experience`,
      },
    })
}

function mapMatchRow(m: any) {
  const info = m.info

  return {
    matchId: String(m.metadata.matchId),
    players: m.metadata.participants,
    gameCreation: Number(info.gameCreation),
    gameStartTimestamp: Number(info.gameStartTimestamp),
    gameEndTimestamp: Number(info.gameEndTimestamp),
    gameDuration: Number(info.gameDuration),
    gameId: Number(info.gameId),
    gameMode: String(info.gameMode),
    gameType: String(info.gameType),
    gameVersion: String(info.gameVersion),
    bluewardVersion: BLUEWARD_VERSION,
  }
}

function mapPerformanceRows(m: any, matchRowId: number) {
  const info = m.info
  const participants = info.participants ?? []

  return participants.map((p: any) => {
    const ch = p.challenges ?? {}

    return {
      matchRowId,
      puuid: String(p.puuid),
      riotIdGameName: String(p.riotIdGameName),
      riotIdTagline: String(p.riotIdTagline),

      mmr: calculateMMR(p),

      champLevel: Number(p.champLevel),
      championId: Number(p.championId),
      championName: String(p.championName),
      profileIcon: Number(p.profileIcon),

      kills: Number(p.kills),
      deaths: Number(p.deaths),
      assists: Number(p.assists),
      killParticipation: Number(ch.killParticipation),

      assistMePings: Number(p.assistMePings),
      enemyMissingPings: Number(p.enemyMissingPings),
      enemyVisionPings: Number(p.enemyVisionPings),
      needVisionPings: Number(p.needVisionPings),
      onMyWayPings: Number(p.onMyWayPings),
      pushPings: Number(p.pushPings),

      role: String(p.teamPosition),
      doubleKills: Number(p.doubleKills),
      tripleKills: Number(p.tripleKills),
      quadraKills: Number(p.quadraKills),
      pentaKills: Number(p.pentaKills),
      killingSprees: Number(p.killingSprees),
      soloKills: Number(ch.soloKills),
      totalMinionsKilled: Number(p.totalMinionsKilled),
      teamDamagePercentage: Number(ch.teamDamagePercentage),
      buffsStolen: Number(ch.buffsStolen),

      wardsPlaced: Number(p.wardsPlaced),
      controlWardsPlaced: Number(ch.controlWardsPlaced),
      wardTakedowns: Number(ch.wardTakedowns),
      visionScore: Number(p.visionScore),

      spell1Casts: Number(p.spell1Casts),
      spell2Casts: Number(p.spell2Casts),
      spell3Casts: Number(p.spell3Casts),
      spell4Casts: Number(p.spell4Casts),
      summoner1Casts: Number(p.summoner1Casts),
      summoner2Casts: Number(p.summoner2Casts),

      totalHeal: Number(p.totalHeal),
      totalHealsOnTeammates: Number(p.totalHealsOnTeammates),
      totalDamageShieldedOnTeammates: Number(p.totalDamageShieldedOnTeammates),
      effectiveHealAndShielding: Number(
        Math.round(ch.effectiveHealAndShielding)
      ),

      damageTakenOnTeamPercentage: Number(ch.damageTakenOnTeamPercentage),
      epicMonsterSteals: Number(ch.epicMonsterSteals),
      firstTurretKilled: Boolean(ch.firstTurretKilled),

      jungleCsBefore10Minutes: Number(Math.round(ch.jungleCsBefore10Minutes)),
      killsNearEnemyTurret: Number(ch.killsNearEnemyTurret),
      laneMinionsFirst10Minutes: Number(ch.laneMinionsFirst10Minutes),
      scuttleCrabKills: Number(ch.scuttleCrabKills),
      survivedSingleDigitHpCount: Number(ch.survivedSingleDigitHpCount),
      turretPlatesTaken: Number(ch.turretPlatesTaken),
      turretTakedowns: Number(p.turretTakedowns),
      voidMonsterKill: Number(ch.voidMonsterKill),

      damageDealtToObjectives: Number(p.damageDealtToObjectives),
      damageDealtToTurrets: Number(p.damageDealtToTurrets),
      damageSelfMitigated: Number(p.damageSelfMitigated),

      firstBloodKill: Boolean(p.firstBloodKill),
      firstTowerAssist: Boolean(p.firstTowerAssist),
      firstTowerKill: Boolean(p.firstTowerKill),

      goldEarned: Number(p.goldEarned),
      inhibitorTakedowns: Number(p.inhibitorTakedowns),

      item0: Number(p.item0),
      item1: Number(p.item1),
      item2: Number(p.item2),
      item3: Number(p.item3),
      item4: Number(p.item4),
      item5: Number(p.item5),
      item6: Number(p.item6),
      roleBoundItem: Number(p.roleBoundItem),

      largestCriticalStrike: Number(p.largestCriticalStrike),
      largestKillingSpree: Number(p.largestKillingSpree),
      longestTimeSpentLiving: Number(p.longestTimeSpentLiving),

      magicDamageDealtToChampions: Number(p.magicDamageDealtToChampions),
      magicDamageTaken: Number(p.magicDamageTaken),
      neutralMinionsKilled: Number(p.neutralMinionsKilled),

      physicalDamageDealtToChampions: Number(p.physicalDamageDealtToChampions),
      physicalDamageTaken: Number(p.physicalDamageTaken),

      summoner1Id: Number(p.summoner1Id),
      summoner2Id: Number(p.summoner2Id),
      summonerLevel: Number(p.summonerLevel),
      teamId: Number(p.teamId),
      totalDamageTaken: Number(p.totalDamageTaken),

      totalTimeCCDealt: Number(p.totalTimeCCDealt),
      totalTimeSpentDead: Number(p.totalTimeSpentDead),

      trueDamageDealtToChampions: Number(p.trueDamageDealtToChampions),
      trueDamageTaken: Number(p.trueDamageTaken),

      turretKills: Number(p.turretKills),
      win: Boolean(p.win),

      perkPrimaryStyleId: Number(p.perks.styles[0].style),
      perkSecondaryStyleId: Number(p.perks.styles[1].style),

      perkStatOffense: Number(p.perks.statPerks.offense),
      perkStatFlex: Number(p.perks.statPerks.flex),
      perkStatDefense: Number(p.perks.statPerks.defense),

      perkPrimary1Id: Number(p.perks.styles[0].selections[0].perk),
      perkPrimary2Id: Number(p.perks.styles[0].selections[1].perk),
      perkPrimary3Id: Number(p.perks.styles[0].selections[2].perk),
      perkPrimary4Id: Number(p.perks.styles[0].selections[3].perk),

      perkSecondary1Id: Number(p.perks.styles[1].selections[0].perk),
      perkSecondary2Id: Number(p.perks.styles[1].selections[1].perk),
    }
  })
}

function mapObjectiveRows(m: any, matchRowId: number) {
  const teams = m.info.teams ?? []

  return teams.map((t: any) => ({
    matchRowId,
    teamId: Number(t.teamId),
    win: Boolean(t.win),

    baronFirst: Boolean(t.objectives.baron.first),
    baronKills: Number(t.objectives.baron.kills),

    championFirst: Boolean(t.objectives.champion.first),
    championKills: Number(t.objectives.champion.kills),

    dragonFirst: Boolean(t.objectives.dragon.first),
    dragonKills: Number(t.objectives.dragon.kills),

    hordeFirst: Boolean(t.objectives.horde.first),
    hordeKills: Number(t.objectives.horde.kills),

    inhibitorFirst: Boolean(t.objectives.inhibitor.first),
    inhibitorKills: Number(t.objectives.inhibitor.kills),

    riftHeraldFirst: Boolean(t.objectives.riftHerald.first),
    riftHeraldKills: Number(t.objectives.riftHerald.kills),

    towerFirst: Boolean(t.objectives.tower.first),
    towerKills: Number(t.objectives.tower.kills),
  }))
}
