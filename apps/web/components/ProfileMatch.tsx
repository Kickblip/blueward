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
} from "@repo/ui/MatchHistoryWidgets"

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
  return (
    <Card>
      <div className="grid grid-cols-9 gap-4 items-center">
        <MatchMetadata win={win} gameMode={gameMode} gameEndTimestamp={date} gameDuration={gameDuration} payout={crystals} />
        <ChampionIconAndLevel
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${championKey}_0.jpg`}
          championLevel={championLevel}
          championName={championKey}
        />
        <div className="flex items-center gap-0.5">
          <SummonerSpells spells={summonerSpells} />
          <Runes primaryTrait={primaryTrait} secondaryTrait={secondaryTrait} />
        </div>
        <Items
          srcs={items.map(
            (item) => `${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${item}.png`,
          )}
        />
        <WardAndVisionScore
          src={`${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/item/${ward}.png`}
          visionScore={visionScore}
        />
        <KDA kills={kills} deaths={deaths} assists={assists} />
        <CS cs={cs} gameDuration={gameDuration} />
        <DamageBar
          magicDamage={magicDamage}
          physicalDamage={physicalDamage}
          trueDamage={trueDamage}
          totalDamage={totalDamage}
          gameDuration={gameDuration}
        />
      </div>
    </Card>
  )
}
