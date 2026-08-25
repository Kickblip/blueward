"use client"

import useSWR from "swr"
import { CrystalIcon } from "@/lib/icons"
import { timestampToRelativeTime, toNumberWithCommas } from "@/lib/utils"
import { Spinner } from "./ui/spinner"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { TRANSACTION_TYPES } from "@/lib/config"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

type Transaction = {
  id: number
  createdAt: string
  type: string
  amount: number
}

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) throw new Error("Request failed")

  return response.json()
}

export function UserBalance() {
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useSWR<{ balance: number }>(
    "/api/shop/balance",
    fetcher
  )

  const {
    data: transactionData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useSWR<{ transactions: Transaction[] }>(
    open ? "/api/shop/balance/transactions" : null,
    fetcher
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="lg">
              <CrystalIcon size={14} />
              <span className="font-oswald text-sm">
                {isLoading ? (
                  <Spinner />
                ) : (
                  toNumberWithCommas(data?.balance ?? 0)
                )}
              </span>
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>View transaction history</TooltipContent>
      </Tooltip>
      <PopoverContent align="end">
        {transactionsLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        ) : transactionsError ? (
          <p className="text-sm text-muted-foreground">
            Could not load transactions.
          </p>
        ) : transactionData?.transactions.length ? (
          <>
            {transactionData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between">
                <div className="flex items-end gap-1">
                  <span className="font-oswald font-semibold uppercase">
                    {
                      TRANSACTION_TYPES[
                        transaction.type as keyof typeof TRANSACTION_TYPES
                      ]
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timestampToRelativeTime(transaction.createdAt)}
                  </span>
                </div>

                <span
                  className={`flex items-center gap-1 font-oswald font-semibold uppercase ${transaction.amount > 0 ? "text-chart-2 dark:text-blue-100" : "text-destructive"}`}
                >
                  {transaction.amount > 0 && "+"}
                  {toNumberWithCommas(transaction.amount)}
                  <CrystalIcon size={14} />
                </span>
              </div>
            ))}

            {/* <Button
              size="lg"
              className="mt-1 font-oswald font-semibold uppercase"
            >
              View All
            </Button> */}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
