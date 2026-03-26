import { WritingFeedbackForm } from "@/components/dashboard/writing-feedback-form";
import { SectionHeader } from "@/components/shared/section-header";
import { requireActiveStudentSession } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function DashboardWritingFeedbackPage() {
  await requireActiveStudentSession();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Writing Feedback"
        description="Nhận band writing sơ bộ, điểm mạnh, điểm cần cải thiện và đoạn viết mẫu tốt hơn ngay sau khi gửi bài."
      />
      <WritingFeedbackForm />
    </div>
  );
}
