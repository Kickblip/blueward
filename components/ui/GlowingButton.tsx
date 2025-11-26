import Link from "next/link"

export default function GlowingButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-6 py-2 
            rounded-md border border-blue-400/40 
            bg-blue-500/10 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-transparent
            backdrop-blur-md
            shadow-[0_0_25px_rgba(59,130,246,0.45)]
            hover:bg-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.75)]
            transition-all duration-200"
    >
      {children}
    </Link>
  )
}
