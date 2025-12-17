"use client"

import { motion } from "motion/react"
import { easeInOut } from "motion"

export default function Loading() {
  const transition = {
    duration: 0.6,
    ease: easeInOut,
    repeat: Infinity,
    repeatType: "reverse" as const,
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 441 575"
      width="441"
      height="575"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-20 w-20 stroke-zinc-50 [--fill-final:var(--color-zinc-200)] [--fill-initial:var(--color-zinc-950)]"
    >
      <motion.path
        initial={{ fill: "var(--fill-initial)" }}
        animate={{ fill: "var(--fill-final)" }}
        transition={transition}
        d="M318.436 573.696C318.436 573.696 104.854 593.328 67.8045 399.188C-19.3763 281.395 2.42227 119.974 2.42227 119.974C2.42227 119.974 150.617 148.332 170.232 229.042C170.232 229.042 176.77 222.498 192.026 213.773C207.282 205.047 213.825 205.047 213.825 205.047C296.642 41.4457 368.562 0 368.562 0C368.562 0 447.021 104.705 418.689 281.395C503.686 462.447 318.436 573.696 318.436 573.696Z"
      />
      <motion.path
        initial={{ fill: "var(--fill-final)" }}
        animate={{ fill: "var(--fill-initial)" }}
        transition={transition}
        d="M316.676 412.051C336.312 366.296 393.038 353.223 393.038 353.223C393.038 353.223 408.31 405.515 388.675 451.27C369.039 497.025 310.131 510.098 310.131 510.098C310.131 510.098 297.041 457.806 316.676 412.051Z"
      />
      <motion.path
        initial={{ fill: "var(--fill-final)" }}
        animate={{ fill: "var(--fill-initial)" }}
        transition={transition}
        d="M133.413 494.846C91.9591 457.806 94.1409 422.945 94.1409 422.945C94.1409 422.945 120.322 429.482 155.23 462.164C190.138 494.846 201.047 534.065 201.047 534.065C201.047 534.065 174.866 531.886 133.413 494.846Z"
      />
    </motion.svg>
  )
}
