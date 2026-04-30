import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export function createPrismaClient(databaseUrl = process.env.DATABASE_URL): PrismaClient {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a Prisma client.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });
}

export function getPrismaClient(databaseUrl = process.env.DATABASE_URL): PrismaClient {
  prismaClient ??= createPrismaClient(databaseUrl);
  return prismaClient;
}
