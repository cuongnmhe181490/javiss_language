import { prisma } from "@/lib/db/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      roles: {
        include: {
          role: true,
        },
      },
      goals: {
        include: {
          exam: true,
          language: true,
        },
        orderBy: { createdAt: "desc" },
      },
      studyPlans: {
        orderBy: { createdAt: "desc" },
      },
      snapshots: {
        orderBy: { createdAt: "desc" },
      },
      entitlements: true,
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      roles: {
        include: {
          role: true,
        },
      },
      goals: {
        include: {
          exam: true,
          language: true,
        },
        orderBy: { createdAt: "desc" },
      },
      studyPlans: {
        orderBy: { createdAt: "desc" },
      },
      snapshots: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function listUsers(query?: string) {
  return prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { profile: { fullName: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      profile: true,
      roles: { include: { role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
