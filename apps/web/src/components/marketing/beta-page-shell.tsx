import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "./site-footer";

type BetaPageShellProps = {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  eyebrow?: string;
  statusCallout?: {
    title: string;
    copy: string;
  };
  points: Array<{
    title: string;
    copy: string;
  }>;
  asideTitle: string;
  asideCopy: string;
};

export function BetaPageShell({
  badge,
  title,
  description,
  icon: Icon,
  primaryCta,
  secondaryCta,
  eyebrow = "READY-BETA",
  statusCallout,
  points,
  asideTitle,
  asideCopy,
}: BetaPageShellProps) {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <section className="relative isolate overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-8 h-11 px-3">
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Trang chủ
              </Link>
            </Button>
            <Badge variant="secondary" className="mb-6 rounded-md px-3 py-1 text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {badge}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? (
                <Button size="lg" asChild className="h-11 px-5">
                  <Link href={primaryCta.href}>
                    {primaryCta.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button size="lg" variant="outline" asChild className="h-11 px-5 border-slate-800/50 bg-slate-900/60">
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <Card className="rounded-lg bg-slate-900/80 backdrop-blur-sm border-slate-800/50 shadow-[0_0_80px_-20px_rgb(16_185_129/0.15)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{asideTitle}</h2>
                </div>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">{asideCopy}</p>
              {statusCallout ? (
                <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-sm font-medium">{statusCallout.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{statusCallout.copy}</p>
                </div>
              ) : null}
              <div className="mt-8 grid gap-3">
                {points.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-lg border border-slate-800/50 bg-slate-950/60 p-4"
                  >
                    <div className="flex gap-3">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-emerald-400"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-medium">{point.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{point.copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
