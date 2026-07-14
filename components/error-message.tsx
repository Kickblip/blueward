import { FaExclamationTriangle } from "react-icons/fa"

export function ErrorMessage({
  code,
  message,
}: {
  code?: number | string
  message?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl bg-blue-600 p-4">
        <FaExclamationTriangle size={30} />
      </div>
      <h2 className="text-xl text-zinc-200">
        {code ? `${code}` : "Something went wrong"}
      </h2>
      <p className="max-w-xs text-center text-xs text-zinc-400">
        {message ? message : "Please try again later"}
      </p>
    </div>
  )
}
