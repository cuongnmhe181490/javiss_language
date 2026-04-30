import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  CourseDetail,
  CourseListFilters,
  CourseProgressRecord,
  CourseRecord,
  LessonDetail,
  LessonProgressRecord,
  LessonRecord,
  ModuleRecord,
  PaginatedResult,
} from "./learning-domain.js";
import type { LearningRepositories } from "./learning-repositories.js";

export function createPrismaLearningRepositories(prisma: PrismaClient): LearningRepositories {
  return {
    courses: {
      async listByTenant(tenantId, filters) {
        const where = {
          tenantId,
          language: filters.language,
          targetLevel: filters.level,
          trackType: filters.trackType,
          status: filters.status,
        };
        const page = Math.max(filters.page, 1);
        const pageSize = Math.min(Math.max(filters.pageSize, 1), 100);
        const [total, rows] = await prisma.$transaction([
          prisma.course.count({ where }),
          prisma.course.findMany({
            orderBy: [{ createdAt: "asc" }, { title: "asc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            where,
          }),
        ]);

        return {
          data: rows.map(mapCourse),
          page,
          pageSize,
          total,
        };
      },
      async findById(tenantId, courseId) {
        const course = await prisma.course.findFirst({
          where: {
            id: courseId,
            tenantId,
          },
        });

        return course ? mapCourse(course) : null;
      },
      async findDetailById(tenantId, courseId) {
        const course = await prisma.course.findFirst({
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: [{ createdAt: "asc" }, { title: "asc" }],
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
          where: {
            id: courseId,
            tenantId,
          },
        });

        return course
          ? {
              ...mapCourse(course),
              modules: course.modules.map((module) => ({
                ...mapModule(module),
                lessons: module.lessons.map(mapLesson),
              })),
            }
          : null;
      },
      async create(tenantId, input) {
        const course = await prisma.course.create({
          data: {
            tenantId,
            language: input.language,
            trackType: input.trackType,
            targetLevel: input.targetLevel,
            title: input.title,
            slug: input.slug,
            description: input.description,
            status: input.status,
            createdBy: input.createdBy,
            publishedAt: input.status === "published" ? input.now : null,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapCourse(course);
      },
      async update(tenantId, courseId, input) {
        const existing = await prisma.course.findFirst({
          where: {
            id: courseId,
            tenantId,
          },
        });

        if (!existing) {
          return null;
        }

        const statusChanged = Boolean(input.status && input.status !== existing.status);
        const course = await prisma.course.update({
          data: {
            ...definedCourseUpdate(input),
            version:
              existing.status === "published" || statusChanged
                ? { increment: 1 }
                : existing.version,
            updatedAt: input.now,
          },
          where: {
            id: courseId,
          },
        });

        return mapCourse(course);
      },
      async publish(tenantId, courseId, now) {
        const existing = await prisma.course.findFirst({
          where: {
            id: courseId,
            tenantId,
          },
        });

        if (!existing) {
          return null;
        }

        const course = await prisma.course.update({
          data: {
            status: "published",
            publishedAt: now,
            updatedAt: now,
            version: { increment: 1 },
          },
          where: {
            id: courseId,
          },
        });

        return mapCourse(course);
      },
    },
    modules: {
      async create(tenantId, input) {
        const module = await prisma.module.create({
          data: {
            tenantId,
            courseId: input.courseId,
            title: input.title,
            description: input.description,
            orderIndex: input.orderIndex,
            status: input.status,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapModule(module);
      },
      async findById(tenantId, moduleId) {
        const module = await prisma.module.findFirst({
          where: {
            id: moduleId,
            tenantId,
          },
        });

        return module ? mapModule(module) : null;
      },
      async listByCourse(tenantId, courseId) {
        const modules = await prisma.module.findMany({
          orderBy: { orderIndex: "asc" },
          where: {
            courseId,
            tenantId,
          },
        });

        return modules.map(mapModule);
      },
    },
    lessons: {
      async create(tenantId, input) {
        const lesson = await prisma.lesson.create({
          data: {
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
            createdBy: input.createdBy,
            publishedAt: input.status === "published" ? input.now : null,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return mapLesson(lesson);
      },
      async findById(tenantId, lessonId) {
        const lesson = await prisma.lesson.findFirst({
          where: {
            id: lessonId,
            tenantId,
          },
        });

        return lesson ? mapLesson(lesson) : null;
      },
      async findDetailById(tenantId, lessonId) {
        const lesson = await prisma.lesson.findFirst({
          include: {
            blocks: {
              orderBy: { orderIndex: "asc" },
            },
            exercises: {
              orderBy: { orderIndex: "asc" },
            },
          },
          where: {
            id: lessonId,
            tenantId,
          },
        });

        return lesson
          ? {
              ...mapLesson(lesson),
              blocks: lesson.blocks.map((block) => ({
                id: block.id,
                tenantId: block.tenantId,
                lessonId: block.lessonId,
                type: block.type as LessonDetail["blocks"][number]["type"],
                orderIndex: block.orderIndex,
                content: jsonObject(block.content),
                createdAt: block.createdAt,
                updatedAt: block.updatedAt,
              })),
              exercises: lesson.exercises.map((exercise) => ({
                id: exercise.id,
                tenantId: exercise.tenantId,
                lessonId: exercise.lessonId,
                type: exercise.type as LessonDetail["exercises"][number]["type"],
                prompt: exercise.prompt,
                content: jsonObject(exercise.content),
                answerKey: jsonObject(exercise.answerKey),
                explanation: exercise.explanation ?? undefined,
                points: exercise.points,
                orderIndex: exercise.orderIndex,
                createdAt: exercise.createdAt,
                updatedAt: exercise.updatedAt,
              })),
            }
          : null;
      },
      async listByCourse(tenantId, courseId) {
        const lessons = await prisma.lesson.findMany({
          orderBy: [{ createdAt: "asc" }, { title: "asc" }],
          where: {
            courseId,
            tenantId,
          },
        });

        return lessons.map(mapLesson);
      },
      async update(tenantId, lessonId, input) {
        const existing = await prisma.lesson.findFirst({
          where: {
            id: lessonId,
            tenantId,
          },
        });

        if (!existing) {
          return null;
        }

        const statusChanged = Boolean(input.status && input.status !== existing.status);
        const lesson = await prisma.lesson.update({
          data: {
            ...definedLessonUpdate(input),
            version:
              existing.status === "published" || statusChanged
                ? { increment: 1 }
                : existing.version,
            updatedAt: input.now,
          },
          where: {
            id: lessonId,
          },
        });

        return mapLesson(lesson);
      },
      async publish(tenantId, lessonId, now) {
        const existing = await prisma.lesson.findFirst({
          where: {
            id: lessonId,
            tenantId,
          },
        });

        if (!existing) {
          return null;
        }

        const lesson = await prisma.lesson.update({
          data: {
            status: "published",
            publishedAt: now,
            updatedAt: now,
            version: { increment: 1 },
          },
          where: {
            id: lessonId,
          },
        });

        return mapLesson(lesson);
      },
    },
    blocks: {
      async create(tenantId, lessonId, input) {
        const block = await prisma.lessonBlock.create({
          data: {
            tenantId,
            lessonId,
            type: input.type,
            orderIndex: input.orderIndex,
            content: input.content as Prisma.InputJsonValue,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return {
          id: block.id,
          tenantId: block.tenantId,
          lessonId: block.lessonId,
          type: block.type as LessonDetail["blocks"][number]["type"],
          orderIndex: block.orderIndex,
          content: jsonObject(block.content),
          createdAt: block.createdAt,
          updatedAt: block.updatedAt,
        };
      },
      async listByLesson(tenantId, lessonId) {
        const blocks = await prisma.lessonBlock.findMany({
          orderBy: { orderIndex: "asc" },
          where: {
            lessonId,
            tenantId,
          },
        });

        return blocks.map((block) => ({
          id: block.id,
          tenantId: block.tenantId,
          lessonId: block.lessonId,
          type: block.type as LessonDetail["blocks"][number]["type"],
          orderIndex: block.orderIndex,
          content: jsonObject(block.content),
          createdAt: block.createdAt,
          updatedAt: block.updatedAt,
        }));
      },
    },
    progress: {
      async completeLesson(input) {
        const progress = await prisma.lessonProgress.upsert({
          create: {
            tenantId: input.tenantId,
            userId: input.userId,
            lessonId: input.lessonId,
            status: "completed",
            score: input.score,
            startedAt: input.now,
            completedAt: input.now,
            lastActivityAt: input.now,
            createdAt: input.now,
            updatedAt: input.now,
          },
          update: {
            status: "completed",
            score: input.score,
            completedAt: input.now,
            lastActivityAt: input.now,
            updatedAt: input.now,
          },
          where: {
            tenantId_userId_lessonId: {
              tenantId: input.tenantId,
              userId: input.userId,
              lessonId: input.lessonId,
            },
          },
        });

        return mapLessonProgress(progress);
      },
      async countCompletedLessons(input) {
        const lessons = await prisma.lesson.findMany({
          select: { id: true },
          where: {
            courseId: input.courseId,
            tenantId: input.tenantId,
          },
        });

        return prisma.lessonProgress.count({
          where: {
            lessonId: {
              in: lessons.map((lesson) => lesson.id),
            },
            status: "completed",
            tenantId: input.tenantId,
            userId: input.userId,
          },
        });
      },
      async findCourseProgress(input) {
        const progress = await prisma.courseProgress.findUnique({
          where: {
            tenantId_userId_courseId: input,
          },
        });

        return progress ? mapCourseProgress(progress) : null;
      },
      async findLessonProgress(input) {
        const progress = await prisma.lessonProgress.findUnique({
          where: {
            tenantId_userId_lessonId: input,
          },
        });

        return progress ? mapLessonProgress(progress) : null;
      },
      async listCourseProgressForUser(tenantId, userId) {
        const rows = await prisma.courseProgress.findMany({
          where: {
            tenantId,
            userId,
          },
        });

        return rows.map(mapCourseProgress);
      },
      async listLessonProgressForUser(tenantId, userId) {
        const rows = await prisma.lessonProgress.findMany({
          where: {
            tenantId,
            userId,
          },
        });

        return rows.map(mapLessonProgress);
      },
      async startLesson(input) {
        const progress = await prisma.lessonProgress.upsert({
          create: {
            tenantId: input.tenantId,
            userId: input.userId,
            lessonId: input.lessonId,
            status: "in_progress",
            startedAt: input.now,
            lastActivityAt: input.now,
            createdAt: input.now,
            updatedAt: input.now,
          },
          update: {
            lastActivityAt: input.now,
            startedAt: input.now,
            status: "in_progress",
            updatedAt: input.now,
          },
          where: {
            tenantId_userId_lessonId: {
              tenantId: input.tenantId,
              userId: input.userId,
              lessonId: input.lessonId,
            },
          },
        });

        return mapLessonProgress(progress);
      },
      async upsertCourseProgress(input) {
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
        const progress = await prisma.courseProgress.upsert({
          create: {
            tenantId: input.tenantId,
            userId: input.userId,
            courseId: input.courseId,
            completedLessons: input.completedLessons,
            totalLessons: input.totalLessons,
            progressPercent,
            status,
            lastLessonId: input.lastLessonId,
            updatedAt: input.now,
          },
          update: {
            completedLessons: input.completedLessons,
            totalLessons: input.totalLessons,
            progressPercent,
            status,
            lastLessonId: input.lastLessonId,
            updatedAt: input.now,
          },
          where: {
            tenantId_userId_courseId: {
              tenantId: input.tenantId,
              userId: input.userId,
              courseId: input.courseId,
            },
          },
        });

        return mapCourseProgress(progress);
      },
    },
    assignments: {
      async create(tenantId, input) {
        const assignment = await prisma.assignment.create({
          data: {
            tenantId,
            courseId: input.courseId,
            assigneeType: input.assigneeType,
            assigneeId: input.assigneeId,
            assignedBy: input.assignedBy,
            dueDate: input.dueDate,
            status: input.status,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });

        return {
          id: assignment.id,
          tenantId: assignment.tenantId,
          courseId: assignment.courseId,
          assigneeType: assignment.assigneeType as "user" | "group",
          assigneeId: assignment.assigneeId,
          assignedBy: assignment.assignedBy,
          dueDate: assignment.dueDate ?? undefined,
          status: assignment.status as "draft" | "active" | "paused" | "completed" | "archived",
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
        };
      },
      async listForAssignee(input) {
        const rows = await prisma.assignment.findMany({
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          where: {
            tenantId: input.tenantId,
            status: "active",
            OR: [
              {
                assigneeType: "user",
                assigneeId: input.userId,
              },
              {
                assigneeType: "group",
                assigneeId: {
                  in: input.groupIds,
                },
              },
            ],
          },
        });

        return rows.map(mapAssignment);
      },
      async listByTenant(tenantId, filters = {}) {
        const rows = await prisma.assignment.findMany({
          where: {
            tenantId,
            courseId: filters.courseId,
          },
        });

        return rows.map(mapAssignment);
      },
    },
  };
}

function mapCourse(course: Prisma.CourseGetPayload<object>): CourseRecord {
  return {
    id: course.id,
    tenantId: course.tenantId,
    language: course.language as CourseRecord["language"],
    trackType: course.trackType as CourseRecord["trackType"],
    targetLevel: course.targetLevel,
    title: course.title,
    slug: course.slug,
    description: course.description,
    status: course.status as CourseRecord["status"],
    version: course.version,
    createdBy: course.createdBy ?? undefined,
    publishedAt: course.publishedAt ?? undefined,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

function mapModule(module: Prisma.ModuleGetPayload<object>): ModuleRecord {
  return {
    id: module.id,
    tenantId: module.tenantId,
    courseId: module.courseId,
    title: module.title,
    description: module.description ?? undefined,
    orderIndex: module.orderIndex,
    status: module.status as ModuleRecord["status"],
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
  };
}

function mapLesson(lesson: Prisma.LessonGetPayload<object>): LessonRecord {
  return {
    id: lesson.id,
    tenantId: lesson.tenantId,
    courseId: lesson.courseId,
    moduleId: lesson.moduleId,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description ?? undefined,
    language: lesson.language as LessonRecord["language"],
    targetLevel: lesson.targetLevel,
    estimatedMinutes: lesson.estimatedMinutes,
    objectives: Array.isArray(lesson.objectives) ? lesson.objectives.map(String) : [],
    status: lesson.status as LessonRecord["status"],
    version: lesson.version,
    createdBy: lesson.createdBy ?? undefined,
    publishedAt: lesson.publishedAt ?? undefined,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

function mapLessonProgress(
  progress: Prisma.LessonProgressGetPayload<object>,
): LessonProgressRecord {
  return {
    id: progress.id,
    tenantId: progress.tenantId,
    userId: progress.userId,
    lessonId: progress.lessonId,
    status: progress.status as LessonProgressRecord["status"],
    score: progress.score ?? undefined,
    startedAt: progress.startedAt ?? undefined,
    completedAt: progress.completedAt ?? undefined,
    lastActivityAt: progress.lastActivityAt,
    createdAt: progress.createdAt,
    updatedAt: progress.updatedAt,
  };
}

function mapCourseProgress(
  progress: Prisma.CourseProgressGetPayload<object>,
): CourseProgressRecord {
  return {
    id: progress.id,
    tenantId: progress.tenantId,
    userId: progress.userId,
    courseId: progress.courseId,
    status: progress.status as CourseProgressRecord["status"],
    completedLessons: progress.completedLessons,
    totalLessons: progress.totalLessons,
    progressPercent: progress.progressPercent,
    lastLessonId: progress.lastLessonId ?? undefined,
    updatedAt: progress.updatedAt,
  };
}

function mapAssignment(assignment: Prisma.AssignmentGetPayload<object>) {
  return {
    id: assignment.id,
    tenantId: assignment.tenantId,
    courseId: assignment.courseId,
    assigneeType: assignment.assigneeType as "user" | "group",
    assigneeId: assignment.assigneeId,
    assignedBy: assignment.assignedBy,
    dueDate: assignment.dueDate ?? undefined,
    status: assignment.status as "draft" | "active" | "paused" | "completed" | "archived",
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
  };
}

function definedCourseUpdate(input: Record<string, unknown>): Prisma.CourseUpdateInput {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => key !== "now" && value !== undefined),
  ) as Prisma.CourseUpdateInput;
}

function definedLessonUpdate(input: Record<string, unknown>): Prisma.LessonUpdateInput {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) => key !== "now" && value !== undefined),
  ) as Prisma.LessonUpdateInput;
}

function jsonObject(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
