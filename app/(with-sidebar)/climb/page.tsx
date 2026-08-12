import { Card } from "@/components/ui/card"
import Image from "next/image"
import { CrystalIcon } from "@/lib/icons"
import { FaGift } from "react-icons/fa6"

export default function Page() {
  return (
    <div className="grid min-h-screen w-full grid-cols-3">
      <div className="col-span-2 flex flex-col items-center gap-8">
        <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
          <Card>
            <p className="font-oswald text-lg font-semibold uppercase">
              Kickball
            </p>
          </Card>
          <Card>
            <></>
          </Card>
          <Card>
            <></>
          </Card>
        </div>
        <Image src="/podium.svg" alt="" width={512} height={512} />

        <div className="-mt-40 flex h-96 w-full max-w-3xl flex-col gap-2 rounded-md border bg-secondary">
          <span className="w-fit rounded-full border border-yellow-600 bg-yellow-500 px-2 font-oswald text-xs font-semibold text-yellow-100">
            2556 RP
          </span>

          <span className="flex w-fit items-center gap-1 rounded-full border border-blue-600 bg-blue-500 px-2 font-oswald text-xs font-semibold text-blue-100">
            250,000 <CrystalIcon className="text-white" />
          </span>

          <span className="w-fit rounded-full border border-purple-600 bg-purple-500 px-2 font-oswald text-xs font-semibold text-purple-100 uppercase">
            Premium Exclusive Banner
          </span>

          <span className="w-fit rounded-full border border-emerald-600 bg-emerald-500 px-2 font-oswald text-xs font-semibold text-emerald-100 uppercase">
            Exclusive Banner
          </span>
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <h1 className="flex items-center gap-2 font-oswald text-2xl font-semibold uppercase">
          <FaGift className="size-6 text-chart-3 dark:text-chart-1" />
          <span>Prizes</span>
        </h1>

        <div className="flex items-center justify-between gap-4">
          <Image
            src="/badges/tournament/first.svg"
            alt=""
            width={64}
            height={64}
          />
          <div className="flex items-center gap-2 font-oswald text-3xl font-semibold uppercase italic">
            <span className="text-red-500 dark:text-red-400">4,000 RP</span>+
            <span className="flex items-center gap-2">
              450,000
              <CrystalIcon size={24} className="mt-1" />
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Image
            src="/badges/tournament/second.svg"
            alt=""
            width={64}
            height={64}
          />
          <span className="flex items-center gap-2 font-oswald text-3xl font-semibold uppercase italic">
            300,000
            <CrystalIcon size={24} className="mt-1" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Image
            src="/badges/tournament/third.svg"
            alt=""
            width={64}
            height={64}
          />
          <span className="flex items-center gap-2 font-oswald text-3xl font-semibold uppercase italic">
            150,000
            <CrystalIcon size={24} className="mt-1" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 font-oswald text-3xl font-semibold uppercase italic">
          <span>4th - 10th</span>
          <span className="flex items-center gap-2">
            30,000
            <CrystalIcon size={24} className="mt-1" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 font-oswald text-3xl font-semibold uppercase italic">
          <span>11th+</span>
          <span className="flex items-center gap-2">
            15,000
            <CrystalIcon size={24} className="mt-1" />
          </span>
        </div>
      </div>
    </div>
  )
}
