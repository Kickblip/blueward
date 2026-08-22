"use client"

import { motion } from "framer-motion"
import { IoCloseSharp } from "react-icons/io5"

export function Carousel() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[52rem] z-0 h-20 overflow-hidden bg-pink-700 select-none"
    >
      <motion.div
        className="flex h-full w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 18,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex min-w-[100vw] shrink-0 items-center justify-around gap-8 px-8"
          >
            {Array.from({ length: 24 }).map((_, index) => (
              <IoCloseSharp
                key={index}
                className="size-16 shrink-0 text-[#E0DE0F]"
                strokeWidth={4}
              />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
