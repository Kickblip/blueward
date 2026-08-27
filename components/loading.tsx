import { Spinner } from "./ui/spinner"

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  )
}
