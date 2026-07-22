import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { PlusIcon } from "lucide-react"
import { FaUsers } from "react-icons/fa"

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaUsers className="size-6 text-chart-3 dark:text-chart-1" />
          <h1 className="font-oswald text-2xl font-semibold uppercase">
            Clubs
          </h1>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="gap-1 px-4 font-oswald font-semibold uppercase"
            >
              <PlusIcon className="size-4" />
              Create new club
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Input placeholder="Club name" />

            <InputGroup>
              <InputGroupInput placeholder="Club name" disabled />
              <InputGroupAddon></InputGroupAddon>
            </InputGroup>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <></>
      </Card>
    </div>
  )
}
