import type { Actor } from "@polyglot/contracts";
import { hasPermission } from "@polyglot/authz";

import { ApiHttpError } from "./errors.js";
import type {
  AssignmentRecord,
  CourseDetail,
  CourseListFilters,
  CourseRecord,
  CreateAssignmentInput,
  CreateCourseInput,
  CreateLessonBlockInput,
  CreateLessonInput,
  CreateModuleInput,
  LessonDetail,
  LessonRecord,
  UpdateCourseInput,
  UpdateLessonInput,
} from "./learning-domain.js";
import { isPublished, type PaginatedResult } from "./learning-domain.js";
import type { LearningRepositories } from "./learning-repositories.js";

export class CourseService {
  constructor(private readonly repositories: LearningRepositories) {}

  async listCourses(input: {
    actor: Actor;
    tenantId: string;
    filters: CourseListFilters;
  }): Promise<PaginatedResult<CourseRecord>> {
    const filters = canViewDraftContent(input.actor)
      ? input.filters
      : {
          ...input.filters,
          status: "published" as const,
        };

    return this.repositories.courses.listByTenant(input.tenantId, filters);
  }

  async getCourseDetail(input: {
    actor: Actor;
    tenantId: string;
    courseId: string;
  }): Promise<CourseDetail> {
    const course = await this.repositories.courses.findDetailById(input.tenantId, input.courseId);

    if (!course || !canViewCourse(input.actor, course)) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    return filterCourseDetailForActor(input.actor, course);
  }

  async createCourse(input: {
    actor: Actor;
    tenantId: string;
    body: CreateCourseInput;
    now: Date;
  }): Promise<CourseRecord> {
    return this.repositories.courses.create(input.tenantId, {
      ...input.body,
      createdBy: input.actor.userId,
      now: input.now,
    });
  }

  async updateCourse(input: {
    actor: Actor;
    tenantId: string;
    courseId: string;
    body: UpdateCourseInput;
    now: Date;
  }): Promise<CourseRecord> {
    const existing = await this.repositories.courses.findById(input.tenantId, input.courseId);

    if (!existing) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    if (existing.status === "published" && !hasPermission(input.actor, "course:publish")) {
      throw new ApiHttpError(403, "course.published_update_forbidden", "Access denied.", {
        reason: "published_content_requires_publish_permission",
      });
    }

    const updated = await this.repositories.courses.update(input.tenantId, input.courseId, {
      ...input.body,
      now: input.now,
    });

    if (!updated) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    return updated;
  }

  async publishCourse(input: {
    tenantId: string;
    courseId: string;
    now: Date;
  }): Promise<CourseRecord> {
    const published = await this.repositories.courses.publish(
      input.tenantId,
      input.courseId,
      input.now,
    );

    if (!published) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    return published;
  }
}

export class LessonService {
  constructor(private readonly repositories: LearningRepositories) {}

  async getLessonDetail(input: {
    actor: Actor;
    tenantId: string;
    lessonId: string;
  }): Promise<unknown> {
    const lesson = await this.repositories.lessons.findDetailById(input.tenantId, input.lessonId);

    if (!lesson) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const course = await this.repositories.courses.findById(input.tenantId, lesson.courseId);

    if (!course || !canViewLesson(input.actor, course, lesson)) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    return canViewAnswerKeys(input.actor) ? lesson : redactLessonAnswerKeys(lesson);
  }

  async createModule(input: { tenantId: string; body: CreateModuleInput; now: Date }) {
    const course = await this.repositories.courses.findById(input.tenantId, input.body.courseId);

    if (!course) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    return this.repositories.modules.create(input.tenantId, {
      ...input.body,
      now: input.now,
    });
  }

  async createLesson(input: {
    actor: Actor;
    tenantId: string;
    body: CreateLessonInput;
    now: Date;
  }): Promise<LessonRecord> {
    const [course, module] = await Promise.all([
      this.repositories.courses.findById(input.tenantId, input.body.courseId),
      this.repositories.modules.findById(input.tenantId, input.body.moduleId),
    ]);

    if (!course) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    if (!module || module.courseId !== course.id) {
      throw new ApiHttpError(404, "module.not_found", "Module not found.");
    }

    return this.repositories.lessons.create(input.tenantId, {
      ...input.body,
      createdBy: input.actor.userId,
      now: input.now,
    });
  }

