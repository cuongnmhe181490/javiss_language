import type { Actor, AuditEvent, AuditOutcome, Role } from "@polyglot/contracts";

export type TenantScopedResource = {
  id: string;
  tenantId: string;
};

export type TenantAccessResult =
  | { allowed: true; tenantId: string }
  | { allowed: false; reason: "missing_actor" | "tenant_mismatch" };

export function assertTenantScoped<T extends TenantScopedResource>(
  resource: T,
  tenantId: string,
): T {
  if (resource.tenantId !== tenantId) {
    throw new TenantIsolationError(resource.tenantId, tenantId);
  }

  return resource;
}

export function canAccessTenant(
  actor: Pick<Actor, "tenantId"> | null | undefined,
  tenantId: string,
): TenantAccessResult {
  if (!actor) {
    return { allowed: false, reason: "missing_actor" };
  }

  if (actor.tenantId !== tenantId) {
    return { allowed: false, reason: "tenant_mismatch" };
  }

  return { allowed: true, tenantId };
}

export function filterTenantResources<T extends TenantScopedResource>(
  resources: readonly T[],
  tenantId: string,
): T[] {
  return resources.filter((resource) => resource.tenantId === tenantId);
}

export function createTenantPartitionKey(
  tenantId: string,
  resourceType: string,
  resourceId: string,
): string {
  return `tenant/${tenantId}/${resourceType}/${resourceId}`;
}

export type CreateAuditEventInput = {
  id: string;
  tenantId: string;
  actorId: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: AuditOutcome;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  requestId: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
};

export function createAuditEvent(input: CreateAuditEventInput): AuditEvent {
  return {
    id: input.id,
    tenantId: input.tenantId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    outcome: input.outcome,
    before: input.before,
    after: input.after,
    ip: input.ip,
    userAgent: input.userAgent,
    requestId: input.requestId,
    metadata: sanitizeAuditMetadata(input.metadata ?? {}),
    createdAt: input.createdAt ?? new Date(),
  };
}

const sensitiveMetadataKeyPattern =
  /authorization|cookie|password|secret|token|apikey|api_key|privatekey|private_key|rawaudio|raw_audio|transcriptraw|transcript_raw/i;

export function sanitizeAuditMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return sanitizeRecord(metadata, 0);
}

function sanitizeRecord(value: Record<string, unknown>, depth: number): Record<string, unknown> {
  if (depth > 5) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    if (sensitiveMetadataKeyPattern.test(key)) {
      continue;
    }

    sanitized[key] = sanitizeValue(item, depth + 1);
  }

  return sanitized;
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === "object") {
    return sanitizeRecord(value as Record<string, unknown>, depth + 1);
  }

  return value;
}

export class TenantIsolationError extends Error {
  constructor(
    public readonly resourceTenantId: string,
    public readonly expectedTenantId: string,
  ) {
    super(`Tenant isolation violation: expected ${expectedTenantId}, got ${resourceTenantId}`);
    this.name = "TenantIsolationError";
  }
}
