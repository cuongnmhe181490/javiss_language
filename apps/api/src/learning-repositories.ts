import type {
  AssignmentRecord,
  CourseDetail,
  CourseListFilters,
  CourseProgressRecord,
  CourseRecord,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateLessonBlockInput,
  CreateLessonInput,
  CreateModuleInput,
  LessonBlockRecord,
  LessonDetail,
  LessonProgressRecord,
  LessonRecord,
  ModuleRecord,
  PaginatedResult,
  UpdateCourseInput,
  UpdateLessonInput,
} from "./learning-domain.js";
import {
  seedAssignments,
  seedCourses,
  seedExercises,
  seedLessonBlocks,
  seedLessons,
  seedModules,
} from "./learning-fixtures.js";

export type LearningRepositories = {
  assignments: AssignmentRepository;
  blocks: LessonBlockRepository;
  courses: CourseRepository;
  lessons: LessonRepository;
  modules: ModuleRepository;
  progress: ProgressRepository;
};

export type CourseRepository = {
  listByTenant(
    tenantId: string,
    filters: CourseListFilters,
  ): Promise<PaginatedResult<CourseRecord>>;
  findById(tenantId: string, courseId: string): Promise<CourseRecord | null>;
  findDetailById(tenantId: string, courseId: string): Promise<CourseDetail | null>;
  create(
    tenantId: string,
    input: CreateCourseInput & { createdBy: string; now: Date },
  ): Promise<CourseRecord>;
  update(
    tenantId: string,
    courseId: string,
    input: UpdateCourseInput & { now: Date },
  ): Promise<CourseRecord | null>;
  publish(tenantId: string, courseId: string, now: Date): Promise<CourseRecord | null>;
};

export type ModuleRepository = {
  create(tenantId: string, input: CreateModuleInput & { now: Date }): Promise<ModuleRecord>;
  findById(tenantId: string, moduleId: string): Promise<ModuleRecord | null>;
  listByCourse(tenantId: string, courseId: string): Promise<ModuleRecord[]>;
};

export type LessonRepository = {
  create(
    tenantId: string,
    input: CreateLessonInput & { createdBy: string; now: Date },
  ): Promise<LessonRecord>;
  findById(tenantId: string, lessonId: string): Promise<LessonRecord | null>;
  findDetailById(tenantId: string, lessonId: string): Promise<LessonDetail | null>;
  listByCourse(tenantId: string, courseId: string): Promise<LessonRecord[]>;
  update(
    tenantId: string,
    lessonId: string,
    input: UpdateLessonInput & { now: Date },
  ): Promise<LessonRecord | null>;
  publish(tenantId: string, lessonId: string, now: Date): Promise<LessonRecord | null>;
};

export type LessonBlockRepository = {
  create(
    tenantId: string,
    lessonId: string,
    input: CreateLessonBlockInput & { now: Date },
  ): Promise<LessonBlockRecord>;
  listByLesson(tenantId: string, lessonId: string): Promise<LessonBlockRecord[]>;
};

export type ProgressRepository = {
  completeLesson(input: {
    tenantId: string;
    userId: string;
    lessonId: string;
    score?: number;
    now: Date;
  }): Promise<LessonProgressRecord>;
  countCompletedLessons(input: {
    tenantId: string;
    userId: string;
    courseId: string;
  }): Promise<number>;
  findCourseProgress(input: {
    tenantId: string;
    userId: string;
    courseId: string;
  }): Promise<CourseProgressRecord | null>;
  findLessonProgress(input: {
    tenantId: string;
    userId: string;
    lessonId: string;
  }): Promise<LessonProgressRecord | null>;
  listCourseProgressForUser(tenantId: string, userId: string): Promise<CourseProgressRecord[]>;
  listLessonProgressForUser(tenantId: string, userId: string): Promise<LessonProgressRecord[]>;
  startLesson(input: {
    tenantId: string;
    userId: string;
    lessonId: string;
    now: Date;
  }): Promise<LessonProgressRecord>;
  upsertCourseProgress(input: {
    tenantId: string;
    userId: string;
    courseId: string;
    completedLessons: number;
    totalLessons: number;
    lastLessonId?: string;
    now: Date;
  }): Promise<CourseProgressRecord>;
};

export type AssignmentRepository = {
  create(
    tenantId: string,
    input: CreateAssignmentInput & { assignedBy: string; now: Date },
  ): Promise<AssignmentRecord>;
  listForAssignee(input: {
    tenantId: string;
    userId: string;
    groupIds: string[];
  }): Promise<AssignmentRecord[]>;
  listByTenant(tenantId: string, filters?: { courseId?: string }): Promise<AssignmentRecord[]>;
};

