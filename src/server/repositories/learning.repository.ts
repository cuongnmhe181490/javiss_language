import { prisma } from "@/lib/db/prisma";

export async function getLearningCatalogForUser(userId: string) {
  const goal = await prisma.goal.findFirst({
    where: {
      userId,
      status: "active",
    },
    include: {
      exam: true,
      language: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!goal) {
    return null;
  }

  const packs = await prisma.examPack.findMany({
    where: {
      examId: goal.examId,
      languageId: goal.languageId,
      isActive: true,
    },
    include: {
      topics: {
        include: {
          lessons: {
            where: { status: "published" },
            include: {
              exercises: {
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    goal,
    packs,
  };
}

export async function getExerciseBySlug(slug: string) {
  return prisma.exercise.findUnique({
    where: { slug },
    include: {
      lesson: {
        include: {
          topic: {
            include: {
              examPack: {
                include: {
                  exam: true,
                  language: true,
                },
              },
            },
          },
        },
      },
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
