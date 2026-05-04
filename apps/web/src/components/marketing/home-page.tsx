"use client";

import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Database,
  Globe2,
  Headphones,
  Lock,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteFooter } from "./site-footer";

const languageTracks = [
  {
    name: "English",
    path: "CEFR A1-C2",
    focus: "IELTS, TOEIC, TOEFL, công việc",
    accent: "bg-sky-500",
  },
  {
    name: "Chinese",
    path: "HSK 1-6/9",
    focus: "Pinyin, tone, character writing",
    accent: "bg-rose-500",
  },
  {
    name: "Japanese",
    path: "JLPT N5-N1",
    focus: "Kana, kanji, pitch accent cơ bản",
    accent: "bg-violet-500",
  },
  {
    name: "Korean",
    path: "TOPIK I-II",
    focus: "Hangul, particles, honorifics",
    accent: "bg-emerald-500",
  },
];

const operatingPillars = [
  {
    icon: Mic,
    title: "Speaking realtime",
    copy: "Roleplay, transcript, turn-taking và báo cáo phát âm sau mỗi phiên luyện nói.",
  },
  {
    icon: Users,
    title: "L&D dashboard",
    copy: "Theo dõi adoption, assignment completion và speaking outcomes theo tenant/cohort.",
  },
  {
    icon: Database,
    title: "Content Studio sạch",
    copy: "Nguồn học liệu, license, lineage, validation và quality score được kiểm soát trước publish.",
  },
  {
    icon: ShieldCheck,
    title: "AI có guardrails",
    copy: "Tenant agents dùng prompt versioning, policy versioning, allow-list tools và schema validation.",
  },
];

const reportScores = [
  { label: "Pronunciation", value: 84 },
  { label: "Fluency", value: 78 },
  { label: "Grammar", value: 91 },
  { label: "Relevance", value: 88 },
];

export function HomePage() {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />
      <HeroSection />
      <LanguageSection />
      <ProductDepthSection />
      <TrustSection />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/72 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3"
          aria-label="Polyglot AI Academy"
          aria-current="page"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Globe2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-wide">Polyglot AI Academy</span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-2 transition hover:text-foreground"
            href="/dashboard"
          >
            Ngôn ngữ
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-2 transition hover:text-foreground"
            href="/placement"
          >
            Nền tảng
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-2 transition hover:text-foreground"
            href="/curriculum"
          >
            Enterprise trust
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden h-11 px-3 sm:inline-flex">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild className="h-11 px-3">
            <Link href="/dashboard">
              Bắt đầu
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate min-h-[100svh] pt-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,color-mix(in_oklab,var(--background)_88%,transparent)_0%,color-mix(in_oklab,var(--accent)_76%,transparent)_46%,color-mix(in_oklab,var(--primary)_14%,var(--background))_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <Badge variant="secondary" className="mb-6 rounded-md px-3 py-1 text-xs">
            Enterprise AI language learning cho đội ngũ và trường học
          </Badge>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-normal text-balance sm:text-6xl lg:text-7xl">
            Polyglot AI Academy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Học tiếng Anh, Trung, Nhật, Hàn bằng speaking realtime, AI coach theo tenant và
            analytics đủ tin cậy cho L&D.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-11 px-5">
              <Link href="/register">
                Tạo tenant pilot
                <Sparkles aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-5">
              <Link href="/demo-speaking">
                Xem speaking loop
                <Headphones aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm">
            <Metric value="<1.5s" label="target phản hồi giọng nói" />
            <Metric value="SSO" label="OIDC, SCIM và RBAC" />
            <Metric value="AA" label="accessibility target" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          className="relative min-h-[580px] lg:min-h-[680px]"
          aria-label="Minh họa giao diện học tập AI cho doanh nghiệp"
        >
          <ProductCanvas />
        </motion.div>
      </div>
    </section>
  );
}

