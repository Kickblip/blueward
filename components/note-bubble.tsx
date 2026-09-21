"use client"

import { useState } from "react"
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa"
import { RiPencilFill } from "react-icons/ri"
import { toast } from "sonner"
import { Spinner } from "./ui/spinner"
import { MAX_NOTE_LENGTH } from "@/lib/config"

export function NoteBubble({
  puuid,
  note: initialNote,
  userOwnsProfile,
}: {
  puuid: string
  note: string | null
  userOwnsProfile: boolean
}) {
  const [note, setNote] = useState(initialNote)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialNote || "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (saving) return

    if (draft.length > MAX_NOTE_LENGTH) {
      toast.error(`Note must be shorter than ${MAX_NOTE_LENGTH} characters`)
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/player/${puuid}/note`, {
        method: "POST",
        body: JSON.stringify({ note: draft }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? "Could not save your note")
        return
      }

      setNote(result.note ?? null)
      setDraft(result.note ?? "")
      setEditing(false)
    } catch {
      toast.error("Could not save your note. Please try again")
    } finally {
      setSaving(false)
    }
  }

  return note && !editing ? (
    <div className="absolute -bottom-4 left-38 mr-4 flex items-center rounded-full bg-foreground">
      <div aria-hidden="true" className="absolute -top-4 left-0">
        <svg
          width="35"
          height="35"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="20" fill="currentColor" />
          <circle cx="26" cy="23" r="10" fill="currentColor" />
        </svg>
      </div>

      <p className="px-4 py-2 text-xs font-semibold wrap-anywhere text-background">
        {note}
      </p>

      {userOwnsProfile && (
        <button
          aria-label="Edit note"
          onClick={() => {
            setDraft(note ?? "")
            setEditing(true)
          }}
          className="absolute -top-3 -right-2 z-10 flex size-4 items-center justify-center rounded-full bg-foreground text-secondary hover:bg-foreground/90"
        >
          <RiPencilFill size={10} />
        </button>
      )}
    </div>
  ) : userOwnsProfile ? (
    <div className="absolute -bottom-4 left-38 mr-4 flex cursor-pointer items-center rounded-full bg-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 -left-3"
      >
        <svg
          width="35"
          height="35"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="20" fill="currentColor" />
          <circle cx="26" cy="23" r="10" fill="currentColor" />
        </svg>
      </div>

      {editing ? (
        <textarea
          autoFocus
          aria-label="Profile note"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_NOTE_LENGTH}
          className="resize-none bg-transparent px-4 py-2 text-xs font-medium text-background outline-none"
        />
      ) : (
        <button
          aria-label="Add a note"
          onClick={() => setEditing(true)}
          className="p-2 text-secondary"
        >
          {saving ? <Spinner /> : <FaPlus size={12} />}
        </button>
      )}

      {editing && (
        <div className="absolute -top-3 -right-2 z-10 flex gap-1">
          <button
            aria-label="Save note"
            onClick={() => handleSave()}
            className="flex size-6 items-center justify-center rounded-full bg-muted-foreground text-white hover:bg-muted-foreground/90"
          >
            <FaCheck size={12} />
          </button>

          <button
            aria-label="Cancel editing"
            onClick={() => {
              setDraft(note ?? "")
              setEditing(false)
            }}
            className="flex size-6 items-center justify-center rounded-full bg-muted-foreground text-white hover:bg-muted-foreground/90"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}
    </div>
  ) : null
}
