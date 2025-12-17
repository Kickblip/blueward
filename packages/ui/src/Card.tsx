import { cn } from "./cn"

export default function Card({
  children,
  title,
  subtitle,
  className,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        `flex flex-col gap-2 p-3
                bg-zinc-900 border border-zinc-800 rounded-md`,
        className ? className : "",
      )}
    >
      {title || subtitle ? (
        <div className="flex items-center justify-between font-oswald">
          {title && <h2 className="text-sm font-semibold uppercase font-oswald">{title}</h2>}
          {subtitle && <h2 className="text-sm font-semibold uppercase font-oswald">{subtitle}</h2>}
        </div>
      ) : null}

      {children}
    </div>
  )
}
