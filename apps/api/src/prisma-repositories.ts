import type { Prisma, PrismaClient } from "@prisma/client";
import type { Actor, AuditEvent, Tenant } from "@polyglot/contracts";
import { auditEventSchema, roleSchema, tenantSchema } from "@polyglot/contracts";

import type {
  ApiRepositories,
  AuditListQuery,
  AuditListResult,
  CreateStepUpInput,
} from "./repositories.js";
import { createPrismaAiRepositories } from "./prisma-ai-repositories.js";
import { createPrismaContentRepositories } from "./prisma-content-repositories.js";
import { createPrismaLearningRepositories } from "./prisma-learning-repositories.js";
import { createPrismaSpeakingRepositories } from "./prisma-speaking-repositories.js";

export function createPrismaRepositories(prisma: PrismaClient): ApiRepositories {
  return {
    ai: createPrismaAiRepositories(prisma),
    content: createPrismaContentRepositories(prisma),
    speaking: createPrismaSpeakingRepositories(prisma),
    tenants: {
      async findById(tenantId) {
        const tenant = await prisma.tenant.findFirst({
          where: {
            id: tenantId,
            status: "active",
          },
        });

        return tenant ? mapTenant(tenant) : null;
      },
    },
    users: {
      async findActorByIdentity(input) {
        const identity = await prisma.authIdentity.findUnique({
          include: {
            user: true,
          },
          where: {
            provider_subject: {
              provider: input.provider,
              subject: input.subject,
            },
          },
        });

        if (
          !identity ||
          identity.tenantId !== input.tenantId ||
          identity.user.status !== "active"
        ) {
          return null;
        }

        const membership = await prisma.userTenantMembership.findUnique({
          where: {
            tenantId_userId: {
              tenantId: input.tenantId,
              userId: identity.userId,
            },
          },
        });

        if (!membership) {
          return null;
        }

        return {
          groupIds: [],
          roles: membership.roles.map((role) => roleSchema.parse(role)) as Actor["roles"],
          tenantId: input.tenantId,
          userId: identity.userId,
        };
      },
    },
    memberships: {
      async actorHasTenantMembership(input) {
        const membership = await prisma.userTenantMembership.findUnique({
          where: {
            tenantId_userId: {
              tenantId: input.tenantId,
              userId: input.userId,
            },
          },
        });

        return Boolean(membership);
      },
    },
    auditEvents: {
      async append(event) {
        const parsed = auditEventSchema.parse(event);

        await prisma.auditEvent.create({
          data: {
            id: parsed.id,
            tenantId: parsed.tenantId,
            actorId: parsed.actorId,
            actorRole: parsed.actorRole,
            action: parsed.action,
            resourceType: parsed.resourceType,
            resourceId: parsed.resourceId,
            outcome: parsed.outcome,
            ip: parsed.ip,
            userAgent: parsed.userAgent,
            requestId: parsed.requestId,
            metadata: parsed.metadata as Prisma.InputJsonValue,
            createdAt: parsed.createdAt,
          },
        });
      },
      async listByTenant(tenantId, query = { page: 1, pageSize: 20 }) {
        return listAuditEventsByTenant(prisma, tenantId, query);
      },
    },
    learning: createPrismaLearningRepositories(prisma),
    stepUps: {
      async create(input) {
        await prisma.stepUpSession.create({
          data: input,
        });
      },
      async hasValidStepUp(input) {
        const stepUp = await prisma.stepUpSession.findFirst({
          where: {
            tenantId: input.tenantId,
            userId: input.userId,
            consumedAt: null,
            expiresAt: {
              gt: input.now,
            },
          },
        });

        return Boolean(stepUp);
      },
    },
  };
}

async function listAuditEventsByTenant(
  prisma: PrismaClient,
  tenantId: string,
  query: AuditListQuery,
): Promise<AuditListResult> {
  const where = {
    tenantId,
    action: query.action,
    actorId: query.actorId,
    outcome: query.outcome,
    createdAt: {
      gte: query.from,
      lte: query.to,
    },
  };
  const page = Math.max(query.page, 1);
  const pageSize = Math.min(Math.max(query.pageSize, 1), 100);
  const [total, rows] = await prisma.$transaction([
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
    }),
  ]);

  return {
    data: rows.map((row) =>
      auditEventSchema.parse({
        ...row,
        ip: row.ip ?? undefined,
        metadata: row.metadata ?? {},
        userAgent: row.userAgent ?? undefined,
      }),
    ),
    page,
    pageSize,
    total,
  };
}

function mapTenant(tenant: Awaited<ReturnType<PrismaClient["tenant"]["findFirst"]>>): Tenant {
  return tenantSchema.parse({
    id: tenant?.id,
    name: tenant?.name,
    region: tenant?.region,
    plan: tenant?.plan,
    dataResidency: tenant?.dataResidency,
    featureFlags: tenant?.featureFlags ?? {},
    brandingConfig: tenant?.brandingConfig ?? {},
    retentionPolicy: tenant?.retentionPolicy ?? {
      audioDays: 30,
      transcriptDays: 730,
    },
  });
}
