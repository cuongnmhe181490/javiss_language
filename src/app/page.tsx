import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <Badge>{vi.home.badge}</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white">
              {vi.home.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              {vi.home.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">{vi.home.primaryCta}</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                {vi.home.secondaryCta}
              </Button>
            </Link>
          </div>
        </section>
        <Card className="overflow-hidden border-white/70 bg-white/70 shadow-2xl shadow-sky-100/60 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-none">
          <CardContent className="grid gap-4 p-6">
            {[
              [vi.home.featureOneTitle, vi.home.featureOneText],
              [vi.home.featureTwoTitle, vi.home.featureTwoText],
              [vi.home.featureThreeTitle, vi.home.featureThreeText],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <CardTitle className="text-base">{title}</CardTitle>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
