"use client"

import Card from "@repo/ui/Card"
import {
  MatchMetadata,
  ChampionIconAndLevel,
  SummonerSpells,
  Runes,
  Items,
  WardAndVisionScore,
  KDA,
  CS,
  DamageBar,
  Username,
  GoldEarned,
  TotalDamage,
} from "@repo/ui/MatchHistoryWidgets"

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
const totalDamage = 25000
const magicDamage = 5000
const physicalDamage = 18000
const trueDamage = 2000
const gameMode = "Classic"
const primaryTrait = 8000
const secondaryTrait = 8100
const crystals = 52257

export default function ProfileMatch({ win }: { win: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="p-0">
      <div
        className="grid grid-cols-7 gap-4 items-center cursor-pointer p-4 pr-6 pl-2"
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

        <KDA kills={kills} deaths={deaths} assists={assists} />

        <CS cs={cs} gameDuration={gameDuration} />

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

        <DamageBar
          magicDamage={magicDamage}
          physicalDamage={physicalDamage}
          trueDamage={trueDamage}
          totalDamage={totalDamage}
          gameDuration={gameDuration}
        />
      </div>

      {isExpanded && <ExpandedMatchDetails />}
    </Card>
  )
}

export function ExpandedMatchDetails() {
  return (
    <div className="flex flex-col gap-4 pb-4 px-4">
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

      <KDA kills={5} deaths={3} assists={10} className="text-xs" />

      <TotalDamage totalDamage={18000} gameDuration={1800} className="text-xs" />

      <GoldEarned goldEarned={15000} gameDuration={gameDuration} className="text-xs" />

      <CS cs={200} gameDuration={1800} className="text-xs" />

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
