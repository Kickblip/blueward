"use client"

import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function DonutChart({ wins, losses }: { wins: number; losses: number }) {
  return (
    <ChartContainer
      config={{
        win: {
          label: "Wins",
          color: "#3b82f6",
        },
        loss: {
          label: "Losses",
          color: "#f43f5e",
        },
      }}
      className="mx-auto aspect-square h-30 w-30"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={[
            {
              type: "win",
              count: wins,
              fill: "var(--color-win)",
            },
            {
              type: "loss",
              count: losses,
              fill: "var(--color-loss)",
            },
          ]}
          dataKey="count"
          nameKey="type"
          innerRadius={25}
          startAngle={90}
          endAngle={-270}
        />
      </PieChart>
    </ChartContainer>
  )
}
