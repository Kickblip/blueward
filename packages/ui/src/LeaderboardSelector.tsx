import Link from "next/link"
import Card from "./Card"

export default function LeaderboardSelector({
  statList,
  currentSlug,
}: {
  statList: Record<string, string>
  currentSlug: string
}) {
  return (
    <Card title="Leaderboards" subtitle="Select a leaderboard to view">
      <div className="flex flex-col gap-3 mt-2">
        {Object.entries(statList).map(([slug, label]) => (
          <Link
            href={`/leaderboard/${slug}`}
            key={slug}
            className={`
                font-semibold text-xl
                ${slug === currentSlug ? "text-blue-400" : "hover:text-blue-400 transition-colors duration-200"}    
            `}
          >
            {label}
          </Link>
        ))}
      </div>
    </Card>
  )
}
