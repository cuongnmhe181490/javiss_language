/**
 * Seed script for real learning content - Module 1 (A1 - Giao tiếp cơ bản)
 * Creates a complete course with 8 lessons for English for Vietnamese Speakers.
 *
 * Usage:
 *   npx tsx prisma/content/seed-real-content.ts          # seed the database
 *   npx tsx prisma/content/seed-real-content.ts --dry-run # compile check only
 */

import { module1Lessons, LessonData, ExerciseData, VocabItem, GrammarPointData } from "./module1-lessons";

// Fixed IDs for deterministic seeding (upsert-safe)
const TENANT_ID = "11111111-1111-4111-8111-111111111111"; // same as tenantAlpha in seed.ts
const ADMIN_USER_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const COURSE_ID = "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1";
const MODULE_ID = "b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1";

// Generate deterministic UUIDs based on prefix + index
function makeId(prefix: string, lessonIdx: number, itemIdx: number = 0): string {
  const hex = (n: number, len: number) => n.toString(16).padStart(len, "0");
  const p = prefix.padEnd(8, "0").slice(0, 8);
  const l = hex(lessonIdx, 4);
  const i = hex(itemIdx, 4);
  return `${p}-${l}-4${l.slice(1)}-8${i.slice(1)}-${p}${l}${i}`;
}

// Lesson IDs
function lessonId(idx: number): string {
  return makeId("c1c1c1c1", idx);
}

// Block IDs
function blockId(lessonIdx: number, blockIdx: number): string {
  return makeId("d1d1d1d1", lessonIdx, blockIdx);
}

// Vocab IDs
function vocabId(lessonIdx: number, itemIdx: number): string {
  return makeId("e1e1e1e1", lessonIdx, itemIdx);
}

// Grammar IDs
function grammarId(lessonIdx: number, itemIdx: number): string {
  return makeId("f1f1f1f1", lessonIdx, itemIdx);
}

// Exercise IDs
function exerciseId(lessonIdx: number, itemIdx: number): string {
  return makeId("a2a2a2a2", lessonIdx, itemIdx);
}

interface SeedAction {
  model: string;
  operation: "upsert";
  data: Record<string, unknown>;
}

