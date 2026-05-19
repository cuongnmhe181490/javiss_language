import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, Flame, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  achievements,
  continueLearning,
  dashboardShortcuts,
  demoAssignments,
  demoLearner,
  demoSkills,
  nextLesson,
  recentActivity,
  weeklyPlan,
} from "@/lib/demo-learning-data";

export function DashboardHero() {
  return (
    <section className="rounded-lg border border-slate-800/50 bg-slate-900/80 backdrop-blur-sm p-5 shadow-[0_0_80px_-20px_rgb(16_185_129/0.15)] sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="rounded-md bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Góc học bản demo
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Góc học hôm nay
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Dữ liệu ở đây là mẫu để xem giao diện học. Bản production sẽ nối API thật, đăng nhập thật và nội dung đã kiểm duyệt.
          </p>
        </div>
        <div className="grid min-w-[260px] gap-3 rounded-lg border border-slate-800/50 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-400">Phút tuần này</span>
            <span className="font-semibold">
              {demoLearner.weeklyMinutes}/{demoLearner.weeklyGoalMinutes}
            </span>
          </div>
          <Progress
            value={(demoLearner.weeklyMinutes / demoLearner.weeklyGoalMinutes) * 100}
            aria-label="Weekly goal progress"
            className="h-2"
          />
          <Button asChild className="mt-1 h-11">
            <Link href="/placement">
              Chọn lại mục tiêu
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ProgressOverview() {
  const xpProgress = Math.round((demoLearner.xp / demoLearner.nextLevelXp) * 100);

  return (
    <section aria-labelledby="progress-overview-title" className="grid gap-4 md:grid-cols-3">
      <MetricCard
        icon={BarChart3}
        label="Tiến độ khóa học"
        value={`${demoLearner.completion}%`}
        detail={demoLearner.level}
      />
      <MetricCard
        icon={Flame}
        label="Chuỗi ngày học"
        value={`${demoLearner.streakDays} days`}
        detail="Nhịp học demo"
      />
      <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle id="progress-overview-title">XP và trình độ</CardTitle>
          <CardDescription>
            {demoLearner.xp} /  {demoLearner.nextLevelXp} XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} aria-label="XP progress" className="h-2" />
          <p className="mt-3 text-sm text-slate-400">{xpProgress}% tới mốc tiếp theo.</p>
        </CardContent>
      </Card>
    </section>
  );
}

export function ContinueLearningCard() {
  return (
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Học tiếp</CardTitle>
        <CardDescription>{continueLearning.track}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-slate-800/50 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock3 className="size-4" aria-hidden="true" />
            {continueLearning.estimatedMinutes} phút
          </div>
          <h2 className="mt-3 text-2xl font-semibold">{continueLearning.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {continueLearning.objective}
          </p>
          <Button asChild className="mt-5 h-11">
            <Link href={continueLearning.href}>
              Vào bài học
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkillProgressGrid() {
  return (
    <section aria-labelledby="skill-progress-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="skill-progress-title" className="text-2xl font-semibold">
            Tiến độ kỹ năng
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Theo dõi gọn để biết nên học gì tiếp.
          </p>
        </div>
        <Button variant="outline" asChild className="hidden h-11 sm:inline-flex border-slate-800/50 bg-slate-900/60">
          <Link href="/curriculum">Xem lộ trình</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {demoSkills.map((skill) => (
          <Card key={skill.name} className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="pt-1">
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <skill.icon className="size-5" aria-hidden="true" />
                </span>
                <Badge variant="outline" className="rounded-md border-slate-700">
                  {skill.level}
                </Badge>
              </div>
              <h3 className="mt-4 font-semibold">{skill.name}</h3>
              <p className="mt-1 min-h-10 text-sm leading-5 text-slate-400">
                {skill.status}
              </p>
              <Progress
                value={skill.progress}
                aria-label={`${skill.name} progress`}
                className="mt-4 h-2"
              />
              <Link
                href={skill.href}
                aria-label={`Mở ${skill.name} track`}
                className="mt-3 inline-flex min-h-11 items-center rounded-md text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Mở {skill.name}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function DailyGoalCard() {
  return (
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Mục tiêu hôm nay</CardTitle>
        <CardDescription>{demoLearner.goal}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <CompactRow label="Bài tiếp theo" value={nextLesson.title} />
          <CompactRow label="Điểm cần nhớ" value={nextLesson.checkpoint} />
          <CompactRow label="Hạn" value={nextLesson.due} />
        </div>
        <Button asChild variant="outline" className="mt-5 h-11 w-full border-slate-800/50 bg-slate-950/60">
          <Link href={nextLesson.href}>Xem bài ngắn</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function AssignmentPreview() {
  return (
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Bài cần làm</CardTitle>
        <CardDescription>Bài mẫu cho bản xem trước.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {demoAssignments.map((assignment) => (
          <div
            key={assignment.title}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-800/50 bg-slate-950/60 p-3"
          >
            <div>
              <h3 className="font-medium">{assignment.title}</h3>
              <p className="text-sm text-slate-400">Hạn {assignment.due}</p>
            </div>
            <Badge variant={assignment.status === "Ready" ? "default" : "secondary"}>
              {assignmentStatusLabel[assignment.status]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AiTutorShortcut() {
  return <ShortcutCard shortcut={dashboardShortcuts.aiTutor} id="ai-tutor" />;
}

export function SpeakingShortcut() {
  return <ShortcutCard shortcut={dashboardShortcuts.speaking} />;
}

export function AchievementStrip() {
  return (
    <section aria-labelledby="achievements-title" className="rounded-lg border border-slate-800/50 bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="achievements-title" className="font-semibold">
            Dấu mốc nhỏ
          </h2>
          <p className="text-sm text-slate-400">Tạo động lực nhẹ, không gây áp lực.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <Badge key={achievement.label} variant="secondary" className="h-8 rounded-md px-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <achievement.icon className="size-4" aria-hidden="true" />
              {achievement.label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WeeklyPlanCard() {
  return (
    <Card id="weekly-plan" className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Kế hoạch tuần</CardTitle>
        <CardDescription>Chia đều nghe, nói, đọc và ngữ pháp.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {weeklyPlan.map((item) => (
          <div key={item.day} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
            <span className="font-medium">{item.day}</span>
            <div>
              <p className="text-sm">{item.focus}</p>
              <Progress
                value={Math.min(100, item.minutes * 3)}
                aria-label={`${item.day} ${item.focus} plan`}
                className="mt-2"
              />
            </div>
            <span className="text-sm text-slate-400">{item.minutes}m</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivityCard() {
  return (
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Vừa học xong</CardTitle>
        <CardDescription>Hoạt động mẫu của bản beta.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {recentActivity.map((activity) => (
          <div key={activity.title} className="flex items-start gap-3">
            <span className="mt-1 flex size-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <div>
              <h3 className="font-medium">{activity.title}</h3>
              <p className="text-sm text-slate-400">{activity.meta}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const assignmentStatusLabel = {
  Ready: "Sẵn sàng",
  "In review": "Đang xem lại",
  Optional: "Tùy chọn",
} as const;

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardContent className="flex items-center gap-4 pt-1">
        <span className="flex size-11 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-slate-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ShortcutCard({
  shortcut,
  id,
}: {
  shortcut: {
    title: string;
    copy: string;
    href: string;
    icon: LucideIcon;
  };
  id?: string;
}) {
  return (
    <Card id={id} className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardContent className="pt-1">
        <span className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <shortcut.icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">{shortcut.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{shortcut.copy}</p>
        <Button asChild variant="outline" className="mt-5 h-11 border-slate-800/50 bg-slate-950/60">
          <Link href={shortcut.href}>
            Mở {shortcut.title}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CompactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/50 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[68%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}
