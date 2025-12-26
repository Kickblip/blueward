type DonutChartProps = {
  value: number
  size?: number
  thickness?: number
  filledClassName?: string
  remainderClassName?: string
  trackClassName?: string
  startAngleDeg?: number
  className?: string
}

export default function DonutChart({
  value,
  size = 64,
  thickness = 10,
  filledClassName = "text-blue-500",
  remainderClassName = "text-rose-500",
  startAngleDeg = 270,
  className,
}: DonutChartProps) {
  const strokeWidth = Math.max(1, Math.min(thickness, size / 2))
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const filledDashoffset = c * (1 - value)

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {/* remainder arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={remainderClassName}
          style={{
            transformOrigin: "50% 50%",
            transform: `rotate(${startAngleDeg}deg)`,
          }}
        />

        {/* primary arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={filledClassName}
          strokeDasharray={c}
          strokeDashoffset={filledDashoffset}
          style={{
            transformOrigin: "50% 50%",
            transform: `rotate(${startAngleDeg}deg)`,
          }}
        />
      </svg>
    </div>
  )
}
