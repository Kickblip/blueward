"use client"

import { Card } from "./ui/card"
import { type RecentMatchRow } from "@/app/(with-sidebar)/player/[pid]/actions"
import Link from "next/link"
import {
  MatchMetadata,
  ChampionIconAndLevel,
  SummonerSpells,
  Runes,
  Items,
  Username,
  BasicStatFormat,
  ImageWithLabel,
} from "./match-history-widgets"
import { toNumberWithCommas } from "@/lib/utils"
import { Spinner } from "./ui/spinner"

import { VersusIcon, SwordIcon, WardIcon, HelmetIcon } from "@/lib/icons"
import { LuChartPie, LuLayoutList } from "react-icons/lu"
import { BsFire } from "react-icons/bs"
import { BiSolidBellRing } from "react-icons/bi"

import Image from "next/image"
import { useState, useCallback } from "react"
import { ErrorMessage } from "./error-message"
import { safeSubstring } from "@/lib/utils"

type ParticipantRow = {
  puuid: string
  riotIdGameName: string
  riotIdTagline: string
  champLevel: number
  championName: string
  role: string
  kills: number
  deaths: number
  assists: number
  goldEarned: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  roleBoundItem: number
  summoner1Id: number
  summoner2Id: number
  magicDamageDealtToChampions: number
  physicalDamageDealtToChampions: number
  neutralMinionsKilled: number
  trueDamageDealtToChampions: number
  totalMinionsKilled: number
  win: boolean
  perkPrimary1Id: number
  perkSecondaryStyleId: number
  doubleKills: number
  tripleKills: number
  quadraKills: number
  pentaKills: number
  wardsPlaced: number
  controlWardsPlaced: number
  wardTakedowns: number
  visionScore: number
  spell1Casts: number
  spell2Casts: number
  spell3Casts: number
  spell4Casts: number
  summoner1Casts: number
  summoner2Casts: number
  assistMePings: number
  enemyMissingPings: number
  enemyVisionPings: number
  needVisionPings: number
  onMyWayPings: number
  pushPings: number
}

export function ProfileMatch({ match }: { match: RecentMatchRow }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<ParticipantRow[] | null>(
    null
  )

  const cs = match.totalMinionsKilled + match.neutralMinionsKilled
  const totalDamage =
    match.physicalDamageDealtToChampions +
    match.magicDamageDealtToChampions +
    match.trueDamageDealtToChampions

  const items = [
    match.item0,
    match.item1,
    match.item2,
    match.item3,
    match.item4,
    match.item5,
    match.roleBoundItem,
    match.item6,
  ]

  const onToggleExpanded = useCallback(async () => {
    const next = !isExpanded
    setIsExpanded(next)

    if (next && !participants && !isLoading) {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/match/${match.matchRowId}/participants`, {
          method: "GET",
          cache: "force-cache",
        })

        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = (await res.json()) as ParticipantRow[]
        setParticipants(data)
        console.log("Fetched participants:", data)
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load match details"
        )
      } finally {
        setIsLoading(false)
      }
    }
  }, [isExpanded, participants, isLoading, match.matchRowId])

  return (
    <Card className="p-0">
      <div
        className="grid cursor-pointer grid-cols-[minmax(7rem,1fr)_auto_repeat(3,minmax(5.5rem,1fr))_auto] items-center justify-items-center gap-x-4 px-6 py-2.5"
        onClick={onToggleExpanded}
      >
        <MatchMetadata
          win={match.win}
          gameEndTimestamp={match.gameEndTimestamp}
          gameDuration={match.gameDuration}
          payout={match.goldEarned}
          mmr={match.mmr}
        />

        <div className="flex items-center gap-1">
          <ChampionIconAndLevel
            src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${match.championName}_0.jpg`}
            championLevel={match.champLevel}
            championName={match.championName}
            size={45}
          />
          <SummonerSpells
            spells={[match.summoner1Id, match.summoner2Id]}
            size={21.5}
          />
          <Runes
            primaryTrait={match.perkPrimary1Id}
            secondaryTrait={match.perkSecondaryStyleId}
            size={21.5}
          />
        </div>

        <BasicStatFormat
          title={`${match.kills} / ${match.deaths} / ${match.assists}`}
          subtitle={`${((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(1)} KDA`}
        />

        <BasicStatFormat
          title={`${cs} CS`}
          subtitle={`${(cs / (match.gameDuration / 60)).toFixed(1)}/min`}
        />

        <BasicStatFormat
          title={`${toNumberWithCommas(totalDamage)} dmg`}
          subtitle={`${(totalDamage / (match.gameDuration / 60)).toFixed(1)}/min`}
        />

        <div className="rounded-md border-2 bg-foreground/90 p-1.5 dark:bg-background">
          <Items
            srcs={items.map((item) =>
              item === 0
                ? "/"
                : `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`
            )}
            size={20}
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Spinner />
            </div>
          )}
          {!isLoading && error && (
            <div className="p-4">
              <ErrorMessage message={error} />
            </div>
          )}
          {!isLoading && !error && participants && (
            <ExpandedMatchDetails
              participants={participants}
              gameDuration={match.gameDuration}
            />
          )}
        </>
      )}
    </Card>
  )
}

