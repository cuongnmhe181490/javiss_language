/**
 * Types mirroring the learner-facing shapes returned by the backend API
 * (apps/api/src/learning-domain.ts). Dates are serialized as ISO strings over
 * JSON, so they are typed as `string` here.
 *
 * These intentionally duplicate the API's internal types because the API does
 * not export them through a shared package. Keep them in sync with
 * `apps/api/src/learning-domain.ts`.
 */

export type LearningLanguage = "en" | "zh" | "ja" | "ko";
export type ContentStatus = "draft" | "in_review" | "published" | "archived";
export type LessonProgressStatus = "not_started" | "in_progress" | "completed";
export type AssignmentStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface CourseRecord {
  id: string;
  tenantId: string;
  language: LearningLanguage;
  trackType: string;
  targetLevel: string;
  title: string;
  slug: string;
  description: string;
  status: ContentStatus;
  version: number;
  createdBy?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleRecord {
  id: string;
  tenantId: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LessonRecord {
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
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonBlockRecord {
  id: string;
  tenantId: string;
  lessonId: string;
  type: string;
  orderIndex: number;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseRecord {
  id: string;
  tenantId: string;
  lessonId: string;
  type: string;
  prompt: string;
  content: Record<string, unknown>;
  answerKey: Record<string, unknown>;
  explanation?: string;
  points: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressRecord {
  id: string;
  tenantId: string;
  userId: string;
  lessonId: string;
  status: LessonProgressStatus;
  score?: number;
  startedAt?: string;
  completedAt?: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRecord {
  id: string;
  tenantId: string;
  courseId: string;
  assigneeType: "user" | "group";
  assigneeId: string;
  assignedBy: string;
  dueDate?: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type CourseDetail = CourseRecord & {
  modules: Array<ModuleRecord & { lessons: LessonRecord[] }>;
};

export type LessonDetail = LessonRecord & {
  blocks: LessonBlockRecord[];
  exercises: ExerciseRecord[];
};

export interface ContinueLearningItem {
  courseId: string;
  lessonId: string;
  title: string;
  language: LearningLanguage;
  targetLevel: string;
  estimatedMinutes: number;
}

export interface DashboardData {
  dailyGoal: {
    targetMinutes: number;
    completedMinutes: number;
  };
  stats: {
    coursesInProgress: number;
    completedLessons: number;
    assignedCourses: number;
    progressPercentAverage: number;
  };
  continueLearning: ContinueLearningItem[];
  assignments: AssignmentRecord[];
  recentActivity: LessonProgressRecord[];
}
