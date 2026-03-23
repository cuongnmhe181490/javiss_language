import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession, type SessionRole } from "@/lib/auth/session";
import { getStatusRedirect } from "@/lib/auth/status-redirect";

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRoles(roles: SessionRole[]) {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status !== "active") {
    redirect(getStatusRedirect(user.status));
  }

  if (!session.roles.some((role) => roles.includes(role))) {
    redirect("/dashboard");
  }

  return session;
}

export async function requireActiveStudentSession() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status !== "active") {
    redirect(getStatusRedirect(user.status));
  }

  return session;
}
