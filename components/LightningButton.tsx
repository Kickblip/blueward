"use client"

import { setUnstableVariant } from "@/lib/helpers"
import { motion } from "motion/react"
import Link from "next/link"

export default function LightningButton({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/fightclub" onClick={() => setUnstableVariant(true)}>
      <motion.div
        className="
        relative overflow-hidden
        rounded-xl border border-red-400/80
        bg-gradient-to-b from-red-400 via-red-500 to-red-800
        px-8 py-2
        font-semibold tracking-wide text-red-50
        shadow-[0_0_30px_rgba(248,113,113,0.95)]
        cursor-pointer
      "
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 42px rgba(248,113,113,1)",
          filter: "brightness(1.25)",
        }}
        whileTap={{ scale: 0.97 }}
        animate={{
          scale: [1, 1.01, 0.995, 1],
          rotate: [0, -0.4, 0.3, 0],
          boxShadow: ["0 0 20px rgba(248,113,113,0.7)", "0 0 32px rgba(248,113,113,1)", "0 0 24px rgba(248,113,113,0.85)"],
        }}
        transition={{
          duration: 1.3,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        {/* Outer glow */}
        <motion.span
          className="pointer-events-none absolute inset-[-40%] rounded-[999px] blur-3xl bg-red-500/40"
          animate={{ opacity: [0.5, 0.9, 0.6] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Flash overlay for lightning bursts */}
        <motion.span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.38),transparent_55%)]"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{
            duration: 0.18,
            repeat: Infinity,
            repeatDelay: 1.4,
            ease: "easeOut",
          }}
        />

        {/* Left Lightning Bolt */}
        <motion.svg
          viewBox="0 0 24 40"
          className="pointer-events-none absolute -left-3 -top-4 h-20 w-12"
          style={{
            filter: "drop-shadow(0 0 10px rgba(250, 250, 210, 0.95))",
          }}
          animate={{
            opacity: [0, 0, 1, 1, 0],
            y: [0, 4, 6, 8, 10],
            x: [0, 2, 0, -1, -2],
          }}
          transition={{
            duration: 0.28,
            repeat: Infinity,
            repeatDelay: 1.3,
            ease: "easeOut",
          }}
        >
          {/* Jagged bolt path */}
          <motion.path
            d="M10 0 L4 16 H10 L2 40 L18 20 H12 L20 0 Z"
            fill="url(#left-bolt-fill)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={1.4}
            animate={{
              opacity: [0.4, 1, 0.8, 1],
            }}
            transition={{
              duration: 0.18,
              repeat: Infinity,
              repeatDelay: 1.3,
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="left-bolt-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Right Lightning Bolt */}
        <motion.svg
          viewBox="0 0 24 40"
          className="pointer-events-none absolute -right-3 -bottom-5 h-20 w-12"
          style={{
            filter: "drop-shadow(0 0 10px rgba(250, 250, 210, 0.95))",
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, -4, -8, -10],
            x: [0, -2, 1, 2],
          }}
          transition={{
            duration: 0.26,
            repeat: Infinity,
            repeatDelay: 1.9,
            ease: "easeOut",
          }}
        >
          <motion.path
            d="M14 40 L20 24 H14 L22 0 L6 20 H12 L4 40 Z"
            fill="url(#right-bolt-fill)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={1.4}
            animate={{
              opacity: [0.4, 1, 0.7, 1],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 1.9,
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="right-bolt-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef9c3" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Inner flicker line */}
        <motion.span
          className="pointer-events-none absolute inset-x-6 top-1 h-px bg-gradient-to-r from-transparent via-red-100 to-transparent"
          animate={{ opacity: [0.2, 0.8, 0.3] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          <span className="uppercase text-sm tracking-[0.25em]">{children}</span>
        </span>
      </motion.div>
    </Link>
  )
}
