"use client";

import { ArrowRight, BookOpenCheck, CheckCircle2, Globe2, Headphones, Mic } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SiteFooter } from "./site-footer";

const languages = [
  { name: "Tiếng Anh", detail: "CEFR A1-C2 · giao tiếp, công việc, IELTS/TOEIC" },
  { name: "Tiếng Trung", detail: "HSK · pinyin, thanh điệu, câu dùng hằng ngày" },
  { name: "Tiếng Nhật", detail: "JLPT · kana, kanji cơ bản, mẫu câu ngắn" },
  { name: "Tiếng Hàn", detail: "TOPIK · Hangul, trợ từ, hội thoại nhập môn" },
];

const dailyFlow = [
  { title: "Học 1 bài ngắn", copy: "8-12 phút. Mỗi bài chỉ có một mục tiêu rõ." },
  { title: "Luyện nói nhẹ nhàng", copy: "Roleplay theo tình huống, có transcript và gợi ý sửa lỗi." },
  { title: "Ôn đúng lỗi hay gặp", copy: "Dashboard nhắc bài cần học tiếp, không nhồi quá nhiều số liệu." },
];

const trustItems = [
  "Bám khung CEFR, JLPT, HSK, TOPIK.",
  "AI chỉ hỗ trợ gợi ý, không tự xuất bản bài học.",
  "Bài publish cần nguồn, license và kiểm duyệt.",
  "Không copy giáo trình lậu hoặc nội dung không rõ quyền dùng.",
];

export function HomePage() {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <SiteHeader />
      <HeroSection />
      <LanguageSection />
      <FlowSection />
      <TrustSection />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-[#fbfaf7]/82 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/82">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="Học ngoại ngữ cùng AI" aria-current="page">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Globe2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-wide">Học ngoại ngữ cùng AI</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-slate-600 dark:text-slate-300 md:flex">
          <Link className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white" href="/dashboard">Góc học</Link>
          <Link className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white" href="/#flow">Cách học</Link>
          <Link className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white" href="/#trust">Nguồn học</Link>
        </nav>
        <Button size="sm" asChild className="h-11 rounded-2xl px-4">
          <Link href="/dashboard">Bắt đầu</Link>
        </Button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate pt-16">
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.04, 1], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-24 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-emerald-200 blur-3xl dark:bg-emerald-950"
      />
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut" }}>
          <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1 text-xs">Bản beta · học 10 phút mỗi ngày</Badge>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            Học ngoại ngữ nhẹ hơn mỗi ngày.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Bài học ngắn, giao diện yên, AI sửa lỗi vừa đủ. Mở web lên là biết hôm nay nên học gì.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-12 rounded-2xl px-5">
              <Link href="/dashboard">Vào học thử <ArrowRight aria-hidden="true" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 rounded-2xl bg-white/60 px-5 dark:bg-slate-900/60">
              <Link href="/demo-speaking">Xem luyện nói <Headphones aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="mt-9 grid max-w-lg grid-cols-3 gap-3 text-sm">
            <MiniStat value="8-12p" label="mỗi bài" />
            <MiniStat value="4 kỹ năng" label="nghe nói đọc ngữ pháp" />
            <MiniStat value="ít nhiễu" label="tập trung học" />
          </div>
        </motion.div>
        <LearningPreview />
      </div>
    </section>
  );
}

function LearningPreview() {
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="relative min-h-[560px]">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-x-0 top-4 rounded-[2rem] border border-white/80 bg-white/82 p-5 shadow-[0_30px_90px_-55px_rgb(15_23_42/0.55)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/82">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bài hôm nay</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Chào hỏi người mới gặp</h2>
          </div>
          <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200">A1</Badge>
        </div>
        <div className="mt-6 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/60">
          <p className="text-sm font-medium">Mục tiêu</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Nói được một lời chào, giới thiệu ngắn và hỏi thêm một câu lịch sự.</p>
          <Progress value={64} className="mt-5 h-2" aria-label="Tiến độ bài học" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {['Nghe mẫu', 'Tập câu', 'Nói thử'].map((item, index) => (
            <motion.div key={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + index * 0.08 }} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-slate-400">0{index + 1}</span>
              <p className="mt-1 font-medium">{item}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-8 right-0 w-[86%] rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_28px_80px_-55px_rgb(15_23_42/0.55)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/88">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950"><Mic className="size-5" aria-hidden="true" /></span>
          <div>
            <p className="font-semibold">Gợi ý sau khi nói</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Chậm hơn một nhịp ở câu thứ hai.</p>
          </div>
        </div>
        <div className="mt-5 flex h-14 items-end gap-1.5 rounded-3xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
          {Array.from({ length: 24 }).map((_, index) => (
            <motion.span key={index} animate={{ height: [`${20 + (index % 5) * 8}%`, `${52 + (index % 6) * 6}%`, `${20 + (index % 5) * 8}%`] }} transition={{ duration: 1.1 + (index % 4) * 0.1, repeat: Infinity, ease: "easeInOut" }} className="w-full rounded-full bg-emerald-500/70" />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LanguageSection() {
  return (
    <section className="border-y border-slate-200/70 bg-white/58 py-16 dark:border-slate-800 dark:bg-slate-900/25">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="Lộ trình" title="Chọn ngôn ngữ, học từ mức dễ trước." copy="Không cần mở quá nhiều thứ. Chọn một mục tiêu, học một bài ngắn, rồi quay lại ngày mai." />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {languages.map((language, index) => (
            <motion.div key={language.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.06 }}>
              <Card className="rounded-3xl border-slate-200 bg-[#fbfaf7] dark:border-slate-800 dark:bg-slate-950/70">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"><BookOpenCheck className="size-5" aria-hidden="true" /></span>
                  <div>
                    <h3 className="font-semibold">{language.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{language.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowSection() {
  return (
    <section id="flow" className="py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="Cách học" title="Mỗi màn chỉ giữ việc cần làm." copy="Ít card hơn, ít số liệu hơn, ưu tiên cảm giác mở ra là học được ngay." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {dailyFlow.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.08 }}>
              <Card className="h-full rounded-3xl bg-white/75 dark:bg-slate-900/70">
                <CardContent className="p-6">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">0{index + 1}</span>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.copy}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="trust" className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <div>
          <Badge className="rounded-full bg-white/12 text-white hover:bg-white/12">Nguồn học</Badge>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Nội dung học phải rõ nguồn, không mơ hồ.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">Bản hiện tại dùng dữ liệu demo để kiểm UI. Bản học thật cần nội dung đã được duyệt trước khi xuất bản.</p>
        </div>
        <div className="grid gap-3">
          {trustItems.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/6 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden="true" />
              <p className="text-sm leading-6 text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="pb-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bản beta</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Xem thử flow học, chưa giả đăng nhập hay API production.</h2>
        </div>
        <Button size="lg" asChild className="h-12 rounded-2xl px-5">
          <Link href="/dashboard">Vào góc học <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </div>
    </section>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.55 }} className="max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
    </motion.div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <p className="font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
