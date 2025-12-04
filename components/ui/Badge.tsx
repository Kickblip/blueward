export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="self-start inline-flex flex-row items-center rounded-full gap-1
                px-2.5 py-0.5
                border border-blue-200/40
                bg-blue-600"
    >
      {children}
    </span>
  )
}