function ProductCanvas() {
  return (
    <div className="absolute inset-0">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-8 w-[88%] rounded-lg border border-border/70 bg-background/70 p-4 shadow-[0_24px_90px_-55px_rgb(15_23_42/0.55)] backdrop-blur-2xl sm:p-5"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Today</p>
            <h2 className="mt-1 text-xl font-semibold">Speaking room</h2>
          </div>
          <Badge className="rounded-md bg-emerald-500/15 text-emerald-900 dark:text-emerald-200">
            Live
          </Badge>
        </div>
        <div className="space-y-4">
          <TranscriptLine
            speaker="AI Coach"
            text="Let's roleplay a hotel check-in. Start naturally."
          />
          <TranscriptLine speaker="Learner" text="Hi, I have a reservation under Nguyen." active />
        </div>
        <div className="mt-6 flex h-16 items-end gap-1.5 rounded-lg border border-border/60 bg-muted/35 p-3">
          {Array.from({ length: 28 }).map((_, index) => (
            <motion.span
              key={index}
              animate={{
                height: [
                  `${22 + (index % 6) * 7}%`,
                  `${48 + (index % 5) * 8}%`,
                  `${22 + (index % 6) * 7}%`,
                ],
              }}
              transition={{
                duration: 1.2 + (index % 5) * 0.08,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full rounded-full bg-primary/70"
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 right-0 w-[84%] rounded-lg border border-border/70 bg-card/82 p-5 shadow-[0_24px_80px_-50px_rgb(15_23_42/0.5)] backdrop-blur-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Pronunciation report
            </p>
            <h3 className="mt-1 text-lg font-semibold">/reservation/ cần nhấn âm thứ ba</h3>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Mic className="size-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {reportScores.map((score) => (
            <div key={score.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{score.label}</span>
                <span className="font-medium">{score.value}</span>
              </div>
              <Progress value={score.value} aria-label={`${score.label} score`} className="h-2" />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45, duration: 0.7 }}
        className="absolute right-6 top-[46%] hidden w-56 rounded-lg border border-border/60 bg-background/78 p-4 backdrop-blur-xl md:block"
      >
        <div className="mb-4 flex items-center gap-2">
          <Bot className="size-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Tenant agent</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-5/6" />
          <Skeleton className="h-2 w-3/4" />
          <Skeleton className="h-2 w-4/6" />
        </div>
      </motion.div>
    </div>
  );
}

function LanguageSection() {
  return (
    <section id="languages" className="border-y border-border/70 bg-muted/25 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Learning paths
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Một hệ thống, bốn hướng học khác nhau.
          </h2>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {languageTracks.map((track) => (
            <Card key={track.name} className="rounded-lg bg-background/70">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className={`size-2.5 rounded-full ${track.accent}`} />
                  <h3 className="font-semibold">{track.name}</h3>
                </div>
                <p className="mt-4 text-sm font-medium">{track.path}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{track.focus}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDepthSection() {
  return (
    <section id="product" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Enterprise foundation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Không chỉ là chatbot. Đây là nền tảng speaking cho tổ chức.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Learner dashboard, speaking room, tenant agents, assignments, analytics và Content
            Studio cùng chia sẻ tenant model sạch để scale được.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {operatingPillars.map((pillar) => (
            <Card key={pillar.title} className="rounded-lg">
              <CardContent className="p-5">
                <pillar.icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="trust" className="bg-foreground py-20 text-background sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Badge className="rounded-md bg-background/12 text-background hover:bg-background/12">
              Enterprise trust
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal sm:text-4xl">
              Kiến trúc bảo vệ dữ liệu học tập từ ngày đầu.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-background/70">
              Tenant isolation, SSO, RBAC/ABAC, audit log, license registry, prompt versioning và
              output validation được thiết kế như một phần sản phẩm.
            </p>
          </div>
          <div className="space-y-4">
            <TrustRow
              icon={Lock}
              title="Không hard-code secret"
              detail="Secret qua env/secret manager, log có redaction."
            />
            <TrustRow
              icon={Building2}
              title="Multi-tenant từ lõi"
              detail="Tenant routing, feature flags, glossary, agents và analytics theo tenant."
            />
            <TrustRow
              icon={CheckCircle2}
              title="Không publish content chưa duyệt"
              detail="Source, license, validation và quality score là publish gate."
            />
            <TrustRow
              icon={Zap}
              title="Realtime có fallback"
              detail="WebRTC/SFU trước, text fallback khi mic hoặc network lỗi."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Enterprise pilot
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal">
            Sẵn sàng nối tenant core, SSO, assignments và speaking loop.
          </h2>
        </div>
        <Button size="lg" asChild className="h-11 px-5">
          <Link href="/register">
            Lên pilot cho tổ chức
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
    </div>
  );
}

function TranscriptLine({
  speaker,
  text,
  active,
}: {
  speaker: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/65 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span className={active ? "text-primary" : ""}>{speaker}</span>
        {active ? <span className="size-1.5 rounded-full bg-emerald-500" /> : null}
      </div>
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}

function TrustRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Lock;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-background/12 bg-background/8 p-4">
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-5 text-background" aria-hidden="true" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-background/68">{detail}</p>
        </div>
      </div>
    </div>
  );
}
