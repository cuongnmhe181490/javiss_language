import { z } from "zod";

export const learningLanguageSchema = z.enum(["en", "zh", "ja", "ko"]);
export const trackTypeSchema = z.enum(["general", "business", "exam", "travel", "custom"]);
export const contentStatusSchema = z.enum(["draft", "review", "published", "archived"]);
export const lessonBlockTypeSchema = z.enum([
  "text",
  "dialogue",
  "vocabulary",
  "grammar",
  "listening",
  "speaking_prompt",
  "quiz",
  "reflection",
]);
export const exerciseTypeSchema = z.enum([
  "multiple_choice",
  "fill_blank",
  "reorder",
  "short_answer",
  "listening_choice",
  "speaking_stub",
]);
export const lessonProgressStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export const assignmentAssigneeTypeSchema = z.enum(["user", "group"]);
export const assignmentStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);

export const slugSchema = z
  .string()
  .min(2)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const contentObjectSchema = z.record(z.string(), z.unknown());

export const courseListQuerySchema = paginationSchema.extend({
  language: learningLanguageSchema.optional(),
  level: z.string().min(1).max(40).optional(),
  trackType: trackTypeSchema.optional(),
  status: contentStatusSchema.optional(),
});

export const createCourseSchema = z.object({
  language: learningLanguageSchema,
  trackType: trackTypeSchema,
  targetLevel: z.string().min(1).max(40),
  title: z.string().min(2).max(180),
  slug: slugSchema,
  description: z.string().min(1).max(4000),
  status: contentStatusSchema.default("draft"),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: contentStatusSchema.optional(),
});

export const createModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(2).max(180),
  description: z.string().max(4000).optional(),
  orderIndex: z.number().int().min(0),
  status: contentStatusSchema.default("draft"),
});

export const createLessonSchema = z.object({
  courseId: z.string().uuid(),
  moduleId: z.string().uuid(),
  title: z.string().min(2).max(180),
  slug: slugSchema,
  description: z.string().max(4000).optional(),
  language: learningLanguageSchema,
  targetLevel: z.string().min(1).max(40),
  estimatedMinutes: z.number().int().min(1).max(240),
  objectives: z.array(z.string().min(1).max(240)).max(12).default([]),
  status: contentStatusSchema.default("draft"),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  status: contentStatusSchema.optional(),
});

export const createLessonBlockSchema = z.object({
  type: lessonBlockTypeSchema,
  orderIndex: z.number().int().min(0),
  content: contentObjectSchema,
});

export const createAssignmentSchema = z.object({
  courseId: z.string().uuid(),
  assigneeType: assignmentAssigneeTypeSchema,
  assigneeId: z.string().min(1).max(180),
  dueDate: z.coerce.date().optional(),
  status: assignmentStatusSchema.default("active"),
});

export const completeLessonSchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
});

export type LearningLanguage = z.infer<typeof learningLanguageSchema>;
export type TrackType = z.infer<typeof trackTypeSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type LessonBlockType = z.infer<typeof lessonBlockTypeSchema>;
export type ExerciseType = z.infer<typeof exerciseTypeSchema>;
export type LessonProgressStatus = z.infer<typeof lessonProgressStatusSchema>;
export type AssignmentAssigneeType = z.infer<typeof assignmentAssigneeTypeSchema>;
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

export type CourseRecord = {
  id: string;
  tenantId: string;
  language: LearningLanguage;
  trackType: TrackType;
  targetLevel: string;
  title: string;
  slug: string;
  description: string;
  status: ContentStatus;
  version: number;
  createdBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ModuleRecord = {
  id: string;
  tenantId: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonRecord = {
  id: string;
  tenantId: string;
  courseId: string;
  moduleId: string;
  title: string;
  slug: string;
  description?: string;
  language: LearningLanguage;
  targetLevel: string;
  estimatedMinutes: number;
  objectives: string[];
  status: ContentStatus;
  version: number;
  createdBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonBlockRecord = {
  id: string;
  tenantId: string;
  lessonId: string;
  type: LessonBlockType;
  orderIndex: number;
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type VocabularyItemRecord = {
  id: string;
  tenantId: string;
  language: LearningLanguage;
  term: string;
  reading?: string;
  romanization?: string;
  meaning: string;
  partOfSpeech?: string;
  level: string;
  tags: string[];
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GrammarPointRecord = {
  id: string;
  tenantId: string;
  language: LearningLanguage;
  title: string;
  pattern: string;
  explanation: string;
  level: string;
  examples: Record<string, unknown>[];
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ExerciseRecord = {
  id: string;
  tenantId: string;
  lessonId: string;
  type: ExerciseType;
  prompt: string;
  content: Record<string, unknown>;
  answerKey: Record<string, unknown>;
  explanation?: string;
  points: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonProgressRecord = {
  id: string;
  tenantId: string;
  userId: string;
  lessonId: string;
  status: LessonProgressStatus;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseProgressRecord = {
  id: string;
  tenantId: string;
  userId: string;
  courseId: string;
  status: LessonProgressStatus;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  lastLessonId?: string;
  updatedAt: Date;
};

export type AssignmentRecord = {
  id: string;
  tenantId: string;
  courseId: string;
  assigneeType: AssignmentAssigneeType;
  assigneeId: string;
  assignedBy: string;
  dueDate?: Date;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseListFilters = z.infer<typeof courseListQuerySchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateLessonBlockInput = z.infer<typeof createLessonBlockSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export type PaginatedResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type LessonDetail = LessonRecord & {
  blocks: LessonBlockRecord[];
  exercises: ExerciseRecord[];
};

export type CourseDetail = CourseRecord & {
  modules: Array<ModuleRecord & { lessons: LessonRecord[] }>;
};

export const sampleCourseAlphaId = "44444444-4444-4444-8444-444444444444";
export const sampleCourseBetaId = "55555555-5555-4555-8555-555555555555";
export const sampleDraftCourseAlphaId = "66666666-6666-4666-8666-666666666666";
export const sampleModuleAlphaId = "77777777-7777-4777-8777-777777777777";
export const sampleModuleBetaId = "88888888-8888-4888-8888-888888888888";
export const sampleLessonAlphaOneId = "99999999-9999-4999-8999-999999999991";
export const sampleLessonAlphaTwoId = "99999999-9999-4999-8999-999999999992";
export const sampleLessonAlphaThreeId = "99999999-9999-4999-8999-999999999993";
export const sampleLessonBetaOneId = "99999999-9999-4999-8999-999999999994";
export const sampleAssignmentAlphaId = "12121212-1212-4121-8121-121212121212";

export function stripAnswerKeys(lesson: LessonDetail): LessonDetail {
  return {
    ...lesson,
    exercises: lesson.exercises.map(({ answerKey: _answerKey, ...exercise }) => ({
      ...exercise,
      answerKey: {},
    })),
  };
}

export function isPublished(status: ContentStatus): boolean {
  return status === "published";
}
