import { Logo } from "@/components/logo"
import { Button, buttonVariants } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { RiRobot3Fill } from "react-icons/ri"
import { MdOutlineShuffleOn } from "react-icons/md"
import { IoSparkles } from "react-icons/io5"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <header className="flex items-center justify-between gap-4 p-2">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="icon-lg" asChild>
                <Link href="/">
                  <Logo className="size-8 text-primary [--logo-end:#ffffff] [--logo-start:#ffffff]" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit lobby</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="lg">
                <RiRobot3Fill className="size-6 text-chart-3 dark:text-chart-1" />
                <span className="font-oswald text-lg font-semibold uppercase">
                  Autobalance
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate teams automatically</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="lg">
                <MdOutlineShuffleOn className="size-6 text-chart-3 dark:text-chart-1" />
                <span className="font-oswald text-lg font-semibold uppercase">
                  Random pick
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select a random player from the pool</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="lg">
                <IoSparkles className="size-6 text-chart-3 dark:text-chart-1" />
                <span className="font-oswald text-lg font-semibold uppercase">
                  Predictions
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create and edit available prediction markets</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              "px-6! font-oswald text-lg! font-semibold uppercase",
              buttonVariants({ size: "lg" })
            )}
          >
            Team 1 picking
          </div>
        </div>
      </header>

      <section className="min-h-0 overflow-y-auto">{children}</section>

      <footer className="flex items-center gap-4 bg-secondary">
        <Button
          variant="secondary"
          className="rounded-none border-none bg-sidebar px-8 font-oswald text-lg font-semibold uppercase"
          size="lg"
        >
          Lobby 1
        </Button>
        <Button variant="outline" size="icon-xs">
          <PlusIcon />
        </Button>
      </footer>
    </main>
  )
}
