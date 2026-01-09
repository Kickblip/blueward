"use client"

import Card from "@repo/ui/Card"
import {
  MatchMetadata,
  ChampionIconAndLevel,
  SummonerSpells,
  Runes,
  Items,
  WardAndVisionScore,
  Username,
  BasicStatFormat,
  ImageWithLabel,
} from "@repo/ui/MatchHistoryWidgets"
import { toNumberWithCommas } from "@repo/ui/helpers"

import { VersusIcon, SwordIcon, WardIcon, HelmetIcon } from "@repo/ui/icons"
import { LuChartPie, LuLayoutList } from "react-icons/lu"
import { BsFire } from "react-icons/bs"
import { BiSolidBellRing } from "react-icons/bi"

import Image from "next/image"
import { useState } from "react"

const items = [1039, 1040, 2143, 1042, 2052, 2142]
const ward = 2055
const summonerSpells = [1, 3]
const championKey = "Olaf"
const championLevel = 15
const date = 1764350287
const kills = 10
const deaths = 2
const assists = 8
const cs = 150
const gameDuration = 1800
const visionScore = 20
const magicDamage = 5000
const physicalDamage = 18000
const trueDamage = 2000
const primaryTrait = 8000
const secondaryTrait = 8100
const crystals = 52257
const goldEarned = 13500
const pentaKills = 1

