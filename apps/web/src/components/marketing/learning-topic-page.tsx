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
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <section className="border-b border-slate-800/50">
        <div className="mx-auto grid min-h-[78svh] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <Badge variant="secondary" className="rounded-md bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {topic.eyebrow}
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              {topic.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {topic.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11">
                <Link href="/dashboard">
                  Vào góc học
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 border-slate-800/50 bg-slate-900/60">
                <Link href="/register">Tham gia bản thử nghiệm</Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
                  <Sparkles className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">
                    Lộ trình beta
                  </p>
                  <h2 className="text-2xl font-semibold">Bài này học thế nào</h2>
                </div>
              </div>
              <ol className="mt-7 grid gap-4">
                {topic.path.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-sm font-semibold text-emerald-300 border border-emerald-500/30">
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
        <InfoCard title="Bạn sẽ luyện" items={topic.practice} />
        <InfoCard title="AI hỗ trợ thế nào" items={topic.helps} />
        <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <span className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Route className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-semibold">Bước tiếp theo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Trang này đang dùng nội dung mẫu. Khi API staging sẵn sàng, bài học thật sẽ được nối qua `NEXT_PUBLIC_API_BASE_URL`.
            </p>
            <Button asChild variant="outline" className="mt-5 h-11 border-slate-800/50 bg-slate-950/60">
              <Link href="/curriculum">Xem lộ trình</Link>
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
    <Card className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span className="text-sm leading-6 text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
