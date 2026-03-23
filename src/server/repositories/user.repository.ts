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
      entitlements: {
        include: {
          plan: true,
        },
      },
      licenses: {
        include: {
          plan: true,
        },
      },
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
      entitlements: {
        include: {
          plan: true,
        },
      },
      licenses: {
        include: {
          plan: true,
        },
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

export async function createAdminUser(input: {
  email: string;
  passwordHash: string;
  fullName: string;
}) {
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { code: "admin" },
  });

  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      status: "active",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: input.fullName,
          preferredLocale: "vi",
        },
      },
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
    include: {
      profile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function updateUserLearningProfile(input: {
  userId: string;
  fullName: string;
  currentLevel?: string;
  strongestSkills: string[];
  weakestSkills: string[];
  preferredStudyWindow?: string;
  onboardingNotes?: string;
  targetScore?: string;
  estimatedLevel?: string;
  preferredSchedule?: string;
  targetExamDate?: Date | null;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.userProfile.update({
      where: { userId: input.userId },
      data: {
        fullName: input.fullName,
        currentLevel: input.currentLevel || null,
        strongestSkills: input.strongestSkills,
        weakestSkills: input.weakestSkills,
        preferredStudyWindow: input.preferredStudyWindow || null,
        onboardingNotes: input.onboardingNotes || null,
      },
    });

    const latestGoal = await tx.goal.findFirst({
      where: { userId: input.userId },
      orderBy: { createdAt: "desc" },
    });

    if (latestGoal) {
      await tx.goal.update({
        where: { id: latestGoal.id },
        data: {
          targetScore: input.targetScore || null,
          estimatedLevel: input.estimatedLevel || null,
          preferredSchedule: input.preferredSchedule || null,
          targetExamDate: input.targetExamDate ?? null,
        },
      });
    }

    return tx.user.findUnique({
      where: { id: input.userId },
      include: {
        profile: true,
        goals: {
          include: {
            exam: true,
            language: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });
}