export function ExpandedMatchDetails({
  participants,
  gameDuration,
}: {
  participants: ParticipantRow[]
  gameDuration: number
}) {
  const [activeView, setActiveView] = useState<"general" | "details">("general")

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="grid grid-cols-2 items-center">
        <button
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-md py-3 ${activeView === "general" ? "bg-border" : ""}`}
          onClick={() => setActiveView("general")}
        >
          <LuLayoutList size={18} />
          <span className="font-oswald text-sm font-semibold uppercase">
            General
          </span>
        </button>
        <button
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-md py-3 ${activeView === "details" ? "bg-border" : ""}`}
          onClick={() => setActiveView("details")}
        >
          <LuChartPie size={18} />
          <span className="font-oswald text-sm font-semibold uppercase">
            Details
          </span>
        </button>
      </div>

      {activeView === "general" ? (
        <GeneralView participants={participants} gameDuration={gameDuration} />
      ) : (
        <DetailsView participants={participants} />
      )}
    </div>
  )
}

export function GeneralView({
  participants,
  gameDuration,
}: {
  participants: ParticipantRow[]
  gameDuration: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 items-center gap-2 py-2 text-center text-xs text-muted-foreground">
        <p className="col-span-2 flex items-center gap-2 pl-4 text-left">
          <span
            className={`text-sm font-semibold ${participants[0]?.win ? "text-blue-500" : "text-rose-500"}`}
          >
            {participants[0]?.win ? "Victory" : "Defeat"}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            (Blue Team)
          </span>
        </p>
        <p>KDA</p>
        <p>Damage</p>
        <p>Gold</p>
        <p>CS</p>
        <p>Items</p>
      </div>

      <div className="flex flex-col gap-2">
        {participants.slice(0, 5).map((participant, i) => (
          <ParticipantRow
            key={i + gameDuration}
            participant={participant}
            gameDuration={gameDuration}
          />
        ))}
      </div>

      <div className="grid grid-cols-7 items-center gap-2 py-2 text-center text-xs text-muted-foreground">
        <p className="col-span-2 flex items-center gap-2 pl-4 text-left">
          <span
            className={`text-sm font-semibold ${participants[5]?.win ? "text-blue-500" : "text-rose-500"}`}
          >
            {participants[5]?.win ? "Victory" : "Defeat"}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            (Red Team)
          </span>
        </p>
        <p>KDA</p>
        <p>Damage</p>
        <p>Gold</p>
        <p>CS</p>
        <p>Items</p>
      </div>

      <div className="flex flex-col gap-2">
        {participants.slice(5, 10).map((participant, i) => (
          <ParticipantRow
            key={i + 5 + gameDuration}
            participant={participant}
            gameDuration={gameDuration}
          />
        ))}
      </div>
    </div>
  )
}

