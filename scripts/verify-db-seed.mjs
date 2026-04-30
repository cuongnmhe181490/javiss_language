import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), "apps/api/.env"));

if (!process.env.DATABASE_URL && process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL or TEST_DATABASE_URL is required for db:verify.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const expected = {
  tenantAlphaId: "11111111-1111-4111-8111-111111111111",
  tenantAlphaSlug: "javiss-global-hospitality",
  tenantBetaId: "22222222-2222-4222-8222-222222222222",
  tenantBetaSlug: "kansai-retail-language-lab",
  adminEmail: "tenant.admin@example.test",
  learnerEmail: "learner@example.test",
  auditorEmail: "security.auditor@example.test",
  superAdminEmail: "super.admin@example.test",
  courseAlphaId: "44444444-4444-4444-8444-444444444444",
  courseBetaId: "55555555-5555-4555-8555-555555555555",
  lessonAlphaOneId: "99999999-9999-4999-8999-999999999991",
  tutorAgentAlphaId: "17171717-1717-4171-8171-171717171711",
  speakingSessionAlphaId: "19191919-1919-4191-8191-191919191911",
  contentSourceAlphaId: "20202020-2020-4202-8202-202020202011",
  contentItemAlphaId: "21212121-2121-4212-8212-212121212111",
};

try {
  const [
    tenantCount,
    userCount,
    membershipCount,
    auditCount,
    stepUpCount,
    courseCount,
    lessonCount,
    assignmentCount,
    aiAgentCount,
    promptVersionCount,
    speakingSessionCount,
    speakingTranscriptCount,
    contentSourceCount,
    contentItemCount,
    contentVersionCount,
    tenantAlpha,
    tenantBeta,
    courseAlpha,
    courseBeta,
    lessonAlphaOne,
    tutorAgentAlpha,
    speakingSessionAlpha,
    contentSourceAlpha,
    contentItemAlpha,
    admin,
    learner,
    auditor,
    superAdmin,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.userTenantMembership.count(),
    prisma.auditEvent.count(),
    prisma.stepUpSession.count(),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.assignment.count(),
    prisma.aIAgent.count(),
    prisma.promptVersion.count(),
    prisma.speakingSession.count(),
    prisma.speakingTranscriptSegment.count(),
    prisma.contentSource.count(),
    prisma.contentItem.count(),
    prisma.contentVersion.count(),
    prisma.tenant.findUnique({ where: { id: expected.tenantAlphaId } }),
    prisma.tenant.findUnique({ where: { id: expected.tenantBetaId } }),
    prisma.course.findUnique({ where: { id: expected.courseAlphaId } }),
    prisma.course.findUnique({ where: { id: expected.courseBetaId } }),
    prisma.lesson.findUnique({ where: { id: expected.lessonAlphaOneId } }),
    prisma.aIAgent.findUnique({ where: { id: expected.tutorAgentAlphaId } }),
    prisma.speakingSession.findUnique({ where: { id: expected.speakingSessionAlphaId } }),
    prisma.contentSource.findUnique({ where: { id: expected.contentSourceAlphaId } }),
    prisma.contentItem.findUnique({ where: { id: expected.contentItemAlphaId } }),
    prisma.user.findFirst({
      where: { email: expected.adminEmail, tenantId: expected.tenantAlphaId },
    }),
    prisma.user.findFirst({
      where: { email: expected.learnerEmail, tenantId: expected.tenantAlphaId },
    }),
    prisma.user.findFirst({
      where: { email: expected.auditorEmail, tenantId: expected.tenantAlphaId },
    }),
    prisma.user.findFirst({
      where: { email: expected.superAdminEmail, tenantId: expected.tenantAlphaId },
    }),
  ]);

  assert(tenantCount >= 2, `Expected at least 2 tenants, found ${tenantCount}.`);
  assert(userCount >= 4, `Expected at least 4 users, found ${userCount}.`);
  assert(membershipCount >= 4, `Expected at least 4 memberships, found ${membershipCount}.`);
  assert(auditCount >= 1, `Expected at least 1 audit event, found ${auditCount}.`);
  assert(courseCount >= 2, `Expected at least 2 courses, found ${courseCount}.`);
  assert(lessonCount >= 4, `Expected at least 4 lessons, found ${lessonCount}.`);
  assert(assignmentCount >= 1, `Expected at least 1 assignment, found ${assignmentCount}.`);
  assert(aiAgentCount >= 2, `Expected at least 2 AI agents, found ${aiAgentCount}.`);
  assert(
    promptVersionCount >= 1,
    `Expected at least 1 prompt version, found ${promptVersionCount}.`,
  );
  assert(
    speakingSessionCount >= 1,
    `Expected at least 1 speaking session, found ${speakingSessionCount}.`,
  );
  assert(
    speakingTranscriptCount >= 1,
    `Expected at least 1 speaking transcript segment, found ${speakingTranscriptCount}.`,
  );
  assert(
    contentSourceCount >= 2,
    `Expected at least 2 content sources, found ${contentSourceCount}.`,
  );
  assert(contentItemCount >= 1, `Expected at least 1 content item, found ${contentItemCount}.`);
  assert(
    contentVersionCount >= 1,
    `Expected at least 1 content version, found ${contentVersionCount}.`,
  );
  assert(tenantAlpha?.slug === expected.tenantAlphaSlug, "Sample tenant slug is missing.");
  assert(tenantBeta?.slug === expected.tenantBetaSlug, "Cross-tenant sample slug is missing.");
  assert(courseAlpha?.tenantId === expected.tenantAlphaId, "Sample English course is missing.");
  assert(courseBeta?.tenantId === expected.tenantBetaId, "Cross-tenant course is missing.");
  assert(lessonAlphaOne?.courseId === expected.courseAlphaId, "Sample lesson is missing.");
  assert(tutorAgentAlpha?.tenantId === expected.tenantAlphaId, "Sample tutor agent is missing.");
  assert(
    speakingSessionAlpha?.tenantId === expected.tenantAlphaId,
    "Sample speaking session is missing.",
  );
  assert(
    contentSourceAlpha?.tenantId === expected.tenantAlphaId,
    "Sample content source is missing.",
  );
  assert(contentItemAlpha?.tenantId === expected.tenantAlphaId, "Sample content item is missing.");
  assert(admin, "Tenant admin seed user is missing.");
  assert(learner, "Learner seed user is missing.");
  assert(auditor, "Security auditor seed user is missing.");
  assert(superAdmin, "Super admin seed user is missing.");

  const memberships = await prisma.userTenantMembership.findMany({
    where: {
      tenantId: expected.tenantAlphaId,
      userId: {
        in: [admin.id, learner.id, auditor.id, superAdmin.id],
      },
    },
  });

  assert(
    memberships.some((membership) => membership.roles.includes("tenant_admin")),
    "Tenant admin membership is missing.",
  );
  assert(
    memberships.some((membership) => membership.roles.includes("learner")),
    "Learner membership is missing.",
  );
  assert(
    memberships.some((membership) => membership.roles.includes("security_auditor")),
    "Security auditor membership is missing.",
  );
  assert(
    memberships.some((membership) => membership.roles.includes("super_admin")),
    "Super admin membership is missing.",
  );

  console.log("DB seed verification passed.");
  console.log(
    JSON.stringify(
      {
        auditEvents: auditCount,
        assignments: assignmentCount,
        aiAgents: aiAgentCount,
        courses: courseCount,
        contentItems: contentItemCount,
        contentSources: contentSourceCount,
        contentVersions: contentVersionCount,
        lessons: lessonCount,
        memberships: membershipCount,
        promptVersions: promptVersionCount,
        speakingSessions: speakingSessionCount,
        speakingTranscriptSegments: speakingTranscriptCount,
        stepUpSessions: stepUpCount,
        tenants: tenantCount,
        users: userCount,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
