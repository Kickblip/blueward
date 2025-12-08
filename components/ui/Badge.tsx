import { cn } from "@/lib/cn"

export default function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "self-start inline-flex flex-row items-center rounded-full gap-1 " +
          "px-2.5 py-0.5 " +
          "border border-blue-200/40 " +
          "bg-blue-600 ",
        className ? className : "",
      )}
    >
      {children}
    </span>
  )
}
