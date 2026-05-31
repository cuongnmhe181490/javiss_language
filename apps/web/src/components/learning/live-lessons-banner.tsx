import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { fetchCourses } from "@/lib/api/client";

/**
 * Banner shown on skill practice pages (grammar/listening/reading) when the
 * backend API is connected. It points learners from the curated demo exercises
 * to their real published courses. Renders nothing in demo-only mode.
 */
export async function LiveLessonsBanner() {
  const result = await fetchCourses();
  const firstCourse = result?.data?.[0];

  if (!firstCourse) {
    return null;
  }

  return (
    <Link
      href={`/course/${firstCourse.id}`}
      className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 transition hover:bg-emerald-500/15"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-200">
            Bài học thật đã sẵn sàng: {firstCourse.title}
          </p>
          <p className="mt-0.5 text-xs text-emerald-300/70">
            Các bài luyện bên dưới là nội dung mẫu. Mở khóa học của bạn để học nội dung đã kiểm
            duyệt.
          </p>
        </div>
      </div>
      <ArrowRight className="size-5 shrink-0 text-emerald-300" aria-hidden="true" />
    </Link>
  );
}
