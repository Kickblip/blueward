"use client"

import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "./logo"
import { UserButton } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"
import { Show } from "@clerk/nextjs"

import { HiMiniSparkles } from "react-icons/hi2"
import { FaShoppingCart } from "react-icons/fa"
import { FaUsers, FaUser } from "react-icons/fa"
import { IoPodium } from "react-icons/io5"
import { PlusIcon } from "lucide-react"
import { buttonVariants } from "./ui/button"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { SignIn } from "./sign-in"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <Logo className="size-8!" />
                <span className="pointer-events-none font-oswald text-2xl font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                  Blueward
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Leaderboards">
                  <Link href="/leaderboard/kills">
                    <IoPodium className="size-6! text-chart-3 dark:text-chart-1" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Leaderboards
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Shop">
                  <Link href="/shop">
                    <FaShoppingCart className="size-6! text-chart-3 dark:text-chart-1" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Shop
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Predictions">
                  <Link href="/predictions">
                    <HiMiniSparkles className="size-6! text-chart-3 dark:text-chart-1" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Predictions
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" tooltip="Clubs">
                  <Link href="/clubs">
                    <FaUsers className="size-6! text-chart-3 dark:text-chart-1" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Clubs
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  tooltip="Create a lobby"
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                >
                  <Link href="/lobby">
                    <PlusIcon className="size-6!" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Create a lobby
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip="Sign in">
                    <FaUser className="size-6! text-chart-3 dark:text-chart-1" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Sign in
                    </span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <SignIn />
                </DialogContent>
              </Dialog>
            </Show>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
