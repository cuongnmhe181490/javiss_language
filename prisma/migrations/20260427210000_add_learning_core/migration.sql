-- PR-004 learning core: tenant-scoped courses, lessons, progress, and assignments.

CREATE TABLE "Course" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "language" VARCHAR(8) NOT NULL,
  "trackType" VARCHAR(40) NOT NULL,
  "targetLevel" VARCHAR(40) NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(140) NOT NULL,
  "description" TEXT NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdBy" UUID,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Module" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "description" TEXT,
  "orderIndex" INTEGER NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lesson" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "moduleId" UUID NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(140) NOT NULL,
  "description" TEXT,
  "language" VARCHAR(8) NOT NULL,
  "targetLevel" VARCHAR(40) NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL,
  "objectives" JSONB NOT NULL DEFAULT '[]',
  "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdBy" UUID,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonBlock" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "lessonId" UUID NOT NULL,
  "type" VARCHAR(40) NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LessonBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VocabularyItem" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "language" VARCHAR(8) NOT NULL,
  "term" VARCHAR(180) NOT NULL,
  "reading" VARCHAR(180),
  "romanization" VARCHAR(180),
  "meaning" TEXT NOT NULL,
  "partOfSpeech" VARCHAR(80),
  "level" VARCHAR(40) NOT NULL,
  "tags" TEXT[] NOT NULL,
  "sourceId" VARCHAR(180),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VocabularyItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrammarPoint" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "language" VARCHAR(8) NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "pattern" VARCHAR(240) NOT NULL,
  "explanation" TEXT NOT NULL,
  "level" VARCHAR(40) NOT NULL,
  "examples" JSONB NOT NULL DEFAULT '[]',
  "sourceId" VARCHAR(180),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GrammarPoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Exercise" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "lessonId" UUID NOT NULL,
  "type" VARCHAR(40) NOT NULL,
  "prompt" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "answerKey" JSONB NOT NULL,
  "explanation" TEXT,
  "points" INTEGER NOT NULL DEFAULT 0,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonProgress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "lessonId" UUID NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'not_started',
  "score" INTEGER,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lastActivityAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseProgress" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "status" VARCHAR(40) NOT NULL DEFAULT 'not_started',
  "completedLessons" INTEGER NOT NULL DEFAULT 0,
  "totalLessons" INTEGER NOT NULL DEFAULT 0,
  "progressPercent" INTEGER NOT NULL DEFAULT 0,
  "lastLessonId" UUID,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assignment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "assigneeType" VARCHAR(40) NOT NULL,
  "assigneeId" VARCHAR(180) NOT NULL,
  "assignedBy" UUID NOT NULL,
  "dueDate" TIMESTAMP(3),
  "status" VARCHAR(40) NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Course_tenantId_slug_key" ON "Course"("tenantId", "slug");
CREATE INDEX "Course_tenantId_idx" ON "Course"("tenantId");
CREATE INDEX "Course_tenantId_language_idx" ON "Course"("tenantId", "language");
CREATE INDEX "Course_tenantId_status_idx" ON "Course"("tenantId", "status");
CREATE INDEX "Course_tenantId_trackType_idx" ON "Course"("tenantId", "trackType");

CREATE INDEX "Module_tenantId_idx" ON "Module"("tenantId");
CREATE INDEX "Module_tenantId_courseId_idx" ON "Module"("tenantId", "courseId");
CREATE INDEX "Module_tenantId_courseId_orderIndex_idx" ON "Module"("tenantId", "courseId", "orderIndex");

CREATE UNIQUE INDEX "Lesson_tenantId_courseId_slug_key" ON "Lesson"("tenantId", "courseId", "slug");
CREATE INDEX "Lesson_tenantId_idx" ON "Lesson"("tenantId");
CREATE INDEX "Lesson_tenantId_courseId_idx" ON "Lesson"("tenantId", "courseId");
CREATE INDEX "Lesson_tenantId_moduleId_idx" ON "Lesson"("tenantId", "moduleId");
CREATE INDEX "Lesson_tenantId_status_idx" ON "Lesson"("tenantId", "status");

CREATE INDEX "LessonBlock_tenantId_idx" ON "LessonBlock"("tenantId");
CREATE INDEX "LessonBlock_tenantId_lessonId_idx" ON "LessonBlock"("tenantId", "lessonId");
CREATE INDEX "LessonBlock_tenantId_lessonId_orderIndex_idx" ON "LessonBlock"("tenantId", "lessonId", "orderIndex");

CREATE INDEX "VocabularyItem_tenantId_idx" ON "VocabularyItem"("tenantId");
CREATE INDEX "VocabularyItem_tenantId_language_idx" ON "VocabularyItem"("tenantId", "language");
CREATE INDEX "VocabularyItem_tenantId_level_idx" ON "VocabularyItem"("tenantId", "level");
CREATE INDEX "VocabularyItem_tenantId_term_idx" ON "VocabularyItem"("tenantId", "term");

CREATE INDEX "GrammarPoint_tenantId_idx" ON "GrammarPoint"("tenantId");
CREATE INDEX "GrammarPoint_tenantId_language_idx" ON "GrammarPoint"("tenantId", "language");
CREATE INDEX "GrammarPoint_tenantId_level_idx" ON "GrammarPoint"("tenantId", "level");

CREATE INDEX "Exercise_tenantId_idx" ON "Exercise"("tenantId");
CREATE INDEX "Exercise_tenantId_lessonId_idx" ON "Exercise"("tenantId", "lessonId");
CREATE INDEX "Exercise_tenantId_lessonId_orderIndex_idx" ON "Exercise"("tenantId", "lessonId", "orderIndex");

CREATE UNIQUE INDEX "LessonProgress_tenantId_userId_lessonId_key" ON "LessonProgress"("tenantId", "userId", "lessonId");
CREATE INDEX "LessonProgress_tenantId_idx" ON "LessonProgress"("tenantId");
CREATE INDEX "LessonProgress_tenantId_userId_idx" ON "LessonProgress"("tenantId", "userId");
CREATE INDEX "LessonProgress_tenantId_lessonId_idx" ON "LessonProgress"("tenantId", "lessonId");
CREATE INDEX "LessonProgress_tenantId_status_idx" ON "LessonProgress"("tenantId", "status");

CREATE UNIQUE INDEX "CourseProgress_tenantId_userId_courseId_key" ON "CourseProgress"("tenantId", "userId", "courseId");
CREATE INDEX "CourseProgress_tenantId_idx" ON "CourseProgress"("tenantId");
CREATE INDEX "CourseProgress_tenantId_userId_idx" ON "CourseProgress"("tenantId", "userId");
CREATE INDEX "CourseProgress_tenantId_courseId_idx" ON "CourseProgress"("tenantId", "courseId");

CREATE INDEX "Assignment_tenantId_idx" ON "Assignment"("tenantId");
CREATE INDEX "Assignment_tenantId_courseId_idx" ON "Assignment"("tenantId", "courseId");
CREATE INDEX "Assignment_tenantId_assigneeType_assigneeId_idx" ON "Assignment"("tenantId", "assigneeType", "assigneeId");
CREATE INDEX "Assignment_tenantId_dueDate_idx" ON "Assignment"("tenantId", "dueDate");

ALTER TABLE "Course" ADD CONSTRAINT "Course_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Module" ADD CONSTRAINT "Module_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GrammarPoint" ADD CONSTRAINT "GrammarPoint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
