"use client"

import Card from "@repo/ui/Card"
import { type RecentMatchRow } from "@/app/player/[pid]/actions"
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
} from "@repo/ui/MatchHistoryWidgets"
import { toNumberWithCommas } from "@repo/ui/helpers"

import { VersusIcon, SwordIcon, WardIcon, HelmetIcon } from "@repo/ui/icons"
import { LuChartPie, LuLayoutList } from "react-icons/lu"
import { BsFire } from "react-icons/bs"
import { BiSolidBellRing } from "react-icons/bi"
import Loading from "@repo/ui/Loading"

import Image from "next/image"
import { useState, useCallback } from "react"
import ErrorMessage from "@repo/ui/ErrorMessage"

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
  perkPrimaryStyleId: number
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

export default function ProfileMatch({ match }: { match: RecentMatchRow }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<ParticipantRow[] | null>(null)

  const cs = match.totalMinionsKilled + match.neutralMinionsKilled
  const totalDamage = match.physicalDamageDealtToChampions + match.magicDamageDealtToChampions + match.trueDamageDealtToChampions

  const items = [match.item0, match.item1, match.item2, match.item6, match.item3, match.item4, match.item5, match.roleBoundItem]

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
        setError(e instanceof Error ? e.message : "Failed to load match details")
      } finally {
        setIsLoading(false)
      }
    }
  }, [isExpanded, participants, isLoading, match.matchRowId])

  return (
    <Card className="p-0">
      <div className="grid grid-cols-6 gap-4 items-center cursor-pointer p-2.5 pr-6 pl-2" onClick={onToggleExpanded}>
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
          <SummonerSpells spells={[match.summoner1Id, match.summoner2Id]} size={21.5} />
          <Runes
            primaryTrait={match.perkPrimaryStyleId}
            secondaryTrait={match.perkSecondaryStyleId}
            size={21.5}
            className="p-0.5"
          />
        </div>

        <BasicStatFormat
          title={`${match.kills} / ${match.deaths} / ${match.assists}`}
          subtitle={`${((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(1)} KDA`}
        />

        <BasicStatFormat title={`${cs} CS`} subtitle={`${(cs / (match.gameDuration / 60)).toFixed(1)}/min`} />

        <BasicStatFormat
          title={`${toNumberWithCommas(totalDamage)} dmg`}
          subtitle={`${(totalDamage / (match.gameDuration / 60)).toFixed(1)}/min`}
        />

        <div className="flex items-center gap-1">
          <Items
            srcs={items.map((item) =>
              item === 0
                ? "/"
                : `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`,
            )}
            size={30}
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loading />
            </div>
          )}
          {!isLoading && error && (
            <div className="p-4">
              <ErrorMessage message={error} />
            </div>
          )}
          {!isLoading && !error && participants && (
            <ExpandedMatchDetails participants={participants} gameDuration={match.gameDuration} />
          )}
        </>
      )}
    </Card>
  )
}

