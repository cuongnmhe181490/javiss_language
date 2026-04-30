-- PR-003B enterprise backend foundation for PostgreSQL.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Tenant" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(120) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "region" VARCHAR(40) NOT NULL,
  "plan" VARCHAR(40) NOT NULL,
  "dataResidency" VARCHAR(40) NOT NULL,
  "featureFlags" JSONB NOT NULL DEFAULT '{}',
  "brandingConfig" JSONB,
  "retentionPolicy" JSONB,
  "status" VARCHAR(40) NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "externalId" VARCHAR(180),
  "email" VARCHAR(320) NOT NULL,
  "displayName" VARCHAR(160) NOT NULL,
  "locale" VARCHAR(20) NOT NULL DEFAULT 'en',
  "status" VARCHAR(40) NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserTenantMembership" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "roles" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserTenantMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID,
  "actorId" UUID,
  "actorRole" VARCHAR(80),
  "action" VARCHAR(160) NOT NULL,
  "resourceType" VARCHAR(120) NOT NULL,
  "resourceId" VARCHAR(180),
  "outcome" VARCHAR(40) NOT NULL,
  "ip" VARCHAR(80),
  "userAgent" TEXT,
  "requestId" VARCHAR(160) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthIdentity" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tenantId" UUID NOT NULL,
  "provider" VARCHAR(80) NOT NULL,
  "subject" VARCHAR(240) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StepUpSession" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "method" VARCHAR(80) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consumedAt" TIMESTAMP(3),
  CONSTRAINT "StepUpSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimitBucket" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID,
  "key" VARCHAR(260) NOT NULL,
  "points" INTEGER NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");
CREATE INDEX "Tenant_region_idx" ON "Tenant"("region");

CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");
CREATE UNIQUE INDEX "User_tenantId_externalId_key" ON "User"("tenantId", "externalId");
CREATE INDEX "User_tenantId_status_idx" ON "User"("tenantId", "status");

CREATE UNIQUE INDEX "UserTenantMembership_tenantId_userId_key" ON "UserTenantMembership"("tenantId", "userId");
CREATE INDEX "UserTenantMembership_tenantId_idx" ON "UserTenantMembership"("tenantId");
CREATE INDEX "UserTenantMembership_userId_idx" ON "UserTenantMembership"("userId");

CREATE INDEX "AuditEvent_tenantId_createdAt_idx" ON "AuditEvent"("tenantId", "createdAt");
CREATE INDEX "AuditEvent_tenantId_action_idx" ON "AuditEvent"("tenantId", "action");
CREATE INDEX "AuditEvent_tenantId_outcome_idx" ON "AuditEvent"("tenantId", "outcome");
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");
CREATE INDEX "AuditEvent_requestId_idx" ON "AuditEvent"("requestId");

CREATE UNIQUE INDEX "AuthIdentity_provider_subject_key" ON "AuthIdentity"("provider", "subject");
CREATE INDEX "AuthIdentity_tenantId_idx" ON "AuthIdentity"("tenantId");
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");

CREATE INDEX "StepUpSession_tenantId_userId_expiresAt_idx" ON "StepUpSession"("tenantId", "userId", "expiresAt");

CREATE UNIQUE INDEX "RateLimitBucket_key_key" ON "RateLimitBucket"("key");
CREATE INDEX "RateLimitBucket_tenantId_idx" ON "RateLimitBucket"("tenantId");
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserTenantMembership" ADD CONSTRAINT "UserTenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserTenantMembership" ADD CONSTRAINT "UserTenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StepUpSession" ADD CONSTRAINT "StepUpSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StepUpSession" ADD CONSTRAINT "StepUpSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RateLimitBucket" ADD CONSTRAINT "RateLimitBucket_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
