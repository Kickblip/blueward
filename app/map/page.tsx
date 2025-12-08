import Image from "next/image"

const IMAGE_WIDTH = 2048
const IMAGE_HEIGHT = 1152

const points = [
  { id: 1, x: 567, y: 444 },
  { id: 2, x: 800, y: 600 },
  { id: 3, x: 1500, y: 900 },
  { id: 4, x: 400, y: 300 },
  { id: 5, x: 1700, y: 200 },
  { id: 6, x: 1200, y: 800 },
]

export default function Map() {
  return (
    <div className="relative">
      <Image
        src="/map_terrain3.jpg"
        alt="Map"
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        className="opacity-80 pointer-events-none aspect-video select-none"
      />

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_45px_40px_rgb(9,9,11)]" />

      {points.map((p) => (
        <div
          key={p.id}
          className="absolute h-3 w-3 rounded-full bg-blue-500 shadow
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
