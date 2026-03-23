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
      attempts: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          answers: true,
        },
      },
    },
  });
}

export async function getExerciseDetailForUser(slug: string, userId: string) {
  const exercise = await prisma.exercise.findUnique({
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
      attempts: {
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          answers: true,
        },
      },
    },
  });

  if (!exercise) {
    return null;
  }

  const currentAttempt =
    exercise.attempts.find((attempt) => attempt.status === "draft") ?? exercise.attempts[0] ?? null;

  return {
    ...exercise,
    currentAttempt,
  };
}

export async function upsertExerciseAttempt(input: {
  userId: string;
  exerciseId: string;
  status: "draft" | "submitted";
  answers: Array<{ questionId: string; answerText: string }>;
}) {
  return prisma.$transaction(async (tx) => {
    let attempt = await tx.exerciseAttempt.findFirst({
      where: {
        userId: input.userId,
        exerciseId: input.exerciseId,
        status: "draft",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!attempt || input.status === "submitted" && attempt.status !== "draft") {
      attempt = await tx.exerciseAttempt.create({
        data: {
          userId: input.userId,
          exerciseId: input.exerciseId,
          status: input.status,
          submittedAt: input.status === "submitted" ? new Date() : null,
        },
      });
    } else {
      attempt = await tx.exerciseAttempt.update({
        where: { id: attempt.id },
        data: {
          status: input.status,
          submittedAt: input.status === "submitted" ? new Date() : null,
        },
      });
    }

    for (const answer of input.answers) {
      await tx.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: answer.questionId,
          },
        },
        update: {
          answerText: answer.answerText,
        },
        create: {
          attemptId: attempt.id,
          questionId: answer.questionId,
          answerText: answer.answerText,
        },
      });
    }

    return tx.exerciseAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        answers: true,
        exercise: {
          include: {
            questions: true,
          },
        },
      },
    });
  });
}

export async function updateProgressFromAttempt(input: {
  userId: string;
  exerciseId: string;
}) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: input.exerciseId },
    include: {
      questions: true,
    },
  });

  if (!exercise) {
    return null;
  }

  const questionTypes = exercise.questions.map((question) => question.type);
  const dominantType = questionTypes[0] ?? "reading";

  const latestSnapshot = await prisma.progressSnapshot.findFirst({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
  });

  const base = latestSnapshot ?? {
    overallProgress: 0,
    speakingProgress: 0,
    writingProgress: 0,
    readingProgress: 0,
    listeningProgress: 0,
    notes: null,
  };

  const next = {
    overallProgress: Math.min(base.overallProgress + 10, 100),
    speakingProgress: base.speakingProgress,
    writingProgress: base.writingProgress,
    readingProgress: base.readingProgress,
    listeningProgress: base.listeningProgress,
  };

  if (dominantType === "speaking") {
    next.speakingProgress = Math.min(base.speakingProgress + 15, 100);
  }

  if (dominantType === "essay") {
    next.writingProgress = Math.min(base.writingProgress + 15, 100);
  }

  if (dominantType === "reading" || dominantType === "multiple_choice" || dominantType === "short_answer") {
    next.readingProgress = Math.min(base.readingProgress + 15, 100);
  }

  if (dominantType === "listening") {
    next.listeningProgress = Math.min(base.listeningProgress + 15, 100);
  }

  return prisma.progressSnapshot.create({
    data: {
      userId: input.userId,
      overallProgress: next.overallProgress,
      speakingProgress: next.speakingProgress,
      writingProgress: next.writingProgress,
      readingProgress: next.readingProgress,
      listeningProgress: next.listeningProgress,
      notes: `Đã nộp bài luyện ${exercise.title}.`,
    },
  });
}

export async function listRecentAttemptsByUser(userId: string) {
  return prisma.exerciseAttempt.findMany({
    where: { userId },
    include: {
      exercise: {
        include: {
          lesson: {
            include: {
              topic: true,
            },
          },
        },
      },
      answers: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
