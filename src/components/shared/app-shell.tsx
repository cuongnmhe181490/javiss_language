import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { vi } from "@/i18n/dictionaries/vi";

type AppShellProps = {
  children: React.ReactNode;
  session?: {
    fullName: string;
    roles: string[];
  } | null;
};

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.1),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-white">
      <header className="border-b border-white/40 bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              {vi.appName}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nền tảng luyện thi ngôn ngữ bằng AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <>
                <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:block">
                  {session.fullName}
                </span>
                <form action="/api/auth/logout" method="post">
                  <Button type="submit" variant="secondary" size="sm">
                    {vi.common.logout}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {vi.nav.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{vi.nav.register}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
