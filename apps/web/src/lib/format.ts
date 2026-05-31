/**
 * Format an ISO date string as a short Vietnamese relative time label.
 */
export function relativeTimeVi(iso: string | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;

  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} tuần trước`;

  return new Date(iso).toLocaleDateString("vi-VN");
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "Tiếng Anh",
  zh: "Tiếng Trung",
  ja: "Tiếng Nhật",
  ko: "Tiếng Hàn",
};

export function languageLabelVi(language: string): string {
  return LANGUAGE_LABELS[language] ?? language.toUpperCase();
}

const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  active: "Đang giao",
  paused: "Tạm dừng",
  completed: "Hoàn thành",
  archived: "Lưu trữ",
};

export function assignmentStatusVi(status: string): string {
  return ASSIGNMENT_STATUS_LABELS[status] ?? status;
}
