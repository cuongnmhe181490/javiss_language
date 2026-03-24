-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'lesson_created';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'exercise_created';
