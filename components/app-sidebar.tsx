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
import { Show, SignOutButton } from "@clerk/nextjs"
import { HiMiniSparkles } from "react-icons/hi2"
import {
  FaUsers,
  FaUser,
  FaSignOutAlt,
  FaShoppingCart,
  FaCloudUploadAlt,
} from "react-icons/fa"
import { IoPodium } from "react-icons/io5"
import { PlusIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { SignIn } from "./sign-in"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { currentUser } from "@clerk/nextjs/server"
import { Skeleton } from "./ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { IoMdSettings } from "react-icons/io"
import { safeSubstring } from "@/lib/utils"

export async function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: Awaited<ReturnType<typeof currentUser>>
}) {
  const value = user?.privateMetadata.puuid
  const puuid = typeof value === "string" ? value : undefined

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
                  tooltip="Create a room"
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                >
                  <Link href="/room">
                    <PlusIcon className="size-6!" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Create a room
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  variant="outline"
                  size="lg"
                  tooltip="Add a match"
                >
                  <Link href="/import" prefetch={false}>
                    <FaCloudUploadAlt className="size-6! text-chart-3 dark:text-chart-1" />
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Import Match
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip="Profile">
                    <Avatar className="size-8!">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback>
                        <Skeleton className="h-full w-full rounded-full" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="pl-1 font-oswald text-lg font-semibold uppercase group-data-[collapsible=icon]:sr-only">
                      Profile
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuGroup>
                    {puuid && (
                      <DropdownMenuItem
                        className="cursor-pointer gap-4"
                        asChild
                      >
                        <Link href={`/player/${safeSubstring(puuid, 0, 20)}`}>
                          <FaUser className="ml-0.5 size-3 text-chart-3 dark:text-chart-1" />
                          <span className="ml-0.5 font-oswald text-sm font-semibold uppercase">
                            My Profile
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="cursor-pointer gap-4" asChild>
                      <Link href="/settings">
                        <IoMdSettings className="text-chart-3 dark:text-chart-1" />
                        <span className="font-oswald text-sm font-semibold uppercase">
                          Settings
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <SignOutButton>
                      <DropdownMenuItem className="cursor-pointer gap-4">
                        <FaSignOutAlt className="text-chart-3 dark:text-chart-1" />
                        <span className="font-oswald text-sm font-semibold uppercase">
                          Sign out
                        </span>
                      </DropdownMenuItem>
                    </SignOutButton>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
