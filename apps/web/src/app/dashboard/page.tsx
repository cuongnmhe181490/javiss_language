import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import {
  AchievementStrip,
  AiTutorShortcut,
  AssignmentPreview,
  ContinueLearningCard,
  DailyGoalCard,
  DashboardHero,
  ProgressOverview,
  RecentActivityCard,
  SkillProgressGrid,
  SpeakingShortcut,
  WeeklyPlanCard,
} from "@/components/dashboard/dashboard-cards";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Learning dashboard beta",
  description:
    "A beta learning dashboard preview for Polyglot AI Academy with demo progress, assignments, skills, and practice shortcuts.",
  alternates: {
    canonical: absoluteUrl("/dashboard"),
  },
  openGraph: {
    title: "Learning dashboard beta | Polyglot AI Academy",
    description: "Preview the READY-BETA learner surface before backend staging is public.",
    url: absoluteUrl("/dashboard"),
    images: ["/og-image.svg"],
  },
};

export default function DashboardPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="h-11 px-3">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Home
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Demo data only. No production auth or API calls.
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHero />
        <ProgressOverview />

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <ContinueLearningCard />
          <DailyGoalCard />
        </section>

        <SkillProgressGrid />

        <section className="grid gap-4 lg:grid-cols-3">
          <AiTutorShortcut />
          <SpeakingShortcut />
          <AssignmentPreview />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <RecentActivityCard />
          <WeeklyPlanCard />
        </section>

        <AchievementStrip />
      </div>
      <SiteFooter />
    </main>
  );
}
