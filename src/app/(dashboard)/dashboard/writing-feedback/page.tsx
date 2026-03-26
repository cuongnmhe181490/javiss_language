import { WritingFeedbackForm } from "@/components/dashboard/writing-feedback-form";
import { SectionHeader } from "@/components/shared/section-header";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { getWritingFeedbackDashboardData } from "@/server/services/writing-feedback.service";

export const dynamic = "force-dynamic";

export default async function DashboardWritingFeedbackPage() {
  const session = await requireActiveStudentSession();
  const writingDashboard = await getWritingFeedbackDashboardData(session.userId);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Chấm writing với AI"
        description="Nhận band writing sơ bộ, lưu lịch sử từng bài và theo dõi xu hướng tiến bộ của bạn theo thời gian."
      />
      <WritingFeedbackForm
        initialHistory={writingDashboard.history}
        initialSummary={writingDashboard.summary}
      />
    </div>
  );
}