export default function ProfileMatch({ win }: { win: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="p-0">
      <div
        className="grid grid-cols-6 gap-4 items-center cursor-pointer p-2.5 pr-6 pl-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <MatchMetadata win={win} gameEndTimestamp={date} gameDuration={gameDuration} payout={crystals} />

        <div className="flex items-center gap-1">
          <ChampionIconAndLevel
            src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${championKey}_0.jpg`}
            championLevel={championLevel}
            championName={championKey}
            size={45}
          />
          <SummonerSpells spells={summonerSpells} size={21.5} />
          <Runes primaryTrait={primaryTrait} secondaryTrait={secondaryTrait} size={21.5} className="p-0.5" />
        </div>

        <BasicStatFormat
          title={`${kills} / ${deaths} / ${assists}`}
          subtitle={`${((kills + assists) / Math.max(1, deaths)).toFixed(1)} KDA`}
        />

        <BasicStatFormat title={`${cs} CS`} subtitle={`${(cs / (gameDuration / 60)).toFixed(1)}/min`} />

        <BasicStatFormat
          title={`${toNumberWithCommas(physicalDamage + magicDamage + trueDamage)}`}
          subtitle={`${((physicalDamage + magicDamage + trueDamage) / (gameDuration / 60)).toFixed(1)}/min`}
        />

        <div className="flex items-center gap-1">
          <Items
            srcs={items.map(
              (item) => `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`,
            )}
            size={30}
          />
          <WardAndVisionScore
            src={`${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${ward}.png`}
            visionScore={visionScore}
          />
        </div>
      </div>

      {isExpanded && <ExpandedMatchDetails />}
    </Card>
  )
}

export function ExpandedMatchDetails() {
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

      {activeView === "general" ? <GeneralView /> : <DetailsView />}
    </div>
  )
}

export function GeneralView() {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid grid-cols-7 gap-2 items-center text-center
                      bg-zinc-800 py-2
                      text-xs text-zinc-300"
      >
        <p className="col-span-2 text-left pl-4 text-blue-500 font-semibold text-sm">
          Victory <span className="text-zinc-200 font-normal text-xs">(Blue Team)</span>
        </p>
        <p>KDA</p>
        <p>Damage</p>
        <p>Gold</p>
        <p>CS</p>
        <p>Items</p>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ParticipantRow key={i} />
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-2 items-center text-center
                      bg-zinc-800 py-2
                      text-xs text-zinc-300"
      >
        <p className="col-span-2 text-left pl-4 text-rose-500 font-semibold text-sm">
          Defeat <span className="text-zinc-200 font-normal text-xs">(Red Team)</span>
        </p>
        <p>KDA</p>
        <p>Damage</p>
        <p>Gold</p>
        <p>CS</p>
        <p>Items</p>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ParticipantRow key={i} />
        ))}
      </div>
    </div>
  )
}

export function DetailsView() {
  const [playerIdx, setPlayerIdx] = useState(0)

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
              onClick={() => setPlayerIdx(idx)}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/Ashe_0.jpg`}
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
            <BasicStatFormat title="4" subtitle="Double" className="text-sm font-medium" />
            <BasicStatFormat title="2" subtitle="Triple" className="text-sm font-medium" />
            <BasicStatFormat title="1" subtitle="Quadra" className="text-sm font-medium" />
            <BasicStatFormat
              title={`${pentaKills}`}
              subtitle="Penta"
              className={`text-sm font-medium ${pentaKills > 0 ? "text-yellow-300" : ""}`}
            />
          </div>
        </Card>

        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <WardIcon size={20} className="text-yellow-200" />
            <span className="font-semibold font-oswald uppercase">Wards</span>
          </div>

          <div className="grid grid-cols-4">
            <BasicStatFormat title="13" subtitle="Placed" className="text-sm font-medium" />
            <BasicStatFormat title="5" subtitle="Killed" className="text-sm font-medium" />
            <BasicStatFormat title="4" subtitle="Control" className="text-sm font-medium" />
            <BasicStatFormat title="13" subtitle="Vision" className="text-sm font-medium" />
          </div>
        </Card>

        <Card className="gap-4">
          <div className="flex items-center gap-2">
            <HelmetIcon size={20} className="text-cyan-200" />
            <span className="font-semibold font-oswald uppercase">Damage</span>
          </div>

          <div className="grid grid-cols-3">
            <BasicStatFormat title={toNumberWithCommas(78000)} subtitle="Physical" className="text-sm font-medium" />
            <BasicStatFormat title={toNumberWithCommas(12000)} subtitle="Magic" className="text-sm font-medium" />
            <BasicStatFormat title={toNumberWithCommas(1500)} subtitle="True" className="text-sm font-medium" />
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

              <BasicStatFormat title="45" subtitle="casts" className="text-xs" />
              <BasicStatFormat title="23" subtitle="casts" className="text-xs" />
              <BasicStatFormat title="65" subtitle="casts" className="text-xs" />
              <BasicStatFormat title="12" subtitle="casts" className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ImageWithLabel src={`/spells/4.png`} size={30} label="D" />
              <ImageWithLabel src={`/spells/11.png`} size={30} label="F" />

              <BasicStatFormat title="23" subtitle="casts" className="text-xs" />
              <BasicStatFormat title="65" subtitle="casts" className="text-xs" />
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

            <BasicStatFormat title="45" subtitle="times" className="text-xs" />
            <BasicStatFormat title="23" subtitle="times" className="text-xs" />
            <BasicStatFormat title="65" subtitle="times" className="text-xs" />
            <BasicStatFormat title="12" subtitle="times" className="text-xs" />
            <BasicStatFormat title="65" subtitle="times" className="text-xs" />
            <BasicStatFormat title="12" subtitle="times" className="text-xs" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export function ParticipantRow() {
  return (
    <div className="grid grid-cols-7 gap-2 items-center text-center">
      <div className="flex items-center gap-1 col-span-2">
        <ChampionIconAndLevel
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/Ashe_0.jpg`}
          championLevel={15}
          championName={"Ashe"}
          size={40}
        />
        <SummonerSpells spells={summonerSpells} size={19} />
        <Runes primaryTrait={primaryTrait} secondaryTrait={secondaryTrait} size={19} className="p-0.5" />
        <Username username="PlayerOne" className="ml-2" />
      </div>

      <BasicStatFormat
        title={`${kills} / ${deaths} / ${assists}`}
        subtitle={`${((kills + assists) / Math.max(1, deaths)).toFixed(1)} KDA`}
        className="text-xs"
      />

      {/* <TotalDamage totalDamage={18000} gameDuration={1800} className="text-xs" /> */}
      <BasicStatFormat
        title={toNumberWithCommas(physicalDamage + magicDamage + trueDamage)}
        subtitle={`${((physicalDamage + magicDamage + trueDamage) / (gameDuration / 60)).toFixed(1)}/min`}
        className="text-xs"
      />

      <BasicStatFormat
        title={toNumberWithCommas(goldEarned)}
        subtitle={`${(goldEarned / (gameDuration / 60)).toFixed(1)}/min`}
        className="text-xs"
      />

      <BasicStatFormat title={`${cs} CS`} subtitle={`${(cs / (gameDuration / 60)).toFixed(1)}/min`} className="text-xs" />

      <div className="flex items-center">
        <Items
          srcs={[1055, 3006, 3085, 3031, 3046, 3153].map(
            (item) => `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`,
          )}
          size={20}
        />
        <WardAndVisionScore
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${ward}.png`}
          visionScore={visionScore}
          size={25}
        />
      </div>
    </div>
  )
}
