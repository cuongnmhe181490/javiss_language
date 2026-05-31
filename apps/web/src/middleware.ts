import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/curriculum(.*)",
  "/grammar(.*)",
  "/listening(.*)",
  "/reading(.*)",
  "/speaking(.*)",
  "/speaking-practice(.*)",
  "/demo-speaking(.*)",
  "/placement(.*)",
  "/dashboard(.*)",
  "/api/(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// When Clerk is not configured (keyless demo mode), skip auth entirely so the
// app runs without third-party credentials. The clerkMiddleware handler throws
// if invoked without a publishable key, so we avoid calling it at all.
export default function middleware(
  request: NextRequest,
  event: Parameters<typeof clerkHandler>[1],
) {
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
