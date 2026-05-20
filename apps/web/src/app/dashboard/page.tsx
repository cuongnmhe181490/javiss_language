import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Headphones, Mic, PenLine, TrendingUp, Flame, Target, Clock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { absoluteUrl } from "@/lib/site-url";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Góc học",
  description: "Dashboard học tập cá nhân.",
  alternates: { canonical: absoluteUrl("/dashboard") },
};

export default function DashboardPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="size-4" />
            Trang chủ
          </Link>
          <span className="text-sm font-medium text-foreground">Góc học</span>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Chào buổi sáng 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hôm nay học gì nhỉ?</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          {[
            { icon: Flame, label: "Streak", value: "7 ngày", color: "text-orange-400 bg-orange-500/20" },
            { icon: Clock, label: "Hôm nay", value: "12 phút", color: "text-blue-400 bg-blue-500/20" },
            { icon: Target, label: "Mục tiêu", value: "75%", color: "text-primary bg-primary/20" },
            { icon: TrendingUp, label: "Tuần này", value: "+3 bài", color: "text-purple-400 bg-purple-500/20" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <div className={`flex size-8 items-center justify-center rounded-lg ${stat.color} mb-2`}>
                <stat.icon className="size-4" />
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tiếp tục học</h2>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-lg bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">A1</span>
              <span className="text-sm text-muted-foreground">Tiếng Anh · Bài 3</span>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">Hỏi đường đi</h3>
            <p className="text-sm text-muted-foreground mb-4">Hỏi và chỉ đường bằng tiếng Anh đơn giản.</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-muted">
                <div className="h-full w-[30%] rounded-full bg-primary" />
              </div>
              <span className="text-xs text-muted-foreground">30%</span>
            </div>
            <Link href="/demo-speaking" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
              Tiếp tục
            </Link>
          </div>
        </div>

        {/* Skills grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Kỹ năng</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Headphones, label: "Nghe", progress: 60, href: "/listening" },
              { icon: Mic, label: "Nói", progress: 35, href: "/speaking" },
              { icon: BookOpen, label: "Đọc", progress: 80, href: "/reading" },
              { icon: PenLine, label: "Ngữ pháp", progress: 45, href: "/grammar" },
            ].map((skill) => (
              <Link key={skill.label} href={skill.href} className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:bg-accent">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary mb-3 group-hover:bg-primary/30 transition">
                  <skill.icon className="size-5" />
                </div>
                <p className="text-sm font-medium text-foreground">{skill.label}</p>
                <div className="mt-2 h-1 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${skill.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{skill.progress}%</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Hoạt động gần đây</h2>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="space-y-3">
              {[
                { time: "Hôm nay", title: "Hoàn thành bài \"Giới thiệu bản thân\"", badge: "Nói" },
                { time: "Hôm qua", title: "Ôn tập ngữ pháp: thì hiện tại đơn", badge: "Ngữ pháp" },
                { time: "2 ngày trước", title: "Nghe hiểu: đoạn hội thoại tại quán cafe", badge: "Nghe" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 rounded-xl bg-accent px-3 py-2.5">
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs text-primary">{item.badge}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
