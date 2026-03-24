-- AlterTable
ALTER TABLE "AiConversation"
ADD COLUMN "speakingEstimatedBand" TEXT,
ADD COLUMN "speakingFluencyBand" TEXT,
ADD COLUMN "speakingLexicalBand" TEXT,
ADD COLUMN "speakingGrammarBand" TEXT,
ADD COLUMN "speakingPronunciationBand" TEXT,
ADD COLUMN "speakingAssessmentSummary" TEXT,
ADD COLUMN "speakingStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
ADD COLUMN "speakingImprovements" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
ADD COLUMN "speakingLastAssessedAt" TIMESTAMP(3);
