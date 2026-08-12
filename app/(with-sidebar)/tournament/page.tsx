import { BracketsManager } from "brackets-manager"
import { InMemoryDatabase } from "brackets-memory-db"
import { BracketViewer } from "./bracket-viewer"
import { StreamEmbed } from "@/components/stream-embed"
import Image from "next/image"

export default async function Page() {
  const manager = new BracketsManager(new InMemoryDatabase())

  await manager.create.stage({
    tournamentId: 0,
    name: "Hello World",
    type: "single_elimination",
    seeding: ["Blue Team", "Red Team", "Green Team", "Gold Team"],
  })

  const data = await manager.get.tournamentData(0)

  return (
    <main className="flex min-h-screen w-full flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[calc(max(70svh,36rem)+5rem)] overflow-hidden rounded-t-xl"
      >
        <Image
          src="/tournament.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/50" />
      </div>

      <section className="relative z-10 flex h-[max(70svh,36rem)] items-start px-4 sm:px-10">
        <StreamEmbed channel="longhorn_lol" />
      </section>

      <div className="flex items-center gap-2">
        <Image
          src="/badges/tournament/first.svg"
          alt=""
          width={32}
          height={32}
        />
        <Image
          src="/badges/tournament/second.svg"
          alt=""
          width={32}
          height={32}
        />
        <Image
          src="/badges/tournament/third.svg"
          alt=""
          width={32}
          height={32}
        />
      </div>

      <BracketViewer
        data={{
          stages: data.stage,
          matches: data.match,
          matchGames: data.match_game,
          participants: data.participant,
        }}
      />
    </main>
  )
}

// import { StreamEmbed } from "@/components/stream-embed"

// export default function Page() {
//   return (
//     <>
//       <StreamEmbed channel="ishowspeed"></StreamEmbed>
//     </>
//   )
// }
