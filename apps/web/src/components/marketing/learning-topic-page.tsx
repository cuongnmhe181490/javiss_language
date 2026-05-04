import Link from "next/link";
import { ArrowRight, CheckCircle2, Route, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { publicLearningTopics } from "@/lib/demo-learning-data";
import { SiteFooter } from "./site-footer";

type LearningTopic = (typeof publicLearningTopics)[keyof typeof publicLearningTopics];

export function LearningTopicPage({ topic }: { topic: LearningTopic }) {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70">
        <div className="mx-auto grid min-h-[78svh] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <Badge variant="secondary" className="rounded-md">
              {topic.eyebrow}
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              {topic.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {topic.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11">
                <Link href="/dashboard">
                  Start dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11">
                <Link href="/register">Join beta pilot</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-lg">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                    Beta learning path
                  </p>
                  <h2 className="text-2xl font-semibold">How the page connects</h2>
                </div>
              </div>
              <ol className="mt-7 grid gap-4">
                {topic.path.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <InfoCard title="What you practice" items={topic.practice} />
        <InfoCard title="How Polyglot AI helps" items={topic.helps} />
        <Card className="rounded-lg">
          <CardContent className="p-6">
            <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Route className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-semibold">Next beta step</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use this page as a public route today. Connect it to real course data later through
              `NEXT_PUBLIC_API_BASE_URL` after backend staging is public.
            </p>
            <Button asChild variant="outline" className="mt-5 h-11">
              <Link href="/curriculum">View curriculum</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </main>
  );
}

function InfoCard({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="text-sm leading-6 text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
