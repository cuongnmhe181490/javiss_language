import { prisma } from "@/lib/db/prisma";

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({
    include: {
      licenses: true,
      entitlements: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPlan(input: {
  code: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  isDefault: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.subscriptionPlan.updateMany({
        data: { isDefault: false },
      });
    }

    return tx.subscriptionPlan.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description || null,
        priceCents: input.priceCents,
        currency: input.currency,
        isDefault: input.isDefault,
      },
    });
  });
}
