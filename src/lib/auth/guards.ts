import { redirect } from "next/navigation";
import { getSession, type SessionRole } from "@/lib/auth/session";

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRoles(roles: SessionRole[]) {
  const session = await requireSession();

  if (!session.roles.some((role) => roles.includes(role))) {
    redirect("/dashboard");
  }

  return session;
}
