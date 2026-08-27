"use server"

import { claimCurrentUsersProfile } from "@/lib/riot-rso"

export async function autoClaimRiotProfile() {
  return claimCurrentUsersProfile()
}
