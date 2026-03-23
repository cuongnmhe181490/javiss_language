import { prisma } from "@/lib/db/prisma";

export async function getSettingValue(key: string) {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function getAllSettings() {
  return prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });
}
