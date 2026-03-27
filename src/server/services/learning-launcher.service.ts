import { AnalyticsEventType } from "@prisma/client";
import { findUserById } from "@/server/repositories/user.repository";
import { findFirstAnalyticsEventForUser } from "@/server/repositories/analytics.repository";

type LauncherPathKey = "speaking" | "writing" | "lessons" | "coach";

function normalizeSkills(skills: string[] | null | undefined) {
  return (skills ?? []).map((skill) => skill.trim().toLowerCase());
}

function resolvePrimaryPath(user: NonNullable<Awaited<ReturnType<typeof findUserById>>>) {
  const weakestSkills = normalizeSkills(user.profile?.weakestSkills);

  if (weakestSkills.some((skill) => skill.includes("speaking"))) {
    return "speaking" satisfies LauncherPathKey;
  }

  if (weakestSkills.some((skill) => skill.includes("writing"))) {
    return "writing" satisfies LauncherPathKey;
  }

  if (weakestSkills.some((skill) => skill.includes("reading") || skill.includes("listening"))) {
    return "lessons" satisfies LauncherPathKey;
  }

  return "coach" satisfies LauncherPathKey;
}

function buildPathOptions(primaryPath: LauncherPathKey, goalName?: string | null) {
  const options = [
    {
      key: "coach" as const,
      title: "Bắt đầu với AI Coach",
      description:
        "Trao đổi nhanh với AI để xác định điểm mạnh, điểm yếu và bước học tiếp theo ngay hôm nay.",
      href: "/dashboard/ai-coach",
      cta: "Mở AI Coach",
      badge: "Khởi động nhanh",
    },
    {
      key: "speaking" as const,
      title: "Làm speaking mock đầu tiên",
      description:
        "Vào ngay một phiên speaking mô phỏng để phá băng, lấy band sơ bộ và có follow-up question thật.",
      href: "/dashboard/ai-coach",
      cta: "Bắt đầu speaking",
      badge: "Wow moment",
    },
    {
      key: "writing" as const,
      title: "Gửi bài writing đầu tiên",
      description:
        "Nhận band sơ bộ, điểm mạnh, điểm cần sửa và bài viết gợi ý tốt hơn chỉ trong một lượt.",
      href: "/dashboard/writing-feedback",
      cta: "Mở writing feedback",
      badge: "Chấm nhanh",
    },
    {
      key: "lessons" as const,
      title: "Mở bài luyện phù hợp",
      description:
        "Xem lesson, exercise và bắt đầu một hành động học có cấu trúc để giữ nhịp ngay từ đầu.",
      href: "/dashboard/lessons",
      cta: "Vào khu bài luyện",
      badge: "Học có lộ trình",
    },
  ];

  return options.map((option) => ({
    ...option,
    recommended: option.key === primaryPath,
    recommendationReason:
      option.key === primaryPath
        ? `Được ưu tiên cho hồ sơ ${goalName ?? "hiện tại"} của bạn để chạm giá trị nhanh nhất.`
        : null,
  }));
}

export async function getStudentLearningLauncherData(userId: string) {
  const [user, firstLearningEvent] = await Promise.all([
    findUserById(userId),
    findFirstAnalyticsEventForUser({
      userId,
      eventTypes: [
        AnalyticsEventType.lesson_catalog_first_opened,
        AnalyticsEventType.speaking_mock_first_started,
        AnalyticsEventType.exercise_first_submitted,
        AnalyticsEventType.writing_feedback_first_completed,
      ],
    }),
  ]);

  if (!user) {
    return null;
  }

  const goal = user.goals[0];
  const primaryPath = resolvePrimaryPath(user);

  return {
    hasStartedLearning: Boolean(firstLearningEvent),
    goalName: goal?.exam.name ?? null,
    targetScore: goal?.targetScore ?? null,
    primaryPath,
    options: buildPathOptions(primaryPath, goal?.exam.name),
  };
}
