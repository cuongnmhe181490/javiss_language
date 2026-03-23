import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { env } from "@/config/env";

const adminPrefixes = ["/admin", "/api/admin"];
const dashboardPrefixes = ["/dashboard"];

async function getPayload(request: NextRequest) {
  const token = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const verified = await jwtVerify(token, secret);
    return verified.payload as { roles: string[] } | null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const payload = await getPayload(request);
  const { pathname } = request.nextUrl;

  if (adminPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const isAdmin = payload.roles?.some((role) => ["super_admin", "admin"].includes(role));
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (dashboardPrefixes.some((prefix) => pathname.startsWith(prefix)) && !payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (payload && ["/login", "/register"].includes(pathname)) {
    const isAdmin = payload.roles?.some((role) => ["super_admin", "admin"].includes(role));
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*", "/login", "/register"],
};
