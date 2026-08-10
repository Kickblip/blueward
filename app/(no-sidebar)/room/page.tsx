import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { createRoom } from "./actions"

export default function Page() {
  return (
    <form action={createRoom}>
      <Button type="submit" size="lg">
        <PlusIcon className="size-6!" />
        <span className="pl-1 font-oswald text-lg font-semibold uppercase">
          Create a room
        </span>
      </Button>
    </form>
  )
}
