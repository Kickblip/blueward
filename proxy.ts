import { clerkMiddleware } from "@clerk/nextjs/server"
import { updateSession } from "@/lib/supabase/proxy"

export default clerkMiddleware((_auth, request) => {
  const { pathname } = request.nextUrl

  // Supabase anonymous auth is currently only used by the room system
  if (pathname === "/room" || pathname.startsWith("/room/")) {
    return updateSession(request)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