function buildSeedActions(): SeedAction[] {
  const actions: SeedAction[] = [];
  const publishedAt = new Date("2026-05-20T00:00:00.000Z");

  // 1. Course
  actions.push({
    model: "course",
    operation: "upsert",
    data: {
      id: COURSE_ID,
      tenantId: TENANT_ID,
      language: "en",
      trackType: "general",
      targetLevel: "A1",
      title: "English for Vietnamese Speakers",
      slug: "english-for-vietnamese-speakers",
      description: "Khóa học tiếng Anh dành cho người Việt, từ cơ bản đến giao tiếp tự tin. Bắt đầu từ A1 với các tình huống hàng ngày.",
      status: "published",
      version: 1,
      createdBy: ADMIN_USER_ID,
      publishedAt,
    },
  });

  // 2. Module
  actions.push({
    model: "module",
    operation: "upsert",
    data: {
      id: MODULE_ID,
      tenantId: TENANT_ID,
      courseId: COURSE_ID,
      title: "A1 - Giao tiếp cơ bản",
      description: "Module cơ bản giúp bạn tự tin giao tiếp tiếng Anh trong các tình huống hàng ngày: chào hỏi, giới thiệu bản thân, nói về gia đình, công việc và sở thích.",
      orderIndex: 0,
      status: "published",
    },
  });

  // 3. Lessons + Blocks + Vocab + Grammar + Exercises
  module1Lessons.forEach((lesson: LessonData, lIdx: number) => {
    const lId = lessonId(lIdx);

    // Lesson
    actions.push({
      model: "lesson",
      operation: "upsert",
      data: {
        id: lId,
        tenantId: TENANT_ID,
        courseId: COURSE_ID,
        moduleId: MODULE_ID,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        language: "en",
        targetLevel: "A1",
        estimatedMinutes: lesson.estimatedMinutes,
        objectives: lesson.objectives,
        status: "published",
        version: 1,
        createdBy: ADMIN_USER_ID,
        publishedAt,
      },
    });

    // Lesson Blocks
    lesson.blocks.forEach((block, bIdx) => {
      actions.push({
        model: "lessonBlock",
        operation: "upsert",
        data: {
          id: blockId(lIdx, bIdx),
          tenantId: TENANT_ID,
          lessonId: lId,
          type: block.type,
          orderIndex: bIdx,
          content: block.content,
        },
      });
    });

    // Vocabulary Items
    lesson.vocabulary.forEach((vocab: VocabItem, vIdx: number) => {
      actions.push({
        model: "vocabularyItem",
        operation: "upsert",
        data: {
          id: vocabId(lIdx, vIdx),
          tenantId: TENANT_ID,
          language: "en",
          term: vocab.term,
          meaning: vocab.meaning,
          partOfSpeech: vocab.partOfSpeech,
          level: "A1",
          tags: ["module1", `lesson${lIdx + 1}`, vocab.partOfSpeech],
        },
      });
    });

    // Grammar Points
    lesson.grammar.forEach((gp: GrammarPointData, gIdx: number) => {
      actions.push({
        model: "grammarPoint",
        operation: "upsert",
        data: {
          id: grammarId(lIdx, gIdx),
          tenantId: TENANT_ID,
          language: "en",
          title: gp.title,
          pattern: gp.pattern,
          explanation: gp.explanation,
          level: "A1",
          examples: gp.examples,
        },
      });
    });

    // Exercises
    lesson.exercises.forEach((ex: ExerciseData, eIdx: number) => {
      actions.push({
        model: "exercise",
        operation: "upsert",
        data: {
          id: exerciseId(lIdx, eIdx),
          tenantId: TENANT_ID,
          lessonId: lId,
          type: ex.type,
          prompt: ex.prompt,
          content: ex.content,
          answerKey: ex.answerKey,
          explanation: ex.explanation,
          points: ex.points,
          orderIndex: eIdx,
        },
      });
    });
  });

  return actions;
}

async function seedRealContent() {
  const isDryRun = process.argv.includes("--dry-run");

  const actions = buildSeedActions();

  console.log(`[seed-real-content] Built ${actions.length} seed actions for Module 1`);
  console.log(`  - 1 course`);
  console.log(`  - 1 module`);
  console.log(`  - ${module1Lessons.length} lessons`);
  console.log(`  - ${actions.filter((a) => a.model === "lessonBlock").length} lesson blocks`);
  console.log(`  - ${actions.filter((a) => a.model === "vocabularyItem").length} vocabulary items`);
  console.log(`  - ${actions.filter((a) => a.model === "grammarPoint").length} grammar points`);
  console.log(`  - ${actions.filter((a) => a.model === "exercise").length} exercises`);

  if (isDryRun) {
    console.log("\n[dry-run] Compilation successful. No database operations performed.");
    console.log("[dry-run] Sample actions:");
    console.log(JSON.stringify(actions.slice(0, 3), null, 2));
    return;
  }

  // Actual seeding requires Prisma client
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("@prisma/client");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    for (const action of actions) {
      const model = prisma[action.model as keyof typeof prisma] as any;
      if (!model || !model.upsert) {
        console.warn(`[skip] Unknown model: ${action.model}`);
        continue;
      }

      const { id, ...rest } = action.data as { id: string; [key: string]: unknown };

      await model.upsert({
        where: { id },
        update: rest,
        create: action.data,
      });
    }

    console.log("\n[seed-real-content] Successfully seeded all Module 1 content!");
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use from main seed.ts
export { seedRealContent, buildSeedActions };

// Run directly if executed as script
if (require.main === module || process.argv[1]?.includes("seed-real-content")) {
  seedRealContent()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed-real-content] Error:", err);
      process.exit(1);
    });
}
