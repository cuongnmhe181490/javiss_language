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

export async function upsertSettings(entries: Array<{ key: string; value: string }>) {
  return prisma.$transaction(
    entries.map((entry) =>
      prisma.systemSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      }),
    ),
  );
}
