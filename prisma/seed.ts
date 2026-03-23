import bcrypt from "bcryptjs";
import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "khongcomk";
  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL ?? "cuongdz0812@gmail.com";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const roles = [
    {
      code: "super_admin",
      name: "Super Admin",
      description: "Toan quyen quan tri he thong",
    },
    { code: "admin", name: "Admin", description: "Quan tri van hanh" },
    { code: "teacher", name: "Teacher", description: "Giang vien" },
    { code: "student", name: "Student", description: "Hoc vien" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }

  const english = await prisma.language.upsert({
    where: { code: "en" },
    update: { name: "English", nativeName: "Tieng Anh" },
    create: { code: "en", name: "English", nativeName: "Tieng Anh" },
  });

  await prisma.language.upsert({
    where: { code: "zh" },
    update: { name: "Chinese", nativeName: "Tieng Trung" },
    create: { code: "zh", name: "Chinese", nativeName: "Tieng Trung" },
  });

  await prisma.language.upsert({
    where: { code: "ja" },
    update: { name: "Japanese", nativeName: "Tieng Nhat" },
    create: { code: "ja", name: "Japanese", nativeName: "Tieng Nhat" },
  });

  await prisma.language.upsert({
    where: { code: "ko" },
    update: { name: "Korean", nativeName: "Tieng Han" },
    create: { code: "ko", name: "Korean", nativeName: "Tieng Han" },
  });

  const ieltsAcademic = await prisma.exam.upsert({
    where: { code: "ielts_academic" },
    update: {
      name: "IELTS Academic",
      description: "Goi thi IELTS Academic",
      languageId: english.id,
    },
    create: {
      code: "ielts_academic",
      name: "IELTS Academic",
      description: "Goi thi IELTS Academic",
      languageId: english.id,
    },
  });

  const ieltsGeneral = await prisma.exam.upsert({
    where: { code: "ielts_general" },
    update: {
      name: "IELTS General",
      description: "Goi thi IELTS General",
      languageId: english.id,
    },
    create: {
      code: "ielts_general",
      name: "IELTS General",
      description: "Goi thi IELTS General",
      languageId: english.id,
    },
  });

  const packAcademic = await prisma.examPack.upsert({
    where: { code: "ielts_academic_core" },
    update: {
      name: "IELTS Academic Core",
      languageId: english.id,
      examId: ieltsAcademic.id,
    },
    create: {
      code: "ielts_academic_core",
      name: "IELTS Academic Core",
      languageId: english.id,
      examId: ieltsAcademic.id,
    },
  });

  await prisma.examPack.upsert({
    where: { code: "ielts_general_core" },
    update: {
      name: "IELTS General Core",
      languageId: english.id,
      examId: ieltsGeneral.id,
    },
    create: {
      code: "ielts_general_core",
      name: "IELTS General Core",
      languageId: english.id,
      examId: ieltsGeneral.id,
    },
  });

  const topic = await prisma.topic.upsert({
    where: { slug: "ielts-speaking-foundation" },
    update: {
      name: "Speaking Foundation",
      languageId: english.id,
      examPackId: packAcademic.id,
    },
    create: {
      slug: "ielts-speaking-foundation",
      name: "Speaking Foundation",
      languageId: english.id,
      examPackId: packAcademic.id,
    },
  });

  const lesson = await prisma.lesson.upsert({
    where: { slug: "introduce-yourself" },
    update: { title: "Introduce Yourself", topicId: topic.id, status: "published" },
    create: {
      slug: "introduce-yourself",
      title: "Introduce Yourself",
      topicId: topic.id,
      status: "published",
    },
  });

  const exercise = await prisma.exercise.upsert({
    where: { slug: "speaking-part-1-self-introduction" },
    update: {
      title: "Speaking Part 1 Self Introduction",
      lessonId: lesson.id,
    },
    create: {
      slug: "speaking-part-1-self-introduction",
      title: "Speaking Part 1 Self Introduction",
      lessonId: lesson.id,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        exerciseId: exercise.id,
        prompt: "Tell me about your hometown.",
        type: "speaking",
      },
      {
        exerciseId: exercise.id,
        prompt: "What kind of place do you live in now?",
        type: "speaking",
      },
    ],
    skipDuplicates: true,
  });

  for (const skillKey of ["speaking", "writing", "reading", "listening"]) {
    await prisma.rubric.upsert({
      where: { id: `${packAcademic.id}_${skillKey}` },
      update: {
        title: `Rubric ${skillKey}`,
        content: { bandDescriptors: [] },
        examPackId: packAcademic.id,
        skillKey,
      },
      create: {
        id: `${packAcademic.id}_${skillKey}`,
        title: `Rubric ${skillKey}`,
        content: { bandDescriptors: [] },
        examPackId: packAcademic.id,
        skillKey,
      },
    });
  }

  await prisma.promptTemplate.upsert({
    where: { key: "ielts_onboarding_default" },
    update: {
      title: "IELTS Onboarding Default",
      content: "Create an onboarding summary and next steps for the learner.",
      examPackId: packAcademic.id,
      type: "onboarding",
    },
    create: {
      key: "ielts_onboarding_default",
      title: "IELTS Onboarding Default",
      content: "Create an onboarding summary and next steps for the learner.",
      examPackId: packAcademic.id,
      type: "onboarding",
    },
  });

  const defaultPlan = await prisma.subscriptionPlan.upsert({
    where: { code: "starter_student" },
    update: {
      name: "Starter Student",
      description: "Goi mac dinh cho hoc vien moi",
      isDefault: true,
    },
    create: {
      code: "starter_student",
      name: "Starter Student",
      description: "Goi mac dinh cho hoc vien moi",
      isDefault: true,
    },
  });

  await prisma.featureFlag.upsert({
    where: { key: "open_registration" },
    update: { name: "Open Registration", value: true },
    create: {
      key: "open_registration",
      name: "Open Registration",
      description: "Cho phep nguoi dung tu dang ky",
      value: true,
    },
  });

  const settingEntries = [
    ["admin_notification_email", process.env.ADMIN_NOTIFICATION_EMAIL ?? adminEmail],
    ["verification_code_ttl_minutes", process.env.VERIFICATION_CODE_TTL_MINUTES ?? "15"],
    ["verification_max_attempts", process.env.VERIFICATION_MAX_ATTEMPTS ?? "5"],
    ["resend_cooldown_seconds", process.env.RESEND_COOLDOWN_SECONDS ?? "90"],
    ["open_registration", process.env.ENABLE_OPEN_REGISTRATION ?? "true"],
  ];

  for (const [key, value] of settingEntries) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: adminEmail,
      passwordHash,
      status: UserStatus.active,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: "cuongdz0812",
          preferredLocale: "vi",
        },
      },
    },
    include: { profile: true },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { code: "super_admin" },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  await prisma.license.upsert({
    where: { id: `license_${superAdmin.id}` },
    update: {
      userId: superAdmin.id,
      planId: defaultPlan.id,
      status: "active",
    },
    create: {
      id: `license_${superAdmin.id}`,
      userId: superAdmin.id,
      planId: defaultPlan.id,
      status: "active",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