export function DetailsView({
  participants,
}: {
  participants: ParticipantRow[]
}) {
  const [playerIdx, setPlayerIdx] = useState(0)
  const [participant, setParticipant] = useState<ParticipantRow>(
    participants[0]!
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-11">
        {Array.from({ length: 11 }, (_, col) => {
          if (col === 5) {
            return (
              <div key="vs" className="flex items-center justify-center">
                <VersusIcon size={40} />
              </div>
            )
          }

          const idx = col > 5 ? col - 1 : col // maps 0..4, then 5..9 after VS

          return (
            <button
              key={idx}
              className={`flex cursor-pointer items-center justify-center rounded-md p-1 px-3 transition-colors duration-200 hover:bg-border ${
                playerIdx === idx ? "bg-border" : ""
              }`}
              onClick={() => {
                setPlayerIdx(idx)
                setParticipant(participants[idx]!)
              }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${participants[idx]!.championName}_0.jpg`}
                alt=""
                width={45}
                height={45}
                className="rounded-md"
              />
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <SwordIcon
              size={20}
              className="text-emerald-600 dark:text-lime-200"
            />
            <span className="font-oswald font-semibold uppercase">
              Multikills
            </span>
          </div>

          <div className="grid grid-cols-4">
            <BasicStatFormat
              title={participant.doubleKills}
              subtitle="Double"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={participant.tripleKills}
              subtitle="Triple"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={participant.quadraKills}
              subtitle="Quadra"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={`${participant.pentaKills}`}
              subtitle="Penta"
              className={`text-sm font-medium ${participant.pentaKills > 0 ? "text-yellow-300" : ""}`}
            />
          </div>
        </Card>

        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <WardIcon
              size={20}
              className="text-amber-500 dark:text-yellow-200"
            />
            <span className="font-oswald font-semibold uppercase">Wards</span>
          </div>

          <div className="grid grid-cols-4">
            <BasicStatFormat
              title={participant.wardsPlaced}
              subtitle="Placed"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={participant.wardTakedowns}
              subtitle="Killed"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={participant.controlWardsPlaced}
              subtitle="Control"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={participant.visionScore}
              subtitle="Vision"
              className="text-sm font-medium"
            />
          </div>
        </Card>

        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <HelmetIcon
              size={20}
              className="text-blue-500 dark:text-cyan-200"
            />
            <span className="font-oswald font-semibold uppercase">Damage</span>
          </div>

          <div className="grid grid-cols-3">
            <BasicStatFormat
              title={toNumberWithCommas(
                participant.physicalDamageDealtToChampions
              )}
              subtitle="Physical"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={toNumberWithCommas(
                participant.magicDamageDealtToChampions
              )}
              subtitle="Magic"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={toNumberWithCommas(participant.trueDamageDealtToChampions)}
              subtitle="True"
              className="text-sm font-medium"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2">
            <BsFire size={20} className="text-red-600 dark:text-red-300" />
            <span className="font-oswald font-semibold uppercase">
              Spells Casted
            </span>
          </div>

          <div className="mx-auto flex items-center gap-8">
            <div className="grid grid-cols-4 gap-4">
              <Card className="flex h-8 w-8 items-center justify-center text-sm">
                Q
              </Card>
              <Card className="flex h-8 w-8 items-center justify-center text-sm">
                W
              </Card>
              <Card className="flex h-8 w-8 items-center justify-center text-sm">
                E
              </Card>
              <Card className="flex h-8 w-8 items-center justify-center text-sm">
                R
              </Card>

              <BasicStatFormat
                title={participant.spell1Casts}
                subtitle="casts"
                className="text-xs"
              />
              <BasicStatFormat
                title={participant.spell2Casts}
                subtitle="casts"
                className="text-xs"
              />
              <BasicStatFormat
                title={participant.spell3Casts}
                subtitle="casts"
                className="text-xs"
              />
              <BasicStatFormat
                title={participant.spell4Casts}
                subtitle="casts"
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageWithLabel src={`/spells/4.png`} size={30} label="D" />
              <ImageWithLabel src={`/spells/11.png`} size={30} label="F" />

              <BasicStatFormat
                title={participant.summoner1Casts}
                subtitle="casts"
                className="text-xs"
              />
              <BasicStatFormat
                title={participant.summoner2Casts}
                subtitle="casts"
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <BiSolidBellRing
              size={20}
              className="text-orange-600 dark:text-orange-200"
            />
            <span className="font-oswald font-semibold uppercase">Pings</span>
          </div>

          <div className="mx-auto grid grid-cols-6 gap-4">
            <Image
              src="/pings/pushPings.webp"
              alt="Vision Warded"
              width={30}
              height={30}
            />
            <Image
              src="/pings/onMyWayPings.webp"
              alt="Vision Cleared"
              width={30}
              height={30}
            />
            <Image
              src="/pings/enemyMissingPings.webp"
              alt="Enemy Missing"
              width={30}
              height={30}
            />
            <Image
              src="/pings/assistMePings.webp"
              alt="Assist Me"
              width={30}
              height={30}
            />
            <Image
              src="/pings/enemyVisionPings.webp"
              alt="On My Way"
              width={30}
              height={30}
            />
            <Image
              src="/pings/needVisionPings.webp"
              alt="Retreat"
              width={30}
              height={30}
            />

            <BasicStatFormat
              title={`${participant.pushPings}`}
              subtitle="times"
              className="text-xs"
            />
            <BasicStatFormat
              title={`${participant.onMyWayPings}`}
              subtitle="times"
              className="text-xs"
            />
            <BasicStatFormat
              title={`${participant.enemyMissingPings}`}
              subtitle="times"
              className="text-xs"
            />
            <BasicStatFormat
              title={`${participant.assistMePings}`}
              subtitle="times"
              className="text-xs"
            />
            <BasicStatFormat
              title={`${participant.enemyVisionPings}`}
              subtitle="times"
              className="text-xs"
            />
            <BasicStatFormat
              title={`${participant.needVisionPings}`}
              subtitle="times"
              className="text-xs"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

export function ParticipantRow({
  participant,
  gameDuration,
}: {
  participant: ParticipantRow
  gameDuration: number
}) {
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled
  const totalDamage =
    participant.physicalDamageDealtToChampions +
    participant.magicDamageDealtToChampions +
    participant.trueDamageDealtToChampions

  const items = [
    participant.item0,
    participant.item1,
    participant.item2,
    participant.item6,
    participant.item3,
    participant.item4,
    participant.item5,
    participant.roleBoundItem,
  ]

  return (
    <div className="grid grid-cols-7 items-center gap-2 text-center">
      <div className="col-span-2 flex items-center gap-1">
        <ChampionIconAndLevel
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${participant.championName}_0.jpg`}
          championLevel={participant.champLevel}
          championName={participant.championName}
          size={40}
        />
        <SummonerSpells
          spells={[participant.summoner1Id, participant.summoner2Id]}
          size={19}
        />
        <Runes
          primaryTrait={participant.perkPrimary1Id}
          secondaryTrait={participant.perkSecondaryStyleId}
          size={19}
        />
        <Link
          href={`/player/${safeSubstring(participant.puuid, 0, 20)}`}
          className="transition-colors duration-200 hover:text-blue-400"
        >
          <Username username={participant.riotIdGameName} className="ml-2" />
        </Link>
      </div>

      <BasicStatFormat
        title={`${participant.kills} / ${participant.deaths} / ${participant.assists}`}
        subtitle={`${((participant.kills + participant.assists) / Math.max(1, participant.deaths)).toFixed(1)} KDA`}
        className="text-xs"
      />

      <BasicStatFormat
        title={toNumberWithCommas(totalDamage)}
        subtitle={`${(totalDamage / (gameDuration / 60)).toFixed(1)}/min`}
        className="text-xs"
      />

      <BasicStatFormat
        title={toNumberWithCommas(participant.goldEarned)}
        subtitle={`${(participant.goldEarned / (gameDuration / 60)).toFixed(1)}/min`}
        className="text-xs"
      />

      <BasicStatFormat
        title={`${cs} CS`}
        subtitle={`${(cs / (gameDuration / 60)).toFixed(1)}/min`}
        className="text-xs"
      />

      <Items
        srcs={items.map((item) =>
          item === 0
            ? "/"
            : `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`
        )}
        size={20}
      />
    </div>
  )
}
