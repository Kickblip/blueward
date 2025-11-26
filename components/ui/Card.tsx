export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-2 p-3
        bg-zinc-900 border border-zinc-800 rounded-md"
    >
      {children}
    </div>
  )
}
