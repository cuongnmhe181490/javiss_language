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
  medianTimeToLearningStart: string | null;
  activeLearnersLast7Days: number;
  repeatLearnersLast7Days: number;
  multiSurfaceLearnersLast7Days: number;
  repeatLearnerRate: string;
  multiSurfaceLearnerRate: string;
  rolling30ActiveLearners: number;
  rolling30RepeatLearners: number;
  rolling30MultiSurfaceLearners: number;
  rolling30RepeatRate: string;
  rolling30MultiSurfaceRate: string;
  rolling30AverageActionsPerActiveLearner: string | null;
  d1EligibleUsers: number;
  d1ReturnedUsers: number;
  d1ReturnRate: string;
  d7EligibleUsers: number;
  d7ReturnedUsers: number;
  d7ReturnRate: string;
  d14EligibleUsers: number;
  d14ReturnedUsers: number;
  d14ReturnRate: string;
  d30EligibleUsers: number;
  d30ReturnedUsers: number;
  d30ReturnRate: string;
  averageActionsPerActiveLearner: string | null;
  repeatLearnerQualityScore: number;
  topRepeatSurface: string | null;
  repeatSpeakingBandAverage: string | null;
  nonRepeatSpeakingBandAverage: string | null;
  repeatWritingBandAverage: string | null;
  nonRepeatWritingBandAverage: string | null;
  repeatOverallProgressAverage: string | null;
  nonRepeatOverallProgressAverage: string | null;
  speakingBandLift: string | null;
  writingBandLift: string | null;
  progressLift: string | null;
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
    repeatLearners: number;
    repeatRate: string;
  }>;
  retentionBySource: Array<{
    label: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
    repeatLearners: number;
    repeatRate: string;
  }>;
  retentionByPlan: Array<{
    label: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
    repeatLearners: number;
    repeatRate: string;
  }>;
  retentionByExam: Array<{
    label: string;
    activatedUsers: number;
    startedLearningUsers: number;
    learningStartRate: string;
    repeatLearners: number;
    repeatRate: string;
  }>;
  retentionByFirstPath: Array<{
    label: string;
    startedUsers: number;
    repeatLearners: number;
    repeatRate: string;
    d7ReturnedUsers: number;
    d7ReturnRate: string;
    d30ReturnedUsers: number;
    d30ReturnRate: string;
  }>;
  retentionBySourcePath: Array<{
    label: string;
    startedUsers: number;
    repeatLearners: number;
    repeatRate: string;
    d30ReturnedUsers: number;
    d30ReturnRate: string;
  }>;
  retentionByPlanPath: Array<{
    label: string;
    startedUsers: number;
    repeatLearners: number;
    repeatRate: string;
    d30ReturnedUsers: number;
    d30ReturnRate: string;
  }>;
  retentionByExamPath: Array<{
    label: string;
    startedUsers: number;
    repeatLearners: number;
    repeatRate: string;
    d30ReturnedUsers: number;
    d30ReturnRate: string;
  }>;
  recommendations: Array<{
    title: string;
    summary: string;
    action: string;
    severity: "critical" | "high" | "medium";
    score: number;
    priority: number;
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

function getRepeatSurfaceLabel(value: string | null) {
  switch (value) {
    case "speaking":
      return "Speaking";
    case "writing":
      return "Writing";
    case "exercise":
      return "Exercise";
    default:
      return "Chưa có đủ dữ liệu";
  }
}

function getRecommendationSeverityLabel(value: "critical" | "high" | "medium") {
  switch (value) {
    case "critical":
      return "Cần xử lý ngay";
    case "high":
      return "Ưu tiên cao";
    default:
      return "Ưu tiên vừa";
  }
}

function getRecommendationSeverityClasses(value: "critical" | "high" | "medium") {
  switch (value) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";
    default:
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300";
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
  medianTimeToLearningStart,
  activeLearnersLast7Days,
  repeatLearnersLast7Days,
  multiSurfaceLearnersLast7Days,
  repeatLearnerRate,
  multiSurfaceLearnerRate,
  rolling30ActiveLearners,
  rolling30RepeatLearners,
  rolling30MultiSurfaceLearners,
  rolling30RepeatRate,
  rolling30MultiSurfaceRate,
  rolling30AverageActionsPerActiveLearner,
  d1EligibleUsers,
  d1ReturnedUsers,
  d1ReturnRate,
  d7EligibleUsers,
  d7ReturnedUsers,
  d7ReturnRate,
  d14EligibleUsers,
  d14ReturnedUsers,
  d14ReturnRate,
  d30EligibleUsers,
  d30ReturnedUsers,
  d30ReturnRate,
  averageActionsPerActiveLearner,
  repeatLearnerQualityScore,
  topRepeatSurface,
  repeatSpeakingBandAverage,
  nonRepeatSpeakingBandAverage,
  repeatWritingBandAverage,
  nonRepeatWritingBandAverage,
  repeatOverallProgressAverage,
  nonRepeatOverallProgressAverage,
  speakingBandLift,
  writingBandLift,
  progressLift,
  topLearningAction,
  latestSpeakingTopic,
  stageItems,
  cohortItems,
  retentionBySource,
  retentionByPlan,
  retentionByExam,
  retentionByFirstPath,
  retentionBySourcePath,
  retentionByPlanPath,
  retentionByExamPath,
  recommendations,
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
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            Gợi ý hành động cho admin
          </p>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {recommendations.length > 0 ? (
              recommendations.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      Ưu tiên #{item.priority}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getRecommendationSeverityClasses(item.severity)}`}
                    >
                      {getRecommendationSeverityLabel(item.severity)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      Điểm {item.score}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {item.summary}
                  </p>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Gợi ý: {item.action}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chưa có đủ dữ liệu để sinh khuyến nghị hành động cho admin.
              </p>
            )}
          </div>
        </div>

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
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Median: {medianTimeToLearningStart ?? "Chưa đủ dữ liệu"}
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p>7 ngày gần đây</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {repeatLearnersLast7Days}/{activeLearnersLast7Days} học viên quay lại học
                </p>
                <p className="mt-2 text-xs">Tỷ lệ repeat: {repeatLearnerRate}</p>
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
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Quay lại học: {item.repeatLearners}/{item.activatedUsers} ({item.repeatRate})
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

        <div className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Học viên quay lại 7 ngày
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {repeatLearnersLast7Days}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tỷ lệ từ nhóm đã kích hoạt: {repeatLearnerRate}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Dùng từ 2 bề mặt trở lên
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {multiSurfaceLearnersLast7Days}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tỷ lệ: {multiSurfaceLearnerRate}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Hành động trung bình / học viên active
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {averageActionsPerActiveLearner ?? "0.0"}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Bề mặt lặp lại nhiều nhất: {getRepeatSurfaceLabel(topRepeatSurface)}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Chỉ số chất lượng quay lại học
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {repeatLearnerQualityScore}/100
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Kết hợp repeat rate, multi-surface rate và độ sâu hành động.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Rolling 30 ngày active
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {rolling30ActiveLearners}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Học viên có ít nhất một hành động học trong 30 ngày gần nhất.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Rolling 30 ngày quay lại
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {rolling30RepeatLearners}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tỷ lệ: {rolling30RepeatRate}. Multi-surface: {rolling30MultiSurfaceLearners} ({rolling30MultiSurfaceRate})
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Độ sâu hành vi 30 ngày
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {rolling30AverageActionsPerActiveLearner ?? "0.0"}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Số hành động học trung bình trên mỗi học viên active trong 30 ngày gần nhất.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              D1 return rate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {d1ReturnRate}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {d1ReturnedUsers}/{d1EligibleUsers} học viên quay lại sau 24 giờ kể từ lúc kích hoạt.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              D7 return rate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {d7ReturnRate}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {d7ReturnedUsers}/{d7EligibleUsers} học viên còn quay lại sau 7 ngày.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              D14 return rate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {d14ReturnRate}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {d14ReturnedUsers}/{d14EligibleUsers} học viên còn giữ được nhịp học sau 14 ngày.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              D30 return rate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {d30ReturnRate}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {d30ReturnedUsers}/{d30EligibleUsers} học viên còn duy trì việc học sau 30 ngày.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            Tương quan giữa quay lại học và chất lượng học tập
          </p>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-950 dark:text-white">
                Speaking band gần nhất
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Nhóm quay lại:{" "}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {repeatSpeakingBandAverage ?? "Chưa đủ dữ liệu"}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Nhóm không quay lại:{" "}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {nonRepeatSpeakingBandAverage ?? "Chưa đủ dữ liệu"}
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Chênh lệch: {speakingBandLift ?? "Chưa đủ dữ liệu"} band
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-950 dark:text-white">
                Writing band gần nhất
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Nhóm quay lại:{" "}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {repeatWritingBandAverage ?? "Chưa đủ dữ liệu"}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Nhóm không quay lại:{" "}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {nonRepeatWritingBandAverage ?? "Chưa đủ dữ liệu"}
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Chênh lệch: {writingBandLift ?? "Chưa đủ dữ liệu"} band
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-950 dark:text-white">
                Tiến độ tổng thể gần nhất
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Nhóm quay lại:{" "}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {repeatOverallProgressAverage ?? "Chưa đủ dữ liệu"}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Nhóm không quay lại:{" "}
                <span className="font-semibold text-slate-950 dark:text-white">
                  {nonRepeatOverallProgressAverage ?? "Chưa đủ dữ liệu"}
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Chênh lệch: {progressLift ?? "Chưa đủ dữ liệu"} điểm tiến độ
              </p>
            </div>
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
                        Bắt đầu học: {item.learningStartRate}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Quay lại học: {item.repeatLearners}/{item.activatedUsers} ({item.repeatRate})
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

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            Retention theo hành động học đầu tiên
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {retentionByFirstPath.length > 0 ? (
              retentionByFirstPath.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Người bắt đầu theo hướng này:{" "}
                    <span className="font-semibold text-slate-950 dark:text-white">
                      {item.startedUsers}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Quay lại 7 ngày: {item.repeatLearners}/{item.startedUsers} ({item.repeatRate})
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    D7 return: {item.d7ReturnedUsers}/{item.startedUsers} ({item.d7ReturnRate})
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    D30 return: {item.d30ReturnedUsers}/{item.startedUsers} ({item.d30ReturnRate})
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chưa có đủ dữ liệu để phân tích theo hành động học đầu tiên.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {[
            {
              title: "Nguồn đăng ký × hành động học đầu tiên",
              items: retentionBySourcePath,
            },
            {
              title: "Gói học × hành động học đầu tiên",
              items: retentionByPlanPath,
            },
            {
              title: "Kỳ thi mục tiêu × hành động học đầu tiên",
              items: retentionByExamPath,
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
                        Người bắt đầu theo combo này: {item.startedUsers}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Quay lại 7 ngày: {item.repeatLearners}/{item.startedUsers} ({item.repeatRate})
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        D30 return: {item.d30ReturnedUsers}/{item.startedUsers} ({item.d30ReturnRate})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chưa có đủ dữ liệu để phân tích chéo cho nhóm này.
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
