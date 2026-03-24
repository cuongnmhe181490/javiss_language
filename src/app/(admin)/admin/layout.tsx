import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { requireRoles } from "@/lib/auth/guards";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRoles(["super_admin", "admin"]);

  return (
    <AppShell session={session}>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/80">
          <nav className="grid gap-2 text-sm">
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin">
              {vi.nav.admin}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin/registrations">
              {vi.nav.registrations}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin/users">
              {vi.nav.users}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin/content">
              {vi.nav.content}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin/plans">
              {vi.nav.plans}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin/logs">
              {vi.nav.logs}
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/admin/settings">
              {vi.nav.settings}
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </AppShell>
  );
}
