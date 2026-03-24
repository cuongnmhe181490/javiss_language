-- AlterTable
ALTER TABLE "AiConversation"
ADD COLUMN "speakingIsCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "speakingCompletedAt" TIMESTAMP(3),
ADD COLUMN "speakingFinalBand" TEXT;

-- CreateTable
CREATE TABLE "AiSpeakingAssessmentSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "conversationId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "estimatedBand" TEXT NOT NULL,
    "fluencyBand" TEXT NOT NULL,
    "lexicalBand" TEXT NOT NULL,
    "grammarBand" TEXT NOT NULL,
    "pronunciationBand" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSpeakingAssessmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiSpeakingAssessmentSnapshot_tenantId_idx" ON "AiSpeakingAssessmentSnapshot"("tenantId");

-- CreateIndex
CREATE INDEX "AiSpeakingAssessmentSnapshot_conversationId_createdAt_idx" ON "AiSpeakingAssessmentSnapshot"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "AiSpeakingAssessmentSnapshot_conversationId_sequenceNumber_key" ON "AiSpeakingAssessmentSnapshot"("conversationId", "sequenceNumber");

-- AddForeignKey
ALTER TABLE "AiSpeakingAssessmentSnapshot" ADD CONSTRAINT "AiSpeakingAssessmentSnapshot_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
