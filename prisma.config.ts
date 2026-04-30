import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma ORM v7 reads connection URLs from prisma.config.ts.
    // `prisma generate` can run without a database URL; migrate/seed require one.
    url: process.env.DATABASE_URL ?? "",
  },
});
