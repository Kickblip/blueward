"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export function Footer() {
  return (
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
  )
}
