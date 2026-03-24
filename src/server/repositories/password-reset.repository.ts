import { prisma } from "@/lib/db/prisma";

export async function invalidateActivePasswordResetTokens(userId: string) {
  return prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  sentToEmail: string;
}) {
  return prisma.passwordResetToken.create({
    data: input,
  });
}

export async function findPasswordResetTokenByHash(tokenHash: string) {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}

export async function completePasswordReset(input: {
  tokenId: string;
  userId: string;
  passwordHash: string;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: {
        userId: input.userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: input.userId },
      data: {
        passwordHash: input.passwordHash,
      },
    });
  });
}
