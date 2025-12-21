import Footer from "./Footer"

export default function MainContentFrame({ Navbar, children }: { Navbar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 min-h-screen flex flex-col">
      {Navbar}

      <div
        className="flex-1 mx-2 mb-2 p-4 rounded-lg bg-zinc-950 
                        border border-zinc-800"
      >
        <div className="w-full max-w-7xl mx-auto">{children}</div>
      </div>

      <div className="mt-2">
        <Footer />
      </div>
    </div>
  )
}
