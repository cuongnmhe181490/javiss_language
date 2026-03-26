-- CreateEnum
CREATE TYPE "WritingTaskType" AS ENUM ('task1', 'task2');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM (
    'writing_feedback_requested',
    'writing_feedback_completed',
    'writing_feedback_fallback_used'
);

-- CreateTable
CREATE TABLE "WritingFeedbackSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "taskType" "WritingTaskType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "essay" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "overallBand" DOUBLE PRECISION NOT NULL,
    "taskBand" DOUBLE PRECISION NOT NULL,
    "coherenceBand" DOUBLE PRECISION NOT NULL,
    "lexicalBand" DOUBLE PRECISION NOT NULL,
    "grammarBand" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "sampleRewrite" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "modelName" TEXT NOT NULL,
    "fallbackReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingFeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "eventType" "AnalyticsEventType" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WritingFeedbackSubmission_tenantId_idx" ON "WritingFeedbackSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "WritingFeedbackSubmission_userId_createdAt_idx" ON "WritingFeedbackSubmission"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "WritingFeedbackSubmission_taskType_createdAt_idx" ON "WritingFeedbackSubmission"("taskType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_tenantId_idx" ON "AnalyticsEvent"("tenantId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_entityType_entityId_idx" ON "AnalyticsEvent"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "WritingFeedbackSubmission"
ADD CONSTRAINT "WritingFeedbackSubmission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent"
ADD CONSTRAINT "AnalyticsEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
