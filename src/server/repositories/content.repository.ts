import { prisma } from "@/lib/db/prisma";

export async function listContentOverview() {
  return prisma.topic.findMany({
    include: {
      examPack: {
        include: {
          exam: true,
        },
      },
      lessons: {
        include: {
          exercises: {
            include: {
              questions: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function listContentFormOptions() {
  const [topics, lessons] = await Promise.all([
    prisma.topic.findMany({
      include: {
        examPack: {
          include: {
            exam: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.lesson.findMany({
      include: {
        topic: true,
      },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  return {
    topics,
    lessons,
  };
}

export async function findLessonBySlug(slug: string) {
  return prisma.lesson.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export async function findExerciseBySlug(slug: string) {
  return prisma.exercise.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export async function createLesson(input: {
  topicId: string;
  slug: string;
  title: string;
  summary?: string;
  status: "draft" | "published" | "archived";
}) {
  return prisma.lesson.create({
    data: {
      topicId: input.topicId,
      slug: input.slug,
      title: input.title,
      summary: input.summary || null,
      status: input.status,
    },
  });
}

export async function createExerciseWithQuestions(input: {
  lessonId: string;
  slug: string;
  title: string;
  type: "practice" | "mock_test" | "assessment";
  instructions?: string;
  questionType:
    | "multiple_choice"
    | "short_answer"
    | "essay"
    | "speaking"
    | "listening"
    | "reading";
  questionPrompts: string[];
}) {
  return prisma.$transaction(async (tx) => {
    const exercise = await tx.exercise.create({
      data: {
        lessonId: input.lessonId,
        slug: input.slug,
        title: input.title,
        type: input.type,
        instructions: input.instructions || null,
      },
    });

    await tx.question.createMany({
      data: input.questionPrompts.map((prompt) => ({
        exerciseId: exercise.id,
        prompt,
        type: input.questionType,
      })),
    });

    return exercise;
  });
}
