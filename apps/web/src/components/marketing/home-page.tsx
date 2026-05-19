"use client";

import { ArrowRight, BookOpenCheck, CheckCircle2, Globe2, Headphones, Mic, Volume2 } from "lucide-react";
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
    <main id="main-content" className="min-h-screen overflow-hidden bg-slate-950 text-slate-50">
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="Học ngoại ngữ cùng AI" aria-current="page">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Globe2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-100">Học ngoại ngữ cùng AI</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-slate-400 md:flex">
          <Link className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-slate-100" href="/dashboard">Góc học</Link>
          <Link className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-slate-100" href="/#flow">Cách học</Link>
          <Link className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-white/5 hover:text-slate-100" href="/#trust">Nguồn học</Link>
        </nav>
        <Button size="sm" asChild className="h-11 rounded-2xl bg-emerald-500 px-4 text-slate-950 hover:bg-emerald-400">
          <Link href="/dashboard">Bắt đầu</Link>
        </Button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate pt-16">
      {/* Glow orbs */}
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-32 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-1/4 top-64 -z-10 size-[300px] rounded-full bg-teal-500/15 blur-[100px]"
      />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        {/* Left: text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <Badge className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Beta mở</Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Học ngoại ngữ<br />
            <span className="text-emerald-400">nhẹ hơn mỗi ngày.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-400">
            Bài học ngắn, giao diện yên, AI sửa lỗi vừa đủ. Mở web lên là biết hôm nay nên học gì.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-2xl bg-emerald-500 px-6 text-base font-medium text-slate-950 hover:bg-emerald-400">
              <Link href="/dashboard">Vào học thử <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl border-white/10 px-6 text-base text-slate-300 hover:bg-white/5 hover:text-white">
              <Link href="/demo-speaking">Xem luyện nói</Link>
            </Button>
          </div>
          <div className="mt-8 flex gap-6 text-sm text-slate-500">
            <span>8-12p mỗi bài</span>
            <span>4 kỹ năng</span>
            <span>ít nhiễu</span>
          </div>
        </motion.div>

        {/* Right: preview card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          {/* Lesson preview card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">A1</Badge>
              <span className="text-sm text-slate-400">Bài 1</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Chào hỏi người mới gặp</h3>
            <p className="text-sm text-slate-400 mb-4">Nói được một lời chào, giới thiệu ngắn và hỏi thêm một câu lịch sự.</p>
            <Progress value={45} className="h-1.5 mb-4" />
            <div className="space-y-2">
              {["Nghe mẫu", "Tập câu", "Nói thử"].map((step, i) => (
                <div key={step} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio waveform card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20">
                <Mic className="size-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">AI feedback</span>
            </div>
            {/* Waveform visualization */}
            <div className="flex items-end gap-[3px] h-10 mb-3">
              {[3, 5, 8, 12, 7, 10, 14, 9, 6, 11, 15, 8, 5, 9, 12, 7, 4, 8, 11, 6, 9, 13, 7, 5, 8].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-emerald-400/60"
                  animate={{ height: [h * 2.5, h * 1.5, h * 2.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                />
              ))}
            </div>
            <p className="text-sm text-slate-400 italic">&ldquo;Chậm hơn một nhịp ở câu thứ hai — nghe tự nhiên hơn đó.&rdquo;</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LanguageSection() {
  return (
    <section id="languages" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">Lộ trình có sẵn</h2>
          <p className="mt-2 text-slate-400">Chọn ngôn ngữ, bắt đầu từ trình độ phù hợp.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:border-emerald-500/30 hover:bg-white/[0.07]">
                <h3 className="font-semibold text-slate-100">{lang.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{lang.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowSection() {
  return (
    <section id="flow" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">Cách học mỗi ngày</h2>
          <p className="mt-2 text-slate-400">Không cần kế hoạch phức tạp. Mở lên, học, xong.</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {dailyFlow.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl h-full">
                <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-medium text-emerald-400 mb-3">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="trust" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">Nguồn học minh bạch</h2>
          <p className="mt-2 text-slate-400">Nội dung có kiểm chứng, không AI tự phát.</p>
        </motion.div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <ul className="space-y-3">
            {trustItems.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden="true" />
                <span className="text-sm text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-10 text-center backdrop-blur-xl sm:p-14"
        >
          <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">Sẵn sàng thử?</h2>
          <p className="mt-3 text-slate-400">Không cần đăng ký. Mở dashboard, chọn bài, bắt đầu.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-2xl bg-emerald-500 px-6 text-base font-medium text-slate-950 hover:bg-emerald-400">
              <Link href="/dashboard">Vào học thử <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl border-white/10 px-6 text-base text-slate-300 hover:bg-white/5 hover:text-white">
              <Link href="/demo-speaking">Xem luyện nói</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
