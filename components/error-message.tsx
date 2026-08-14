import { FaExclamationTriangle } from "react-icons/fa"

export function ErrorMessage({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl bg-blue-600 p-4 text-white">
        <FaExclamationTriangle size={30} />
      </div>
      <p className="max-w-xs text-center font-oswald text-lg font-semibold uppercase">
        {message ? message : "Please try again later"}
      </p>
    </div>
  )
}
