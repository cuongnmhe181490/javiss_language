import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LearnerRetentionCardProps = {
  periodLabel: string;
  activatedUsers: number;
  firstDashboardVisits: number;
  firstLessonOpens: number;
  firstSpeakingStarts: number;
  firstSpeakingCompletions: number;
  firstExerciseSubmissions: number;
  firstWritingCompletions: number;
  startedLearningUsers: number;
  dashboardVisitRate: string;
  lessonOpenRate: string;
  speakingStartRate: string;
  speakingCompletionRate: string;
  exerciseSubmissionRate: string;
  writingCompletionRate: string;
  learningStartRate: string;
  averageTimeToLearningStart: string | null;
  topLearningAction: string | null;
  latestSpeakingTopic: string | null;
  stageItems: Array<{
    label: string;
    count: number;
    rateFromActivated: string;
  }>;
  cohortItems: Array<{
    cohortLabel: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
  }>;
  retentionBySource: Array<{
    label: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
  }>;
  retentionByPlan: Array<{
    label: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
  }>;
  retentionByExam: Array<{
    label: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
  }>;
};

function getTopActionLabel(value: string | null) {
  switch (value) {
    case "lesson":
      return "Mở khu bài luyện";
    case "speaking":
      return "Bắt đầu speaking";
    case "exercise":
      return "Nộp exercise đầu tiên";
    case "writing":
      return "Gửi writing đầu tiên";
    default:
      return "Chưa có đủ dữ liệu";
  }
}

export function LearnerRetentionCard({
  periodLabel,
  activatedUsers,
  firstDashboardVisits,
  firstLessonOpens,
  firstSpeakingStarts,
  firstSpeakingCompletions,
  firstExerciseSubmissions,
  firstWritingCompletions,
  startedLearningUsers,
  dashboardVisitRate,
  lessonOpenRate,
  speakingStartRate,
  speakingCompletionRate,
  exerciseSubmissionRate,
  writingCompletionRate,
  learningStartRate,
  averageTimeToLearningStart,
  topLearningAction,
  latestSpeakingTopic,
  stageItems,
  cohortItems,
  retentionBySource,
  retentionByPlan,
  retentionByExam,
}: LearnerRetentionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention sau kích hoạt</CardTitle>
        <CardDescription>
          Theo dõi xem người học đã bắt đầu học thật hay chưa trong {periodLabel.toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Đã kích hoạt
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {activatedUsers}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Vào dashboard
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {firstDashboardVisits}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {dashboardVisitRate}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Mở bài luyện
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {firstLessonOpens}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {lessonOpenRate}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Bắt đầu speaking
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {firstSpeakingStarts}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {speakingStartRate}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Hoàn tất speaking
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {firstSpeakingCompletions}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {speakingCompletionRate}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Nộp exercise
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {firstExerciseSubmissions}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {exerciseSubmissionRate}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Các mốc bắt đầu học
            </p>
            <div className="mt-4 space-y-3">
              {stageItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tỷ lệ từ nhóm đã kích hoạt: {item.rateFromActivated}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Tín hiệu hành vi
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p>Đã bắt đầu học thật</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {startedLearningUsers}
                </p>
                <p className="mt-2 text-xs">Tỷ lệ: {learningStartRate}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p>Thời gian chạm hành động học đầu tiên</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {averageTimeToLearningStart ?? "Chưa đủ dữ liệu"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p>Hành vi nổi bật nhất</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {getTopActionLabel(topLearningAction)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p>Topic speaking gần nhất</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {latestSpeakingTopic ?? "Chưa có phiên speaking mới trong giai đoạn này"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p>Gửi writing đầu tiên</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {firstWritingCompletions}
                </p>
                <p className="mt-2 text-xs">Tỷ lệ: {writingCompletionRate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            Cohort kích hoạt gần đây
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cohortItems.length > 0 ? (
              cohortItems.map((item) => (
                <div
                  key={item.cohortLabel}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Tuần {item.cohortLabel}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {item.startedLearningUsers}/{item.activatedUsers}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Tỷ lệ bắt đầu học: {item.learningStartRate}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chưa có đủ dữ liệu cohort trong giai đoạn này.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {[
            {
              title: "Retention theo nguồn đăng ký",
              items: retentionBySource,
            },
            {
              title: "Retention theo gói học",
              items: retentionByPlan,
            },
            {
              title: "Retention theo kỳ thi mục tiêu",
              items: retentionByExam,
            },
          ].map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {section.title}
              </p>
              <div className="mt-4 space-y-3">
                {section.items.length > 0 ? (
                  section.items.map((item) => (
                    <div
                      key={`${section.title}-${item.label}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <p className="text-sm font-medium text-slate-950 dark:text-white">
                        {item.label}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {item.startedLearningUsers}/{item.activatedUsers} người đã bắt đầu học
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Tỷ lệ: {item.learningStartRate}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chưa có đủ dữ liệu cho nhóm này.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