export function ExpandedMatchDetails({ participants, gameDuration }: { participants: ParticipantRow[]; gameDuration: number }) {
  const [activeView, setActiveView] = useState<"general" | "details">("general")

  return (
    <div className="flex flex-col gap-4 pb-4 px-4">
      <div className="grid grid-cols-2 items-center">
        <button
          className={`flex items-center rounded-md justify-center gap-2 py-3 cursor-pointer ${activeView === "general" ? "bg-zinc-800" : "bg-zinc-900"}`}
          onClick={() => setActiveView("general")}
        >
          <LuLayoutList size={18} />
          <span className="text-sm font-oswald uppercase font-semibold">General</span>
        </button>
        <button
          className={`flex items-center rounded-md justify-center gap-2 py-3 cursor-pointer ${activeView === "details" ? "bg-zinc-800" : "bg-zinc-900"}`}
          onClick={() => setActiveView("details")}
        >
          <LuChartPie size={18} />
          <span className="text-sm font-oswald uppercase font-semibold">Details</span>
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

export function GeneralView({ participants, gameDuration }: { participants: ParticipantRow[]; gameDuration: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid grid-cols-7 gap-2 items-center text-center
                      bg-zinc-800 py-2
                      text-xs text-zinc-300"
      >
        <p className="col-span-2 text-left pl-4 flex items-center gap-2">
          <span className={`font-semibold text-sm ${participants[0]?.win ? "text-blue-500" : "text-rose-500"}`}>
            {participants[0]?.win ? "Victory" : "Defeat"}
          </span>
          <span className="text-zinc-200 font-normal text-xs">(Blue Team)</span>
        </p>
        <p>KDA</p>
        <p>Damage</p>
        <p>Gold</p>
        <p>CS</p>
        <p>Items</p>
      </div>

      <div className="flex flex-col gap-2">
        {participants.slice(0, 5).map((participant, i) => (
          <ParticipantRow key={i + gameDuration} participant={participant} gameDuration={gameDuration} />
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-2 items-center text-center
                      bg-zinc-800 py-2
                      text-xs text-zinc-300"
      >
        <p className="col-span-2 text-left pl-4 flex items-center gap-2">
          <span className={`font-semibold text-sm ${participants[5]?.win ? "text-blue-500" : "text-rose-500"}`}>
            {participants[5]?.win ? "Victory" : "Defeat"}
          </span>
          <span className="text-zinc-200 font-normal text-xs">(Red Team)</span>
        </p>
        <p>KDA</p>
        <p>Damage</p>
        <p>Gold</p>
        <p>CS</p>
        <p>Items</p>
      </div>

      <div className="flex flex-col gap-2">
        {participants.slice(5, 10).map((participant, i) => (
          <ParticipantRow key={i + 5 + gameDuration} participant={participant} gameDuration={gameDuration} />
        ))}
      </div>
    </div>
  )
}

export function DetailsView({ participants }: { participants: ParticipantRow[] }) {
  const [playerIdx, setPlayerIdx] = useState(0)
  const [participant, setParticipant] = useState<ParticipantRow>(participants[0]!)

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
              className={`p-1 px-3 rounded-md flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors duration-200 ${
                playerIdx === idx ? "bg-zinc-800" : ""
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
            <SwordIcon size={20} className="text-lime-200" />
            <span className="font-semibold font-oswald uppercase">Multikills</span>
          </div>

          <div className="grid grid-cols-4">
            <BasicStatFormat title={participant.doubleKills} subtitle="Double" className="text-sm font-medium" />
            <BasicStatFormat title={participant.tripleKills} subtitle="Triple" className="text-sm font-medium" />
            <BasicStatFormat title={participant.quadraKills} subtitle="Quadra" className="text-sm font-medium" />
            <BasicStatFormat
              title={`${participant.pentaKills}`}
              subtitle="Penta"
              className={`text-sm font-medium ${participant.pentaKills > 0 ? "text-yellow-300" : ""}`}
            />
          </div>
        </Card>

        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <WardIcon size={20} className="text-yellow-200" />
            <span className="font-semibold font-oswald uppercase">Wards</span>
          </div>

          <div className="grid grid-cols-4">
            <BasicStatFormat title={participant.wardsPlaced} subtitle="Placed" className="text-sm font-medium" />
            <BasicStatFormat title={participant.wardTakedowns} subtitle="Killed" className="text-sm font-medium" />
            <BasicStatFormat title={participant.controlWardsPlaced} subtitle="Control" className="text-sm font-medium" />
            <BasicStatFormat title={participant.visionScore} subtitle="Vision" className="text-sm font-medium" />
          </div>
        </Card>

        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <HelmetIcon size={20} className="text-cyan-200" />
            <span className="font-semibold font-oswald uppercase">Damage</span>
          </div>

          <div className="grid grid-cols-3">
            <BasicStatFormat
              title={toNumberWithCommas(participant.physicalDamageDealtToChampions)}
              subtitle="Physical"
              className="text-sm font-medium"
            />
            <BasicStatFormat
              title={toNumberWithCommas(participant.magicDamageDealtToChampions)}
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
            <BsFire size={20} className="text-red-300" />
            <span className="font-semibold font-oswald uppercase">Spells Casted</span>
          </div>

          <div className="flex items-center gap-8 mx-auto">
            <div className="grid grid-cols-4 gap-4">
              <Card className="flex items-center justify-center w-8 h-8 text-sm">Q</Card>
              <Card className="flex items-center justify-center w-8 h-8 text-sm">W</Card>
              <Card className="flex items-center justify-center w-8 h-8 text-sm">E</Card>
              <Card className="flex items-center justify-center w-8 h-8 text-sm">R</Card>

              <BasicStatFormat title={participant.spell1Casts} subtitle="casts" className="text-xs" />
              <BasicStatFormat title={participant.spell2Casts} subtitle="casts" className="text-xs" />
              <BasicStatFormat title={participant.spell3Casts} subtitle="casts" className="text-xs" />
              <BasicStatFormat title={participant.spell4Casts} subtitle="casts" className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageWithLabel src={`/spells/4.png`} size={30} label="D" />
              <ImageWithLabel src={`/spells/11.png`} size={30} label="F" />

              <BasicStatFormat title={participant.summoner1Casts} subtitle="casts" className="text-xs" />
              <BasicStatFormat title={participant.summoner2Casts} subtitle="casts" className="text-xs" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <BiSolidBellRing size={20} className="text-orange-200" />
            <span className="font-semibold font-oswald uppercase">Pings</span>
          </div>

          <div className="grid grid-cols-6 gap-4 mx-auto">
            <Image src="/pings/pushPings.webp" alt="Vision Warded" width={30} height={30} />
            <Image src="/pings/onMyWayPings.webp" alt="Vision Cleared" width={30} height={30} />
            <Image src="/pings/enemyMissingPings.webp" alt="Enemy Missing" width={30} height={30} />
            <Image src="/pings/assistMePings.webp" alt="Assist Me" width={30} height={30} />
            <Image src="/pings/enemyVisionPings.webp" alt="On My Way" width={30} height={30} />
            <Image src="/pings/needVisionPings.webp" alt="Retreat" width={30} height={30} />

            <BasicStatFormat title={`${participant.pushPings}`} subtitle="times" className="text-xs" />
            <BasicStatFormat title={`${participant.onMyWayPings}`} subtitle="times" className="text-xs" />
            <BasicStatFormat title={`${participant.enemyMissingPings}`} subtitle="times" className="text-xs" />
            <BasicStatFormat title={`${participant.assistMePings}`} subtitle="times" className="text-xs" />
            <BasicStatFormat title={`${participant.enemyVisionPings}`} subtitle="times" className="text-xs" />
            <BasicStatFormat title={`${participant.needVisionPings}`} subtitle="times" className="text-xs" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export function ParticipantRow({ participant, gameDuration }: { participant: ParticipantRow; gameDuration: number }) {
  const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled
  const totalDamage =
    participant.physicalDamageDealtToChampions + participant.magicDamageDealtToChampions + participant.trueDamageDealtToChampions

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
    <div className="grid grid-cols-7 gap-2 items-center text-center">
      <div className="flex items-center gap-1 col-span-2">
        <ChampionIconAndLevel
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${participant.championName}_0.jpg`}
          championLevel={participant.champLevel}
          championName={participant.championName}
          size={40}
        />
        <SummonerSpells spells={[participant.summoner1Id, participant.summoner2Id]} size={19} />
        <Runes
          primaryTrait={participant.perkPrimaryStyleId}
          secondaryTrait={participant.perkSecondaryStyleId}
          size={19}
          className="p-0.5"
        />
        <Link
          href={`/player/${participant.puuid.substring(0, 20)}`}
          className="hover:text-blue-400 transition-colors duration-200"
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

      <BasicStatFormat title={`${cs} CS`} subtitle={`${(cs / (gameDuration / 60)).toFixed(1)}/min`} className="text-xs" />

      <Items
        srcs={items.map((item) =>
          item === 0 ? "/" : `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`,
        )}
        size={20}
      />
    </div>
  )
}
