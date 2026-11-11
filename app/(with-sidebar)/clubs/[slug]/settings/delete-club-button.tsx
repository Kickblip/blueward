"use client"

import { useState } from "react"
import { deleteClub } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DeleteClubButton({
  slug,
  clubName,
}: {
  slug: string
  clubName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Delete Club
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-oswald font-semibold uppercase">
              Delete {clubName}?
            </DialogTitle>
            <DialogDescription>
              This permanently deletes the club, its memberships, match
              submissions, and all club images. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <form action={deleteClub.bind(null, slug)}>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive">
                Delete Club
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
