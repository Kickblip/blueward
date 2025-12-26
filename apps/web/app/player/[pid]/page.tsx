import Card from "@repo/ui/Card"
import ProfileMatch from "@/components/ProfileMatch"
import Image from "next/image"
import DonutChart from "@repo/ui/DonutChart"
import { KDA } from "@repo/ui/MatchHistoryWidgets"

const championsAndWinrates = [
  { name: "Viego", played: 11, wins: 6, losses: 5, winrate: 0.545 },
  { name: "Kayn", played: 8, wins: 5, losses: 3, winrate: 0.625 },
  { name: "Yasuo", played: 7, wins: 3, losses: 4, winrate: 0.429 },
  { name: "Zed", played: 5, wins: 3, losses: 2, winrate: 0.6 },
]

export default async function PlayerProfile({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params

  return (
    <div className="grid grid-cols-3 gap-4 min-h-screen">
      <div className="col-span-1 flex flex-col gap-4">
        <Card className="p-0">
          <div className="relative">
            <Image
              src="/galio.webp"
              alt="player background"
              width={400}
              height={400}
              className="aspect-[5/2] w-full rounded-t-md object-cover object-center"
            />

            <div className="absolute -bottom-8 left-4 h-28 w-28 rounded-lg border-4 border-zinc-900 overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_BASE}/${process.env.NEXT_PUBLIC_PATCH_VERSION}/img/profileicon/5665.png`}
                alt="player avatar"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex gap-1 px-4 pt-10 mb-2 items-end">
            <p className="font-oswald scale-y-150 font-semibold text-4xl">Mrbob21</p>
            <p className="text-sm text-zinc-400">#1234</p>
          </div>

          <div className="flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DonutChart value={0.67} size={70} thickness={14} />
                <div className="flex flex-col">
                  <p className="text-zinc-200 font-semibold text-lg">72% WR</p>
                  <div className="text-sm text-zinc-400">56 Played</div>
                </div>
              </div>

              <KDA kills={8.5} deaths={6.2} assists={9.1} />
            </div>

            <div
              className="grid grid-cols-4 gap-2 items-center text-center
                            bg-zinc-800 py-2
                            text-xs text-zinc-300"
            >
              <p>Champion</p>
              <p>Played</p>
              <p>W-L</p>
              <p>Winrate</p>
            </div>

            <div className="flex flex-col gap-1">
              {championsAndWinrates.map((c, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-2 items-center text-zinc-200 font-semibold text-sm text-center justify-items-center"
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_CDN_BASE}/img/champion/tiles/${c.name}_0.jpg`}
                    alt=""
                    width={40}
                    height={40}
                  />
                  <p>{c.played}</p>

                  <p>
                    {c.wins}-{c.losses}
                  </p>

                  <p>{(c.winrate * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <ProfileMatch win={true} />
        <ProfileMatch win={true} />
        <ProfileMatch win={false} />
        <ProfileMatch win={false} />
        <ProfileMatch win={true} />
      </div>
    </div>
  )
}
