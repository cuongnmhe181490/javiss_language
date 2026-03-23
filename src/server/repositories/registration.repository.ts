import { RegistrationStatus, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function findRegistrationById(id: string) {
  return prisma.registrationRequest.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      targetExam: true,
      preferredLanguage: true,
    },
  });
}

export async function listRegistrations(params?: {
  status?: RegistrationStatus;
  query?: string;
}) {
  return prisma.registrationRequest.findMany({
    where: {
      status: params?.status,
      OR: params?.query
        ? [
            { email: { contains: params.query, mode: "insensitive" } },
            { fullName: { contains: params.query, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      targetExam: true,
      preferredLanguage: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findLatestVerificationCode(userId: string) {
  return prisma.verificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findLatestAvailableVerificationCode(userId: string) {
  return prisma.verificationCode.findFirst({
    where: {
      userId,
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStudentEntitlements(userId: string) {
  const defaultPlan = await prisma.subscriptionPlan.findFirst({
    where: { isDefault: true },
  });

  if (!defaultPlan) {
    return null;
  }

  await prisma.userEntitlement.create({
    data: {
      userId,
      planId: defaultPlan.id,
      featureKey: "dashboard_access",
    },
  });

  await prisma.license.create({
    data: {
      userId,
      planId: defaultPlan.id,
      status: "active",
    },
  });

  return defaultPlan;
}

export async function ensureStudentRole(userId: string) {
  const role = await prisma.role.findUniqueOrThrow({
    where: { code: "student" },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
    },
  });
}

export async function createDefaultLearningArtifacts(userId: string) {
  const existingPlan = await prisma.studyPlan.findFirst({
    where: { userId },
  });

  if (!existingPlan) {
    await prisma.studyPlan.create({
      data: {
        userId,
        title: "Kế hoạch khởi động",
        summary: "Làm quen hệ thống, hoàn thiện hồ sơ và bắt đầu bài luyện đầu tiên.",
        nextAction: "Hoàn thiện hồ sơ học tập và bắt đầu bài Speaking đầu tiên.",
      },
    });
  }

  const existingSnapshot = await prisma.progressSnapshot.findFirst({
    where: { userId },
  });

  if (!existingSnapshot) {
    await prisma.progressSnapshot.create({
      data: {
        userId,
        overallProgress: 8,
        notes: "Mốc khởi tạo ban đầu cho học viên mới.",
      },
    });
  }
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}
