import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mic, MessageCircle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createLearningTopicMetadata } from "@/lib/learning-page-metadata";
import { scenarios } from "@/app/api/speaking/scenarios";

export const metadata: Metadata = createLearningTopicMetadata("speaking", "/speaking");

const levelStyles: Record<string, string> = {
  A1: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  A2: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  B1: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  B2: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function SpeakingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="size-4" />
            Trang chủ
          </Link>
          <span className="text-sm font-medium text-slate-300">Luyện nói</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-10">
          <Badge
            variant="secondary"
            className="rounded-md border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
          >
            Nói
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Luyện nói theo tình huống với AI
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Chọn một tình huống thực tế, nói bằng micro và nhận phản hồi tức thì về phát âm, ngữ
            pháp và gợi ý cải thiện. Hỗ trợ nhận dạng giọng nói trên trình duyệt — không cần cài
            đặt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-11">
              <Link href="/speaking-practice">
                <Mic className="size-4" aria-hidden="true" />
                Bắt đầu luyện nói
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 border-slate-800/50 bg-slate-900/60">
              <Link href="/demo-speaking">Xem bản demo</Link>
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Mic,
              title: "Nói tự nhiên",
              copy: "Nhấn mic và nói như đang hội thoại thật.",
            },
            {
              icon: MessageCircle,
              title: "AI phản hồi",
              copy: "Nhận lại lời thoại, transcript và gợi ý ngay.",
            },
            {
              icon: Sparkles,
              title: "Sửa lỗi nhẹ nhàng",
              copy: "Góp ý phát âm và ngữ pháp, không gây áp lực.",
            },
          ].map((step) => (
            <Card
              key={step.title}
              className="rounded-lg border-slate-800/50 bg-slate-900/80 backdrop-blur-sm"
            >
              <CardContent className="p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-3 font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">{step.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scenario grid */}
        <h2 className="mb-4 text-lg font-semibold">Chọn tình huống</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href="/speaking-practice"
              className="group rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                    levelStyles[scenario.level] ?? levelStyles.A1
                  }`}
                >
                  {scenario.level}
                </span>
                <span className="text-xs text-slate-500">{scenario.title}</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-100">{scenario.titleVi}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{scenario.descriptionVi}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-300">
                Luyện ngay
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
