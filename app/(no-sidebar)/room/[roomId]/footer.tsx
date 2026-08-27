"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useRoom } from "./room-context"
import { useTransition } from "react"
import { createLobby } from "./actions"

export function Footer() {
  const { roomId, lobbies, activeLobby, selectLobby, isOwner } = useRoom()

  const [isCreatingLobby, startTransition] = useTransition()

  function handleCreateLobby() {
    startTransition(async () => {
      const lobbyId = await createLobby(roomId)
      selectLobby(lobbyId)
    })
  }

  return (
    <footer className="flex items-center bg-secondary">
      {lobbies.map((lobby) => (
        <Button
          key={lobby.id}
          variant={activeLobby?.id === lobby.id ? "default" : "secondary"}
          className="rounded-none border-none px-8 font-oswald text-lg font-semibold uppercase"
          size="lg"
          onClick={() => selectLobby(lobby.id)}
        >
          Lobby {lobby.ordinal}
        </Button>
      ))}

      {isOwner && (
        <Button
          variant="outline"
          size="icon-xs"
          disabled={isCreatingLobby}
          aria-label="Create lobby"
          onClick={handleCreateLobby}
          className="ml-4"
        >
          <PlusIcon />
        </Button>
      )}
    </footer>
  )
}