export function createInMemoryLearningRepositories(): LearningRepositories {
  const courses = [...seedCourses];
  const modules = [...seedModules];
  const lessons = [...seedLessons];
  const blocks = [...seedLessonBlocks];
  const exercises = [...seedExercises];
  const assignments = [...seedAssignments];
  const lessonProgress: LessonProgressRecord[] = [];
  const courseProgress: CourseProgressRecord[] = [];

  return {
    courses: {
      async listByTenant(tenantId, filters) {
        const filtered = courses.filter((course) => {
          if (course.tenantId !== tenantId) {
            return false;
          }

          if (filters.language && course.language !== filters.language) {
            return false;
          }

          if (filters.level && course.targetLevel !== filters.level) {
            return false;
          }

          if (filters.trackType && course.trackType !== filters.trackType) {
            return false;
          }

          if (filters.status && course.status !== filters.status) {
            return false;
          }

          return true;
        });

        return paginate(filtered, filters.page, filters.pageSize);
      },
      async findById(tenantId, courseId) {
        return (
          courses.find((course) => course.tenantId === tenantId && course.id === courseId) ?? null
        );
      },
      async findDetailById(tenantId, courseId) {
        const course = courses.find((item) => item.tenantId === tenantId && item.id === courseId);

        if (!course) {
          return null;
        }

        return {
          ...course,
          modules: modules
            .filter((module) => module.tenantId === tenantId && module.courseId === courseId)
            .sort(byOrder)
            .map((module) => ({
              ...module,
              lessons: lessons
                .filter((lesson) => lesson.tenantId === tenantId && lesson.moduleId === module.id)
                .sort(byCreatedThenTitle),
            })),
        };
      },
      async create(tenantId, input) {
        const course: CourseRecord = {
          id: crypto.randomUUID(),
          tenantId,
          language: input.language,
          trackType: input.trackType,
          targetLevel: input.targetLevel,
          title: input.title,
          slug: input.slug,
          description: input.description,
          status: input.status,
          version: 1,
          createdBy: input.createdBy,
          publishedAt: input.status === "published" ? input.now : undefined,
          createdAt: input.now,
          updatedAt: input.now,
        };
        courses.push(course);
        return course;
      },
      async update(tenantId, courseId, input) {
        const index = courses.findIndex(
          (course) => course.tenantId === tenantId && course.id === courseId,
        );

        if (index === -1) {
          return null;
        }

        const existing = courses[index]!;
        const statusChanged = input.status && input.status !== existing.status;
        const updated: CourseRecord = {
          ...existing,
          language: input.language ?? existing.language,
          trackType: input.trackType ?? existing.trackType,
          targetLevel: input.targetLevel ?? existing.targetLevel,
          title: input.title ?? existing.title,
          slug: input.slug ?? existing.slug,
          description: input.description ?? existing.description,
          status: input.status ?? existing.status,
          version:
            existing.status === "published" || statusChanged
              ? existing.version + 1
              : existing.version,
          updatedAt: input.now,
        };
        courses[index] = updated;
        return updated;
      },
      async publish(tenantId, courseId, now) {
        const index = courses.findIndex(
          (course) => course.tenantId === tenantId && course.id === courseId,
        );

        if (index === -1) {
          return null;
        }

        const existing = courses[index]!;
        const updated: CourseRecord = {
          ...existing,
          status: "published",
          publishedAt: now,
          updatedAt: now,
          version: existing.version + 1,
        };
        courses[index] = updated;
        return updated;
      },
    },
    modules: {
      async create(tenantId, input) {
        const module: ModuleRecord = {
          id: crypto.randomUUID(),
          tenantId,
          courseId: input.courseId,
          title: input.title,
          description: input.description,
          orderIndex: input.orderIndex,
          status: input.status,
          createdAt: input.now,
          updatedAt: input.now,
        };
        modules.push(module);
        return module;
      },
      async findById(tenantId, moduleId) {
        return (
          modules.find((module) => module.tenantId === tenantId && module.id === moduleId) ?? null
        );
      },
      async listByCourse(tenantId, courseId) {
        return modules
          .filter((module) => module.tenantId === tenantId && module.courseId === courseId)
          .sort(byOrder);
      },
    },
    lessons: {
      async create(tenantId, input) {
        const lesson: LessonRecord = {
          id: crypto.randomUUID(),
          tenantId,
          courseId: input.courseId,
          moduleId: input.moduleId,
          title: input.title,
          slug: input.slug,
          description: input.description,
          language: input.language,
          targetLevel: input.targetLevel,
          estimatedMinutes: input.estimatedMinutes,
          objectives: input.objectives,
          status: input.status,
          version: 1,
          createdBy: input.createdBy,
          publishedAt: input.status === "published" ? input.now : undefined,
          createdAt: input.now,
          updatedAt: input.now,
        };
        lessons.push(lesson);
        return lesson;
      },
      async findById(tenantId, lessonId) {
        return (
          lessons.find((lesson) => lesson.tenantId === tenantId && lesson.id === lessonId) ?? null
        );
      },
      async findDetailById(tenantId, lessonId) {
        const lesson = lessons.find((item) => item.tenantId === tenantId && item.id === lessonId);

        if (!lesson) {
          return null;
        }

        return {
          ...lesson,
          blocks: blocks
            .filter((block) => block.tenantId === tenantId && block.lessonId === lessonId)
            .sort(byOrder),
          exercises: exercises
            .filter((exercise) => exercise.tenantId === tenantId && exercise.lessonId === lessonId)
            .sort(byOrder),
        };
      },
      async listByCourse(tenantId, courseId) {
        return lessons
          .filter((lesson) => lesson.tenantId === tenantId && lesson.courseId === courseId)
          .sort(byCreatedThenTitle);
      },
      async update(tenantId, lessonId, input) {
        const index = lessons.findIndex(
          (lesson) => lesson.tenantId === tenantId && lesson.id === lessonId,
        );

        if (index === -1) {
          return null;
        }

        const existing = lessons[index]!;
        const statusChanged = input.status && input.status !== existing.status;
        const updated: LessonRecord = {
          ...existing,
          courseId: input.courseId ?? existing.courseId,
          moduleId: input.moduleId ?? existing.moduleId,
          title: input.title ?? existing.title,
          slug: input.slug ?? existing.slug,
          description: input.description ?? existing.description,
          language: input.language ?? existing.language,
          targetLevel: input.targetLevel ?? existing.targetLevel,
          estimatedMinutes: input.estimatedMinutes ?? existing.estimatedMinutes,
          objectives: input.objectives ?? existing.objectives,
          status: input.status ?? existing.status,
          version:
            existing.status === "published" || statusChanged
              ? existing.version + 1
              : existing.version,
          updatedAt: input.now,
        };
        lessons[index] = updated;
        return updated;
      },
      async publish(tenantId, lessonId, now) {
        const index = lessons.findIndex(
          (lesson) => lesson.tenantId === tenantId && lesson.id === lessonId,
        );

        if (index === -1) {
          return null;
        }

        const existing = lessons[index]!;
        const updated: LessonRecord = {
          ...existing,
          status: "published",
          publishedAt: now,
          updatedAt: now,
          version: existing.version + 1,
        };
        lessons[index] = updated;
        return updated;
      },
    },
    blocks: {
      async create(tenantId, lessonId, input) {
        const block: LessonBlockRecord = {
          id: crypto.randomUUID(),
          tenantId,
          lessonId,
          type: input.type,
          orderIndex: input.orderIndex,
          content: input.content,
          createdAt: input.now,
          updatedAt: input.now,
        };
        blocks.push(block);
        return block;
      },
      async listByLesson(tenantId, lessonId) {
        return blocks
          .filter((block) => block.tenantId === tenantId && block.lessonId === lessonId)
          .sort(byOrder);
      },
    },
    progress: {
      async completeLesson(input) {
        const existing = lessonProgress.find(
          (progress) =>
            progress.tenantId === input.tenantId &&
            progress.userId === input.userId &&
            progress.lessonId === input.lessonId,
        );

        if (existing) {
          existing.status = "completed";
          existing.score = input.score;
          existing.completedAt = input.now;
          existing.lastActivityAt = input.now;
          existing.updatedAt = input.now;
          return existing;
        }

        const progress = createLessonProgress({
          ...input,
          status: "completed",
          startedAt: input.now,
          completedAt: input.now,
        });
        lessonProgress.push(progress);
        return progress;
      },
      async countCompletedLessons(input) {
        const courseLessonIds = new Set(
          lessons
            .filter(
              (lesson) => lesson.tenantId === input.tenantId && lesson.courseId === input.courseId,
            )
            .map((lesson) => lesson.id),
        );

        return lessonProgress.filter(
          (progress) =>
            progress.tenantId === input.tenantId &&
            progress.userId === input.userId &&
            progress.status === "completed" &&
            courseLessonIds.has(progress.lessonId),
        ).length;
      },
      async findCourseProgress(input) {
        return (
          courseProgress.find(
            (progress) =>
              progress.tenantId === input.tenantId &&
              progress.userId === input.userId &&
              progress.courseId === input.courseId,
          ) ?? null
        );
      },
      async findLessonProgress(input) {
        return (
          lessonProgress.find(
            (progress) =>
              progress.tenantId === input.tenantId &&
              progress.userId === input.userId &&
              progress.lessonId === input.lessonId,
          ) ?? null
        );
      },
      async listCourseProgressForUser(tenantId, userId) {
        return courseProgress.filter(
          (progress) => progress.tenantId === tenantId && progress.userId === userId,
        );
      },
      async listLessonProgressForUser(tenantId, userId) {
        return lessonProgress.filter(
          (progress) => progress.tenantId === tenantId && progress.userId === userId,
        );
      },
      async startLesson(input) {
        const existing = lessonProgress.find(
          (progress) =>
            progress.tenantId === input.tenantId &&
            progress.userId === input.userId &&
            progress.lessonId === input.lessonId,
        );

        if (existing) {
          existing.status = existing.status === "completed" ? "completed" : "in_progress";
          existing.startedAt ??= input.now;
          existing.lastActivityAt = input.now;
          existing.updatedAt = input.now;
          return existing;
        }

        const progress = createLessonProgress({
          ...input,
          status: "in_progress",
          startedAt: input.now,
        });
        lessonProgress.push(progress);
        return progress;
      },
      async upsertCourseProgress(input) {
        const existing = courseProgress.find(
          (progress) =>
            progress.tenantId === input.tenantId &&
            progress.userId === input.userId &&
            progress.courseId === input.courseId,
        );
        const progressPercent =
          input.totalLessons === 0
            ? 0
            : Math.round((input.completedLessons / input.totalLessons) * 100);
        const status =
          input.completedLessons === 0
            ? "not_started"
            : input.completedLessons >= input.totalLessons
              ? "completed"
              : "in_progress";

        if (existing) {
          existing.completedLessons = input.completedLessons;
          existing.totalLessons = input.totalLessons;
          existing.progressPercent = progressPercent;
          existing.status = status;
          existing.lastLessonId = input.lastLessonId;
          existing.updatedAt = input.now;
          return existing;
        }

        const progress: CourseProgressRecord = {
          id: crypto.randomUUID(),
          tenantId: input.tenantId,
          userId: input.userId,
          courseId: input.courseId,
          completedLessons: input.completedLessons,
          totalLessons: input.totalLessons,
          progressPercent,
          status,
          lastLessonId: input.lastLessonId,
          updatedAt: input.now,
        };
        courseProgress.push(progress);
        return progress;
      },
    },
    assignments: {
      async create(tenantId, input) {
        const assignment: AssignmentRecord = {
          id: crypto.randomUUID(),
          tenantId,
          courseId: input.courseId,
          assigneeType: input.assigneeType,
          assigneeId: input.assigneeId,
          assignedBy: input.assignedBy,
          dueDate: input.dueDate,
          status: input.status,
          createdAt: input.now,
          updatedAt: input.now,
        };
        assignments.push(assignment);
        return assignment;
      },
      async listForAssignee(input) {
        const groupIds = new Set(input.groupIds);
        return assignments.filter(
          (assignment) =>
            assignment.tenantId === input.tenantId &&
            assignment.status === "active" &&
            ((assignment.assigneeType === "user" && assignment.assigneeId === input.userId) ||
              (assignment.assigneeType === "group" && groupIds.has(assignment.assigneeId))),
        );
      },
      async listByTenant(tenantId, filters = {}) {
        return assignments.filter(
          (assignment) =>
            assignment.tenantId === tenantId &&
            (!filters.courseId || assignment.courseId === filters.courseId),
        );
      },
    },
  };
}

function createLessonProgress(input: {
  tenantId: string;
  userId: string;
  lessonId: string;
  status: LessonProgressRecord["status"];
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  now: Date;
}): LessonProgressRecord {
  return {
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    userId: input.userId,
    lessonId: input.lessonId,
    status: input.status,
    score: input.score,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    lastActivityAt: input.now,
    createdAt: input.now,
    updatedAt: input.now,
  };
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const normalizedPage = Math.max(page, 1);
  const normalizedPageSize = Math.min(Math.max(pageSize, 1), 100);
  const start = (normalizedPage - 1) * normalizedPageSize;

  return {
    data: items.slice(start, start + normalizedPageSize),
    page: normalizedPage,
    pageSize: normalizedPageSize,
    total: items.length,
  };
}

function byOrder<T extends { orderIndex: number }>(left: T, right: T): number {
  return left.orderIndex - right.orderIndex;
}

function byCreatedThenTitle<T extends { createdAt: Date; title: string }>(
  left: T,
  right: T,
): number {
  return (
    left.createdAt.getTime() - right.createdAt.getTime() || left.title.localeCompare(right.title)
  );
}
