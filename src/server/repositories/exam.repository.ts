import { prisma } from "@/lib/db/prisma";

export async function findExamByCode(code: string) {
  return prisma.exam.findUnique({
    where: { code },
    include: { language: true },
  });
}

export async function findLanguageByCode(code: string) {
  return prisma.language.findUnique({
    where: { code },
  });
}

export async function listExams() {
  return prisma.exam.findMany({
    include: { language: true },
    orderBy: { name: "asc" },
  });
}
