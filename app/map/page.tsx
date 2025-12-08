"use client"

import Image from "next/image"
import { motion } from "motion/react"

const IMAGE_WIDTH = 2048
const IMAGE_HEIGHT = 1152

const points = [
  { id: 1, x: 567, y: 444 },
  { id: 2, x: 404, y: 682 },
  { id: 3, x: 312, y: 804 },
  { id: 4, x: 844, y: 588 },
]

const territories = [
  {
    id: 1,
    points: [
      [480, 400],
      [650, 390],
      [700, 500],
      [550, 520],
      [480, 460],
    ],
  },
  {
    id: 2,
    points: [
      [320, 650],
      [460, 650],
      [480, 730],
      [340, 780],
    ],
  },
  // add more territories...
]

export default function Map() {
  return (
    <div className="relative overflow-hidden">
      <Image
        src="/map_terrain.jpg"
        alt="Map"
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        className="opacity-80 pointer-events-none select-none"
      />

      <svg className="absolute inset-0" viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}>
        {territories.map((t) => (
          <polygon
            key={t.id}
            points={t.points.map(([x, y]) => `${x},${y}`).join(" ")}
            className="fill-red-500/25 stroke-slate-400/70 stroke-2 hover:fill-red-500/50 transition-colors duration-200"
          />
        ))}
      </svg>

      <motion.div
        className="
          pointer-events-none select-none absolute inset-0
          bg-[url('/clouds.jpg')]
          bg-repeat
          opacity-25
        "
        initial={{ backgroundPositionX: "0px" }}
        animate={{ backgroundPositionX: "-512px" }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_45px_40px_rgb(9,9,11)]" />

      {points.map((p) => (
        <div
          key={p.id}
          className="absolute z-20 h-3 w-3 rounded-full bg-blue-500 shadow
                     -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(p.x / IMAGE_WIDTH) * 100}%`,
            top: `${(p.y / IMAGE_HEIGHT) * 100}%`,
          }}
        >
          {p.id}
        </div>
      ))}
    </div>
  )
}
