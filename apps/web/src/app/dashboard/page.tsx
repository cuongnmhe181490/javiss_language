import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Mic,
  PenLine,
  TrendingUp,
  Flame,
  Target,
  Clock,
} from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AccountButton } from "@/components/auth/account-button";
import { fetchDashboard } from "@/lib/api/client";
import { languageLabelVi, relativeTimeVi } from "@/lib/format";
import type { ContinueLearningItem, DashboardData } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Góc học",
  description: "Dashboard học tập cá nhân.",
  alternates: { canonical: absoluteUrl("/dashboard") },
};

// Demo fallback used when the backend API is not configured/reachable.
const DEMO_DASHBOARD = {
  stats: { streak: "7 ngày", todayMinutes: "12 phút", goal: "75%", weekly: "+3 bài" },
  continueLearning: {
    level: "A1",
    language: "Tiếng Anh",
    title: "Hỏi đường đi",
    description: "Hỏi và chỉ đường bằng tiếng Anh đơn giản.",
    progress: 30,
    href: "/demo-speaking",
  },
  recentActivity: [
    { time: "Hôm nay", title: 'Hoàn thành bài "Giới thiệu bản thân"', badge: "Nói" },
    { time: "Hôm qua", title: "Ôn tập ngữ pháp: thì hiện tại đơn", badge: "Ngữ pháp" },
    { time: "2 ngày trước", title: "Nghe hiểu: đoạn hội thoại tại quán cafe", badge: "Nghe" },
  ],
};

const SKILLS = [
  { icon: Headphones, label: "Nghe", href: "/listening" },
  { icon: Mic, label: "Nói", href: "/speaking-practice" },
  { icon: BookOpen, label: "Đọc", href: "/reading" },
  { icon: PenLine, label: "Ngữ pháp", href: "/grammar" },
] as const;

export default async function DashboardPage() {
  const dashboard = await fetchDashboard();
  const isLive = dashboard !== null;

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" />
            Trang chủ
          </Link>
          <span className="text-sm font-medium text-foreground">Góc học</span>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <AccountButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Greeting */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chào buổi sáng 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">Hôm nay học gì nhỉ?</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              isLive ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
            }`}
          >
            {isLive ? "Dữ liệu trực tiếp" : "Dữ liệu demo"}
          </span>
        </div>

        <StatsRow dashboard={dashboard} />
        <ContinueLearning dashboard={dashboard} />
        <SkillsGrid />
        <RecentActivity dashboard={dashboard} />
      </div>
    </main>
  );
}

function StatsRow({ dashboard }: { dashboard: DashboardData | null }) {
  const stats = dashboard
    ? [
        {
          icon: Flame,
          label: "Khóa đang học",
          value: `${dashboard.stats.coursesInProgress}`,
          color: "text-orange-400 bg-orange-500/20",
        },
        {
          icon: Clock,
          label: "Mục tiêu/ngày",
          value: `${dashboard.dailyGoal.targetMinutes} phút`,
          color: "text-blue-400 bg-blue-500/20",
        },
        {
          icon: Target,
          label: "Tiến độ TB",
          value: `${dashboard.stats.progressPercentAverage}%`,
          color: "text-primary bg-primary/20",
        },
        {
          icon: TrendingUp,
          label: "Bài đã xong",
          value: `${dashboard.stats.completedLessons}`,
          color: "text-purple-400 bg-purple-500/20",
        },
      ]
    : [
        {
          icon: Flame,
          label: "Streak",
          value: DEMO_DASHBOARD.stats.streak,
          color: "text-orange-400 bg-orange-500/20",
        },
        {
          icon: Clock,
          label: "Hôm nay",
          value: DEMO_DASHBOARD.stats.todayMinutes,
          color: "text-blue-400 bg-blue-500/20",
        },
        {
          icon: Target,
          label: "Mục tiêu",
          value: DEMO_DASHBOARD.stats.goal,
          color: "text-primary bg-primary/20",
        },
        {
          icon: TrendingUp,
          label: "Tuần này",
          value: DEMO_DASHBOARD.stats.weekly,
          color: "text-purple-400 bg-purple-500/20",
        },
      ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
          <div className={`flex size-8 items-center justify-center rounded-lg ${stat.color} mb-2`}>
            <stat.icon className="size-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function ContinueLearning({ dashboard }: { dashboard: DashboardData | null }) {
  const liveItem: ContinueLearningItem | undefined = dashboard?.continueLearning[0];
  const progressPercent =
    dashboard?.stats.progressPercentAverage ?? DEMO_DASHBOARD.continueLearning.progress;

  const card = liveItem
    ? {
        level: liveItem.targetLevel,
        language: languageLabelVi(liveItem.language),
        title: liveItem.title,
        description: `Khoảng ${liveItem.estimatedMinutes} phút. Tiếp tục bài học của bạn.`,
        href: `/lesson/${liveItem.lessonId}`,
      }
    : {
        level: DEMO_DASHBOARD.continueLearning.level,
        language: DEMO_DASHBOARD.continueLearning.language,
        title: DEMO_DASHBOARD.continueLearning.title,
        description: DEMO_DASHBOARD.continueLearning.description,
        href: DEMO_DASHBOARD.continueLearning.href,
      };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Tiếp tục học</h2>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="rounded-lg bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {card.level}
          </span>
          <span className="text-sm text-muted-foreground">{card.language}</span>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">{card.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progressPercent}%</span>
        </div>
        <Link
          href={card.href}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          Tiếp tục
        </Link>
      </div>
    </div>
  );
}

function SkillsGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Kỹ năng</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SKILLS.map((skill) => (
          <Link
            key={skill.label}
            href={skill.href}
            className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:bg-accent"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary mb-3 group-hover:bg-primary/30 transition">
              <skill.icon className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">{skill.label}</p>
            <p className="mt-2 text-xs text-muted-foreground">Mở bài luyện</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ dashboard }: { dashboard: DashboardData | null }) {
  const items =
    dashboard && dashboard.recentActivity.length > 0
      ? dashboard.recentActivity.map((activity) => ({
          time: relativeTimeVi(activity.lastActivityAt),
          title:
            activity.status === "completed" ? "Hoàn thành một bài học" : "Đang học một bài học",
          badge: activity.status === "completed" ? "Xong" : "Đang học",
        }))
      : DEMO_DASHBOARD.recentActivity;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Hoạt động gần đây</h2>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex items-center gap-3 rounded-xl bg-accent px-3 py-2.5"
            >
              <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs text-primary">
                {item.badge}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.title}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
