import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { createLobby } from "./actions"

export default function Page() {
  return (
    <form action={createLobby}>
      <Button
        type="submit"
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/80"
      >
        <PlusIcon className="size-6!" />
        <span className="pl-1 font-oswald text-lg font-semibold uppercase">
          Create a lobby
        </span>
      </Button>
    </form>
  )
}
