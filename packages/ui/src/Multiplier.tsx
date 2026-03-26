export default function Multiplier({ multiplier }: { multiplier: number }) {
  let colorClass = "text-blue-100"

  if (multiplier >= 15) colorClass = "text-yellow-400"
  else if (multiplier >= 10) colorClass = "text-blue-600"
  else if (multiplier >= 5) colorClass = "text-blue-500"
  else if (multiplier >= 3) colorClass = "text-blue-400"
  else if (multiplier >= 2) colorClass = "text-blue-300"
  else if (multiplier >= 1.5) colorClass = "text-blue-200"

  return <p className={`${colorClass} text-xs tabular-nums`}>{multiplier.toFixed(2)}×</p>
}
