-- AlterTable
ALTER TABLE "AIAgent" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AIConversation" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AIMessage" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AuditEvent" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AuthIdentity" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentItem" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentReviewEvent" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentSource" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentVersion" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CourseProgress" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GrammarPoint" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LessonBlock" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LessonProgress" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Module" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PromptVersion" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RateLimitBucket" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SpeakingRealtimeToken" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SpeakingSession" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SpeakingTranscriptSegment" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StepUpSession" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserTenantMembership" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VocabularyItem" ALTER COLUMN "id" DROP DEFAULT;
