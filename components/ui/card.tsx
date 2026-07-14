import { cn } from "@/lib/utils"

export function Card({
  children,
  title,
  subtitle,
  className,
  style,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        `flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3`,
        className ? className : ""
      )}
      style={style}
    >
      {title || subtitle ? (
        <div className="flex items-center justify-between font-oswald">
          {title && (
            <h2 className="font-oswald text-sm font-semibold uppercase">
              {title}
            </h2>
          )}
          {subtitle && (
            <h2 className="font-oswald text-sm font-semibold uppercase">
              {subtitle}
            </h2>
          )}
        </div>
      ) : null}

      {children}
    </div>
  )
}
