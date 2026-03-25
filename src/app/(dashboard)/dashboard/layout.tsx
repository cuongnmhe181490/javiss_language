import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { requireActiveStudentSession } from "@/lib/auth/guards";
import { vi } from "@/i18n/dictionaries/vi";
import { getStudentAiWidgetData } from "@/server/services/ai-coach.service";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireActiveStudentSession();
  const studentAiWidget = await getStudentAiWidgetData(session.userId);

  return (
    <AppShell session={session} studentAiWidget={studentAiWidget}>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/80">
          <nav className="grid gap-2 text-sm">
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard">
              {vi.nav.dashboard}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard/lessons">
              Bài luyện
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard/ai-coach">
              AI Coach & Speaking
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard/profile">
              {vi.nav.profile}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard/plan">
              {vi.nav.plan}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/dashboard/progress">
              {vi.nav.progress}
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </AppShell>
  );
}
