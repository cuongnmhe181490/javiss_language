import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";

export type SessionRole = "super_admin" | "admin" | "teacher" | "student";

export type SessionPayload = JWTPayload & {
  userId: string;
  email: string;
  status: string;
  roles: SessionRole[];
  fullName: string;
};

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signSession(payload: Omit<SessionPayload, "exp" | "iat">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifySession(token: string) {
  const verified = await jwtVerify<SessionPayload>(token, secret);
  return verified.payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
