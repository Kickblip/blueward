import { cn } from "./cn"

export default function Card({
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
        `flex flex-col gap-2 p-3
                bg-zinc-900 border border-zinc-800 rounded-md`,
        className ? className : "",
      )}
      style={style}
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
