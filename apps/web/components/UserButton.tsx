"use client"

import { UserButton as UserButtonClerk } from "@clerk/nextjs"
import { SiRiotgames } from "react-icons/si"
import { safeSubstring } from "@repo/ui/helpers"
import { useClerk } from "@clerk/nextjs"
import { FaCircleUser, FaPlus } from "react-icons/fa6"

export default function UserButton({
  puuid,
  riotConnected,
  isAdmin,
}: {
  puuid: string | undefined
  riotConnected: boolean | null
  isAdmin: boolean | null
}) {
  /**
   *  Riot connected and puuid = profile claimed
   *  Riot connected no puuid = profile not claimed (their profile should be claimed automatically)
   *  Riot not connected = profile not claimed
   */
  const { openUserProfile } = useClerk()

  return (
    <div className="w-[2.7rem] h-[2.7rem] rounded-full border border-zinc-700 flex items-center justify-center">
      <UserButtonClerk
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
          },
        }}
      >
        <UserButtonClerk.MenuItems>
          {puuid && (
            <UserButtonClerk.Link
              label="My profile"
              href={`/player/${safeSubstring(puuid, 0, 20)}`}
              labelIcon={
                <span className="flex items-center justify-center w-4 h-4">
                  <FaCircleUser size={12} />
                </span>
              }
            />
          )}

          {!puuid && !riotConnected && (
            <UserButtonClerk.Action
              label="Connect a Riot account"
              labelIcon={
                <span className="flex items-center justify-center w-4 h-4">
                  <SiRiotgames size={13} />
                </span>
              }
              onClick={() => openUserProfile()}
            />
          )}

          {isAdmin && (
            <UserButtonClerk.Link
              label="Import game"
              href="/import"
              labelIcon={
                <span className="flex items-center justify-center w-4 h-4">
                  <FaPlus size={12} />
                </span>
              }
            />
          )}
        </UserButtonClerk.MenuItems>
      </UserButtonClerk>
    </div>
  )
}
