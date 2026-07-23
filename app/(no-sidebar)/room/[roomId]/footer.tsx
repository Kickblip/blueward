"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useRoom } from "./room-context"

export function Footer() {
  const { lobbies, activeLobby, selectLobby, isOwner } = useRoom()

  return (
    <footer className="flex items-center gap-4 bg-secondary">
      {lobbies.map((lobby, idx) => (
        <Button
          key={lobby.id}
          variant="secondary"
          className="rounded-none border-none bg-sidebar px-8 font-oswald text-lg font-semibold uppercase"
          size="lg"
        >
          Lobby {idx + 1}
        </Button>
      ))}
      {isOwner && (
        <Button variant="outline" size="icon-xs">
          <PlusIcon />
        </Button>
      )}
    </footer>
  )
}
