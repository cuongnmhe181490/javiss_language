-- AlterEnum
ALTER TYPE "AiProvider" ADD VALUE 'gemini';

-- CreateEnum
CREATE TYPE "AiConversationKind" AS ENUM ('coach', 'speaking_mock');

-- AlterTable
ALTER TABLE "AiConversation"
ADD COLUMN "kind" "AiConversationKind" NOT NULL DEFAULT 'coach',
ADD COLUMN "scenario" TEXT;
