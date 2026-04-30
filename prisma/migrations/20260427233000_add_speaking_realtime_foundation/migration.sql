-- PR-006 speaking realtime foundation: tenant-scoped speaking sessions, join tokens, and transcript fallback.

CREATE TABLE "SpeakingSession" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "lessonId" UUID,
  "mode" VARCHAR(40) NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'created',
  "targetLanguage" VARCHAR(8) NOT NULL,
  "scenario" JSONB NOT NULL DEFAULT '{}',
  "roomName" VARCHAR(180) NOT NULL,
  "sfuProvider" VARCHAR(80) NOT NULL,
  "sttProvider" VARCHAR(80) NOT NULL,
  "ttsProvider" VARCHAR(80) NOT NULL,
  "llmProvider" VARCHAR(80) NOT NULL,
  "qos" JSONB NOT NULL DEFAULT '{}',
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "latencyMs" INTEGER,
  "costEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SpeakingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpeakingRealtimeToken" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "sessionId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "tokenHash" VARCHAR(128) NOT NULL,
  "purpose" VARCHAR(40) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "SpeakingRealtimeToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpeakingTranscriptSegment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "sessionId" UUID NOT NULL,
  "sequence" INTEGER NOT NULL,
  "speaker" VARCHAR(40) NOT NULL,
  "text" TEXT NOT NULL,
  "language" VARCHAR(8) NOT NULL,
  "romanization" TEXT,
  "isFinal" BOOLEAN NOT NULL DEFAULT false,
  "confidence" DOUBLE PRECISION,
  "startedAtMs" INTEGER,
  "endedAtMs" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SpeakingTranscriptSegment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SpeakingSession_tenantId_idx" ON "SpeakingSession"("tenantId");
CREATE INDEX "SpeakingSession_tenantId_userId_idx" ON "SpeakingSession"("tenantId", "userId");
CREATE INDEX "SpeakingSession_tenantId_lessonId_idx" ON "SpeakingSession"("tenantId", "lessonId");
CREATE INDEX "SpeakingSession_tenantId_status_idx" ON "SpeakingSession"("tenantId", "status");
CREATE INDEX "SpeakingSession_tenantId_createdAt_idx" ON "SpeakingSession"("tenantId", "createdAt");

CREATE UNIQUE INDEX "SpeakingRealtimeToken_tokenHash_key" ON "SpeakingRealtimeToken"("tokenHash");
CREATE INDEX "SpeakingRealtimeToken_tenantId_idx" ON "SpeakingRealtimeToken"("tenantId");
CREATE INDEX "SpeakingRealtimeToken_tenantId_sessionId_idx" ON "SpeakingRealtimeToken"("tenantId", "sessionId");
CREATE INDEX "SpeakingRealtimeToken_tenantId_userId_idx" ON "SpeakingRealtimeToken"("tenantId", "userId");
CREATE INDEX "SpeakingRealtimeToken_expiresAt_idx" ON "SpeakingRealtimeToken"("expiresAt");

CREATE UNIQUE INDEX "SpeakingTranscriptSegment_tenantId_sessionId_sequence_key" ON "SpeakingTranscriptSegment"("tenantId", "sessionId", "sequence");
CREATE INDEX "SpeakingTranscriptSegment_tenantId_idx" ON "SpeakingTranscriptSegment"("tenantId");
CREATE INDEX "SpeakingTranscriptSegment_tenantId_sessionId_createdAt_idx" ON "SpeakingTranscriptSegment"("tenantId", "sessionId", "createdAt");
CREATE INDEX "SpeakingTranscriptSegment_tenantId_speaker_idx" ON "SpeakingTranscriptSegment"("tenantId", "speaker");

ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SpeakingRealtimeToken" ADD CONSTRAINT "SpeakingRealtimeToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpeakingRealtimeToken" ADD CONSTRAINT "SpeakingRealtimeToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SpeakingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpeakingRealtimeToken" ADD CONSTRAINT "SpeakingRealtimeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpeakingTranscriptSegment" ADD CONSTRAINT "SpeakingTranscriptSegment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SpeakingTranscriptSegment" ADD CONSTRAINT "SpeakingTranscriptSegment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SpeakingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