  async updateLesson(input: {
    actor: Actor;
    tenantId: string;
    lessonId: string;
    body: UpdateLessonInput;
    now: Date;
  }): Promise<LessonRecord> {
    const existing = await this.repositories.lessons.findById(input.tenantId, input.lessonId);

    if (!existing) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    if (existing.status === "published" && !hasPermission(input.actor, "lesson:publish")) {
      throw new ApiHttpError(403, "lesson.published_update_forbidden", "Access denied.", {
        reason: "published_content_requires_publish_permission",
      });
    }

    const updated = await this.repositories.lessons.update(input.tenantId, input.lessonId, {
      ...input.body,
      now: input.now,
    });

    if (!updated) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    return updated;
  }

  async publishLesson(input: {
    tenantId: string;
    lessonId: string;
    now: Date;
  }): Promise<LessonRecord> {
    const published = await this.repositories.lessons.publish(
      input.tenantId,
      input.lessonId,
      input.now,
    );

    if (!published) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    return published;
  }

  async createBlock(input: {
    tenantId: string;
    lessonId: string;
    body: CreateLessonBlockInput;
    now: Date;
  }) {
    const lesson = await this.repositories.lessons.findById(input.tenantId, input.lessonId);

    if (!lesson) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    return this.repositories.blocks.create(input.tenantId, input.lessonId, {
      ...input.body,
      now: input.now,
    });
  }
}

export class ProgressService {
  constructor(private readonly repositories: LearningRepositories) {}

  async startLesson(input: { actor: Actor; tenantId: string; lessonId: string; now: Date }) {
    const lesson = await this.repositories.lessons.findDetailById(input.tenantId, input.lessonId);

    if (!lesson) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const course = await this.repositories.courses.findById(input.tenantId, lesson.courseId);

    if (!course || !canViewLesson(input.actor, course, lesson)) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    return this.repositories.progress.startLesson({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      lessonId: lesson.id,
      now: input.now,
    });
  }

  async completeLesson(input: {
    actor: Actor;
    tenantId: string;
    lessonId: string;
    score?: number;
    now: Date;
  }) {
    const lesson = await this.repositories.lessons.findById(input.tenantId, input.lessonId);

    if (!lesson) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const course = await this.repositories.courses.findById(input.tenantId, lesson.courseId);

    if (!course || !canViewLesson(input.actor, course, lesson)) {
      throw new ApiHttpError(404, "lesson.not_found", "Lesson not found.");
    }

    const progress = await this.repositories.progress.completeLesson({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      lessonId: lesson.id,
      score: input.score,
      now: input.now,
    });
    const courseLessons = (
      await this.repositories.lessons.listByCourse(input.tenantId, course.id)
    ).filter((item) => item.status === "published");
    const completedLessons = await this.repositories.progress.countCompletedLessons({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      courseId: course.id,
    });
    const courseProgress = await this.repositories.progress.upsertCourseProgress({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      courseId: course.id,
      completedLessons,
      totalLessons: courseLessons.length,
      lastLessonId: lesson.id,
      now: input.now,
    });

    return {
      lessonProgress: progress,
      courseProgress,
    };
  }
}

export class AssignmentService {
  constructor(private readonly repositories: LearningRepositories) {}

  async listMine(input: { actor: Actor; tenantId: string }): Promise<AssignmentRecord[]> {
    return this.repositories.assignments.listForAssignee({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      groupIds: input.actor.groupIds,
    });
  }

  async createAssignment(input: {
    actor: Actor;
    tenantId: string;
    body: CreateAssignmentInput;
    now: Date;
  }): Promise<AssignmentRecord> {
    const course = await this.repositories.courses.findById(input.tenantId, input.body.courseId);

    if (!course) {
      throw new ApiHttpError(404, "course.not_found", "Course not found.");
    }

    if (!isPublished(course.status)) {
      throw new ApiHttpError(400, "assignment.course_not_published", "Course must be published.");
    }

    return this.repositories.assignments.create(input.tenantId, {
      ...input.body,
      assignedBy: input.actor.userId,
      now: input.now,
    });
  }
}

export class LearnerDashboardService {
  constructor(private readonly repositories: LearningRepositories) {}

  async getDashboard(input: { actor: Actor; tenantId: string }) {
    const [assignments, lessonProgress, courseProgress] = await Promise.all([
      this.repositories.assignments.listForAssignee({
        tenantId: input.tenantId,
        userId: input.actor.userId,
        groupIds: input.actor.groupIds,
      }),
      this.repositories.progress.listLessonProgressForUser(input.tenantId, input.actor.userId),
      this.repositories.progress.listCourseProgressForUser(input.tenantId, input.actor.userId),
    ]);
    const completedLessons = lessonProgress.filter(
      (progress) => progress.status === "completed",
    ).length;
    const continueLearning = await this.buildContinueLearning({
      assignments,
      courseProgress,
      lessonProgress,
      tenantId: input.tenantId,
    });
    const progressPercentAverage =
      courseProgress.length === 0
        ? 0
        : Math.round(
            courseProgress.reduce((sum, progress) => sum + progress.progressPercent, 0) /
              courseProgress.length,
          );

    return {
      dailyGoal: {
        targetMinutes: 15,
        completedMinutes: 0,
      },
      stats: {
        coursesInProgress: courseProgress.filter((progress) => progress.status === "in_progress")
          .length,
        completedLessons,
        assignedCourses: assignments.length,
        progressPercentAverage,
      },
      continueLearning,
      assignments,
      recentActivity: lessonProgress
        .slice()
        .sort((left, right) => right.lastActivityAt.getTime() - left.lastActivityAt.getTime())
        .slice(0, 5),
    };
  }

