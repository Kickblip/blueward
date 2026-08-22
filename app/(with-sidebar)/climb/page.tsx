import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { BiSolidCrown } from "react-icons/bi"
import { Button } from "@/components/ui/button"
import { Carousel } from "./carousel"

export default function Page() {
  return (
    <>
      <section className="absolute inset-x-0 top-0 z-0 h-[52rem] bg-[#E0DE0F] md:rounded-t-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:rounded-t-xl"
        >
          {/* Bottom SVG */}
          <Image
            src="/climb/cracks.svg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Image directly above it */}
          <Image
            src="/climb/powder.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto grid h-full max-w-7xl grid-cols-2 gap-8 px-8 py-24">
          <div className="flex flex-col justify-between">
            {/* top left */}
            <div className="flex flex-col gap-4">
              <Image
                src="/climb/title.svg"
                alt="Climb Challenge"
                width={700}
                height={500}
              />
              <span className="font-oswald text-5xl font-semibold text-white">
                12:34:56
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                className="h-16 border-2 border-pink-400 bg-pink-700 font-oswald text-2xl font-semibold text-white uppercase shadow-[0_0_28px_rgba(219,39,119,0.65)] hover:bg-pink-600"
                size="lg"
              >
                Join the challenge
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Carousel />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 pt-[52rem]">
        <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
          <PodiumCard />
          <PodiumCard first />
          <PodiumCard />
        </div>

        <Image src="/podium.svg" alt="" width={512} height={512} />

        <Card className="-mt-40 h-96 w-full">
          <></>
        </Card>
      </div>
    </>
  )
}

function PodiumCard({ first = false }: { first?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${!first && "pt-16"}`}>
      {first && <BiSolidCrown className="size-6 text-yellow-500" />}

      <div className="relative mb-6 aspect-video w-full">
        <Image
          src={`/banners/compressed/5.webp`}
          alt=""
          fill
          className="rounded-md object-cover"
        />

        <div className="absolute top-full left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Avatar className="size-12">
            <AvatarImage src={"/defaultpfp.webp"} />
          </Avatar>
        </div>
      </div>
      <p className="font-oswald text-2xl font-semibold uppercase group-hover:text-chart-3 dark:group-hover:text-chart-1">
        Kickball
      </p>
      <div>
        <span className="font-oswald font-semibold">+200</span>{" "}
        <span className="text-xs font-medium uppercase">LP</span>
      </div>
    </div>
  )
}
