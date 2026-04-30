CREATE TABLE "ContentSource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "sourceName" VARCHAR(180) NOT NULL,
    "sourceType" VARCHAR(80) NOT NULL DEFAULT 'document',
    "reference" VARCHAR(500) NOT NULL,
    "licenseType" VARCHAR(80) NOT NULL,
    "allowedUsage" TEXT[] NOT NULL,
    "commercialAllowed" BOOLEAN NOT NULL DEFAULT false,
    "attributionRequired" BOOLEAN NOT NULL DEFAULT false,
    "attributionText" TEXT,
    "expirationDate" TIMESTAMP(3),
    "dataResidencyConstraint" VARCHAR(40),
    "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
    "createdBy" UUID,
    "reviewedBy" UUID,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "language" VARCHAR(8),
    "level" VARCHAR(40),
    "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
    "currentVersion" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID,
    "publishedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "contentItemId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
    "body" JSONB NOT NULL,
    "sourceIds" TEXT[] NOT NULL,
    "validation" JSONB NOT NULL DEFAULT '{}',
    "aiQa" JSONB NOT NULL DEFAULT '{}',
    "changeSummary" TEXT,
    "createdBy" UUID,
    "reviewedBy" UUID,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentReviewEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "contentItemId" UUID NOT NULL,
    "versionId" UUID,
    "actorId" UUID NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "outcome" VARCHAR(40) NOT NULL,
    "comments" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReviewEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentSource_tenantId_reference_key" ON "ContentSource"("tenantId", "reference");
CREATE INDEX "ContentSource_tenantId_idx" ON "ContentSource"("tenantId");
CREATE INDEX "ContentSource_tenantId_status_idx" ON "ContentSource"("tenantId", "status");
CREATE INDEX "ContentSource_tenantId_licenseType_idx" ON "ContentSource"("tenantId", "licenseType");

CREATE UNIQUE INDEX "ContentItem_tenantId_slug_key" ON "ContentItem"("tenantId", "slug");
CREATE INDEX "ContentItem_tenantId_idx" ON "ContentItem"("tenantId");
CREATE INDEX "ContentItem_tenantId_status_idx" ON "ContentItem"("tenantId", "status");
CREATE INDEX "ContentItem_tenantId_type_idx" ON "ContentItem"("tenantId", "type");
CREATE INDEX "ContentItem_tenantId_language_idx" ON "ContentItem"("tenantId", "language");

CREATE UNIQUE INDEX "ContentVersion_tenantId_contentItemId_version_key" ON "ContentVersion"("tenantId", "contentItemId", "version");
CREATE INDEX "ContentVersion_tenantId_idx" ON "ContentVersion"("tenantId");
CREATE INDEX "ContentVersion_tenantId_contentItemId_idx" ON "ContentVersion"("tenantId", "contentItemId");
CREATE INDEX "ContentVersion_tenantId_status_idx" ON "ContentVersion"("tenantId", "status");

CREATE INDEX "ContentReviewEvent_tenantId_idx" ON "ContentReviewEvent"("tenantId");
CREATE INDEX "ContentReviewEvent_tenantId_contentItemId_idx" ON "ContentReviewEvent"("tenantId", "contentItemId");
CREATE INDEX "ContentReviewEvent_tenantId_action_idx" ON "ContentReviewEvent"("tenantId", "action");
CREATE INDEX "ContentReviewEvent_tenantId_outcome_idx" ON "ContentReviewEvent"("tenantId", "outcome");

ALTER TABLE "ContentSource" ADD CONSTRAINT "ContentSource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentReviewEvent" ADD CONSTRAINT "ContentReviewEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentReviewEvent" ADD CONSTRAINT "ContentReviewEvent_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentReviewEvent" ADD CONSTRAINT "ContentReviewEvent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ContentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
