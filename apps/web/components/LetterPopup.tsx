"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export default function LetterPopup({ src }: { src: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-2 left-6 cursor-pointer">
        <motion.div
          animate={open ? { x: 0 } : { x: [-2, 2] }}
          transition={{
            duration: 0.45,
            repeat: open ? 0 : Infinity,
            repeatType: "mirror",
            ease: "linear",
          }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white/20 blur-xl" />
          <Image
            src="/gift.webp"
            alt="Gift Letter"
            width={60}
            height={60}
            className="h-[60px] w-[60px] object-contain"
            priority
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-[90vw] max-w-[520px] aspect-[3/4]"
              initial={{ y: "100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={src} alt="Letter" fill sizes="90vw" className="object-contain" priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
