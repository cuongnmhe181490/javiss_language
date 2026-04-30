import type { Actor, AuditEvent, Tenant } from "@polyglot/contracts";
import { createAuditEvent, filterTenantResources } from "@polyglot/tenant-core";

import { createInMemoryAiRepositories, type AiRepositories } from "./ai-repositories.js";
import {
  createInMemoryContentRepositories,
  type ContentRepositories,
} from "./content-repositories.js";
import {
  adminUserId,
  auditorUserId,
  learnerUserId,
  seedAuditEvents,
  seedTenants,
  superAdminUserId,
  tenantAlphaId,
} from "./fixtures.js";
import {
  createInMemoryLearningRepositories,
  type LearningRepositories,
} from "./learning-repositories.js";
import {
  createInMemorySpeakingRepositories,
  type SpeakingRepositories,
} from "./speaking-repositories.js";

export type TenantRepository = {
  findById(tenantId: string): Promise<Tenant | null>;
};

export type UserRepository = {
  findActorByIdentity(input: {
    provider: string;
    subject: string;
    tenantId: string;
  }): Promise<Actor | null>;
};

export type MembershipRepository = {
  actorHasTenantMembership(input: { tenantId: string; userId: string }): Promise<boolean>;
};

export type AuditRepository = {
  append(event: AuditEvent): Promise<void>;
  listByTenant(tenantId: string, query?: AuditListQuery): Promise<AuditListResult>;
};

export type StepUpRepository = {
  create(input: CreateStepUpInput): Promise<void>;
  hasValidStepUp(input: { tenantId: string; userId: string; now: Date }): Promise<boolean>;
};

export type ApiRepositories = {
  ai: AiRepositories;
  auditEvents: AuditRepository;
  content: ContentRepositories;
  learning: LearningRepositories;
  memberships: MembershipRepository;
  speaking: SpeakingRepositories;
  stepUps: StepUpRepository;
  tenants: TenantRepository;
  users: UserRepository;
};

export type AuditListQuery = {
  action?: string;
  actorId?: string;
  outcome?: AuditEvent["outcome"];
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
};

export type AuditListResult = {
  data: AuditEvent[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateStepUpInput = {
  id: string;
  tenantId: string;
  userId: string;
  method: string;
  expiresAt: Date;
  createdAt: Date;
  consumedAt?: Date;
};

export function createInMemoryRepositories(): ApiRepositories {
  const tenants = [...seedTenants];
  const auditEvents = [...seedAuditEvents];
  const memberships = [
    {
      roles: ["tenant_admin"],
      tenantId: tenantAlphaId,
      userId: adminUserId,
    },
    {
      roles: ["learner"],
      tenantId: tenantAlphaId,
      userId: learnerUserId,
    },
    {
      roles: ["security_auditor"],
      tenantId: tenantAlphaId,
      userId: auditorUserId,
    },
    {
      roles: ["super_admin"],
      tenantId: tenantAlphaId,
      userId: superAdminUserId,
    },
  ];
  const stepUps: CreateStepUpInput[] = [];
  const learning = createInMemoryLearningRepositories();
  const ai = createInMemoryAiRepositories();
  const content = createInMemoryContentRepositories();
  const speaking = createInMemorySpeakingRepositories();

  return {
    ai,
    content,
    speaking,
    tenants: {
      async findById(id) {
        return tenants.find((tenant) => tenant.id === id) ?? null;
      },
    },
    users: {
      async findActorByIdentity(input) {
        const membership = memberships.find(
          (item) =>
            input.provider === "seed" &&
            item.tenantId === input.tenantId &&
            item.userId === input.subject,
        );

        if (!membership) {
          return null;
        }

        return {
          groupIds: [],
          roles: membership.roles as Actor["roles"],
          tenantId: membership.tenantId,
          userId: membership.userId,
        };
      },
    },
    memberships: {
      async actorHasTenantMembership(input) {
        return memberships.some(
          (item) => item.tenantId === input.tenantId && item.userId === input.userId,
        );
      },
    },
    auditEvents: {
      async append(event) {
        auditEvents.push(event);
      },
      async listByTenant(tenantId, query = { page: 1, pageSize: 20 }) {
        return listAuditEvents(auditEvents, tenantId, query);
      },
    },
    learning,
    stepUps: {
      async create(input) {
        stepUps.push(input);
      },
      async hasValidStepUp(input) {
        return stepUps.some(
          (stepUp) =>
            stepUp.tenantId === input.tenantId &&
            stepUp.userId === input.userId &&
            stepUp.expiresAt > input.now &&
            !stepUp.consumedAt,
        );
      },
    },
  };
}

export function listAuditEvents(
  auditEvents: readonly AuditEvent[],
  tenantId: string,
  query: AuditListQuery = { page: 1, pageSize: 20 },
): AuditListResult {
  const filtered = filterTenantResources(
    auditEvents.filter((event): event is AuditEvent & { tenantId: string } =>
      Boolean(event.tenantId),
    ),
    tenantId,
  ).filter((event) => {
    if (query.action && event.action !== query.action) {
      return false;
    }

    if (query.actorId && event.actorId !== query.actorId) {
      return false;
    }

    if (query.outcome && event.outcome !== query.outcome) {
      return false;
    }

    if (query.from && event.createdAt < query.from) {
      return false;
    }

    if (query.to && event.createdAt > query.to) {
      return false;
    }

    return true;
  });

  const page = Math.max(query.page, 1);
  const pageSize = Math.min(Math.max(query.pageSize, 1), 100);
  const start = (page - 1) * pageSize;

  return {
    data: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total: filtered.length,
  };
}

export function createSeedStepUpEvent(input: {
  id: string;
  tenantId: string;
  userId: string;
  requestId: string;
  createdAt: Date;
}): AuditEvent {
  return createAuditEvent({
    id: input.id,
    tenantId: input.tenantId,
    actorId: input.userId,
    actorRole: "security_auditor",
    action: "step_up.created",
    resourceType: "step_up_session",
    resourceId: input.id,
    outcome: "success",
    requestId: input.requestId,
    createdAt: input.createdAt,
  });
}
