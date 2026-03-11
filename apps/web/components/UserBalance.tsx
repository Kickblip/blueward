"use client"

import useSWR from "swr"
import { CrystalIcon } from "@repo/ui/icons"
import { toNumberWithCommas } from "@repo/ui/helpers"
import Loading from "@repo/ui/Loading"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch balance")
  return res.json() as Promise<{ balance: number }>
}

export default function UserBalance() {
  const { data, isLoading } = useSWR("/api/shop/balance", fetcher)

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5">
      <CrystalIcon size={14} />
      <span className="font-oswald text-sm">{isLoading ? <Loading size="small" /> : toNumberWithCommas(data?.balance ?? 0)}</span>
    </div>
  )
}
