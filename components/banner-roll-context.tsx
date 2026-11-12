"use client"

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"

type BannerRollContextValue = {
  isRolling: boolean
  setIsRolling: Dispatch<SetStateAction<boolean>>
}

const BannerRollContext = createContext<BannerRollContextValue | null>(null)

export function BannerRollProvider({ children }: { children: ReactNode }) {
  const [isRolling, setIsRolling] = useState(false)

  return (
    <BannerRollContext.Provider value={{ isRolling, setIsRolling }}>
      {children}
    </BannerRollContext.Provider>
  )
}

export function useBannerRollContext() {
  const context = useContext(BannerRollContext)

  if (!context) {
    throw new Error(
      "useBannerRollContext must be used within a BannerRollProvider."
    )
  }

  return context
}