  private async buildContinueLearning(input: {
    assignments: AssignmentRecord[];
    courseProgress: Awaited<
      ReturnType<LearningRepositories["progress"]["listCourseProgressForUser"]>
    >;
    lessonProgress: Awaited<
      ReturnType<LearningRepositories["progress"]["listLessonProgressForUser"]>
    >;
    tenantId: string;
  }) {
    const inProgress = input.lessonProgress.find((progress) => progress.status === "in_progress");

    if (inProgress) {
      const lesson = await this.repositories.lessons.findById(input.tenantId, inProgress.lessonId);
      return lesson ? [toContinueLearningItem(lesson)] : [];
    }

    const dueAssignment = input.assignments
      .slice()
      .sort(
        (left, right) =>
          (left.dueDate?.getTime() ?? Infinity) - (right.dueDate?.getTime() ?? Infinity),
      )[0];

    if (dueAssignment) {
      const lesson = await this.firstUncompletedLesson({
        tenantId: input.tenantId,
        courseId: dueAssignment.courseId,
        completedLessonIds: new Set(
          input.lessonProgress
            .filter((progress) => progress.status === "completed")
            .map((progress) => progress.lessonId),
        ),
      });
      return lesson ? [toContinueLearningItem(lesson)] : [];
    }

    for (const progress of input.courseProgress) {
      const lesson = await this.firstUncompletedLesson({
        tenantId: input.tenantId,
        courseId: progress.courseId,
        completedLessonIds: new Set(
          input.lessonProgress
            .filter((item) => item.status === "completed")
            .map((item) => item.lessonId),
        ),
      });

      if (lesson) {
        return [toContinueLearningItem(lesson)];
      }
    }

    return [];
  }

  private async firstUncompletedLesson(input: {
    tenantId: string;
    courseId: string;
    completedLessonIds: Set<string>;
  }): Promise<LessonRecord | null> {
    const lessons = await this.repositories.lessons.listByCourse(input.tenantId, input.courseId);
    return (
      lessons.find(
        (lesson) => lesson.status === "published" && !input.completedLessonIds.has(lesson.id),
      ) ?? null
    );
  }
}

export function createLearningServices(repositories: LearningRepositories) {
  return {
    assignments: new AssignmentService(repositories),
    courses: new CourseService(repositories),
    dashboard: new LearnerDashboardService(repositories),
    lessons: new LessonService(repositories),
    progress: new ProgressService(repositories),
  };
}

function canViewDraftContent(actor: Actor): boolean {
  return (
    hasPermission(actor, "course:update") ||
    hasPermission(actor, "lesson:update") ||
    hasPermission(actor, "content:review")
  );
}

function canViewAnswerKeys(actor: Actor): boolean {
  return hasPermission(actor, "content:update") || hasPermission(actor, "content:review");
}

function canViewCourse(actor: Actor, course: CourseRecord): boolean {
  return isPublished(course.status) || canViewDraftContent(actor);
}

function canViewLesson(actor: Actor, course: CourseRecord, lesson: LessonRecord): boolean {
  return (isPublished(course.status) && isPublished(lesson.status)) || canViewDraftContent(actor);
}

function filterCourseDetailForActor(actor: Actor, course: CourseDetail): CourseDetail {
  if (canViewDraftContent(actor)) {
    return course;
  }

  return {
    ...course,
    modules: course.modules
      .filter((module) => module.status === "published")
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter((lesson) => lesson.status === "published"),
      })),
  };
}

function redactLessonAnswerKeys(lesson: LessonDetail) {
  return {
    ...lesson,
    exercises: lesson.exercises.map(({ answerKey: _answerKey, ...exercise }) => exercise),
  };
}

function toContinueLearningItem(lesson: LessonRecord) {
  return {
    courseId: lesson.courseId,
    lessonId: lesson.id,
    title: lesson.title,
    language: lesson.language,
    targetLevel: lesson.targetLevel,
    estimatedMinutes: lesson.estimatedMinutes,
  };
}
