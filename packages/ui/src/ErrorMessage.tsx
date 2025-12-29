import { FaExclamationTriangle } from "react-icons/fa"

export default function ErrorMessage({ code, message }: { code?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-blue-600 p-4 rounded-xl">
        <FaExclamationTriangle size={30} />
      </div>
      <h2 className="text-xl text-zinc-200">{code ? `Error: ${code}` : "Something went wrong"}</h2>
      <p className="text-zinc-400 text-xs max-w-xs text-center">{message ? message : "Please try again later"}</p>
    </div>
  )
}
