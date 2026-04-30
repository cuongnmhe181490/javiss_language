-- PR-005 AI tutor chat foundation: tenant-scoped agents, prompt versions, conversations, and messages.

CREATE TABLE "AIAgent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "scope" VARCHAR(80) NOT NULL,
  "allowedTools" TEXT[] NOT NULL,
  "promptVersion" VARCHAR(80) NOT NULL,
  "policyVersion" VARCHAR(80) NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromptVersion" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "agentId" UUID NOT NULL,
  "version" VARCHAR(80) NOT NULL,
  "purpose" VARCHAR(160) NOT NULL,
  "promptText" TEXT NOT NULL,
  "inputSchema" JSONB NOT NULL,
  "outputSchema" JSONB NOT NULL,
  "safetyRules" JSONB NOT NULL,
  "evalStatus" VARCHAR(40) NOT NULL DEFAULT 'draft',
  "createdBy" UUID,
  "approvedBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIConversation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "agentId" UUID NOT NULL,
  "lessonId" UUID,
  "courseId" UUID,
  "title" VARCHAR(180) NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIMessage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "conversationId" UUID NOT NULL,
  "role" VARCHAR(40) NOT NULL,
  "content" TEXT NOT NULL,
  "citations" JSONB NOT NULL DEFAULT '[]',
  "safetyFlags" JSONB NOT NULL DEFAULT '{}',
  "provider" VARCHAR(80) NOT NULL,
  "modelId" VARCHAR(120) NOT NULL,
  "promptVersion" VARCHAR(80),
  "policyVersion" VARCHAR(80),
  "inputTokens" INTEGER NOT NULL DEFAULT 0,
  "outputTokens" INTEGER NOT NULL DEFAULT 0,
  "costEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AIAgent_tenantId_idx" ON "AIAgent"("tenantId");
CREATE INDEX "AIAgent_tenantId_scope_idx" ON "AIAgent"("tenantId", "scope");
CREATE INDEX "AIAgent_tenantId_status_idx" ON "AIAgent"("tenantId", "status");

CREATE UNIQUE INDEX "PromptVersion_agentId_version_key" ON "PromptVersion"("agentId", "version");
CREATE INDEX "PromptVersion_tenantId_idx" ON "PromptVersion"("tenantId");
CREATE INDEX "PromptVersion_tenantId_agentId_idx" ON "PromptVersion"("tenantId", "agentId");
CREATE INDEX "PromptVersion_tenantId_evalStatus_idx" ON "PromptVersion"("tenantId", "evalStatus");

CREATE INDEX "AIConversation_tenantId_idx" ON "AIConversation"("tenantId");
CREATE INDEX "AIConversation_tenantId_userId_idx" ON "AIConversation"("tenantId", "userId");
CREATE INDEX "AIConversation_tenantId_agentId_idx" ON "AIConversation"("tenantId", "agentId");
CREATE INDEX "AIConversation_tenantId_status_idx" ON "AIConversation"("tenantId", "status");

CREATE INDEX "AIMessage_tenantId_idx" ON "AIMessage"("tenantId");
CREATE INDEX "AIMessage_tenantId_conversationId_createdAt_idx" ON "AIMessage"("tenantId", "conversationId", "createdAt");
CREATE INDEX "AIMessage_tenantId_role_idx" ON "AIMessage"("tenantId", "role");

ALTER TABLE "AIAgent" ADD CONSTRAINT "AIAgent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AIAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AIAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
