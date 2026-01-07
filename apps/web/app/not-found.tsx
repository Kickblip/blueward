import ErrorMessage from "@repo/ui/ErrorMessage"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <ErrorMessage code={404} message="The page you are looking for does not exist." />
    </div>
  )
}
