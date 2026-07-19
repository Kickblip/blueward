export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="grid h-dvh place-items-center bg-secondary">
      <div className="rounded-md border bg-background p-4">{children}</div>
    </main>
  )
}
