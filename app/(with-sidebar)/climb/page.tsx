import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Avatar, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { BiSolidCrown } from "react-icons/bi"
import { Button } from "@/components/ui/button"
import { InfoIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
      <div className="relative flex w-full justify-center">
        <Image
          src="/devil/title.svg"
          alt=""
          className="my-4"
          width={325}
          height={325}
        />

        <div className="absolute top-4 right-0 z-30 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="font-oswald font-semibold uppercase"
              >
                <InfoIcon />
                Prizes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-oswald text-lg font-semibold uppercase">
                  Prizes
                </DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Button size="lg" className="font-oswald font-semibold uppercase">
            Join
          </Button>
        </div>
      </div>

      <div className="relative w-full">
        <Image
          src="/devil/face.svg"
          alt=""
          width={156}
          height={156}
          className="animate-wobble pointer-events-none absolute top-0 left-0 z-20 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="pointer-events-none absolute top-0 right-0 z-20 translate-x-1/2 -translate-y-1/2">
          <div className="flex items-start -space-x-3">
            <Image
              src="/devil/die.svg"
              alt=""
              width={48}
              height={48}
              className="animate-wobble -rotate-12"
            />

            <Image
              src="/devil/die.svg"
              alt=""
              width={48}
              height={48}
              className="animate-wobble mt-5 rotate-12"
            />
          </div>
        </div>

        <Image
          src="/devil/hand.svg"
          alt=""
          width={128}
          height={128}
          className="animate-wobble pointer-events-none absolute bottom-0 left-0 z-20 -translate-x-1/2 translate-y-1/2 scale-x-[-1] rotate-10"
        />

        {/* <Image
          src="/devil/hand.svg"
          alt=""
          width={128}
          height={128}
          className="animate-wobble pointer-events-none absolute right-0 bottom-0 z-20 translate-x-1/2 translate-y-1/2 -rotate-10"
        /> */}

        <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
          <PodiumCard />
          <PodiumCard first />
          <PodiumCard />
        </div>
      </div>

      <Image src="/devil/podium.svg" alt="" width={512} height={512} />

      <Card className="-mt-40 h-96 w-full">
        <></>
      </Card>
    </div>
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
