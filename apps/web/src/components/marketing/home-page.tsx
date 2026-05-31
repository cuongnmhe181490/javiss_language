"use client";

import { ArrowRight, CheckCircle2, Globe2, Mic } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SiteFooter } from "./site-footer";
import { ThemeSwitcher } from "@/components/theme-switcher";

const languages = [
  { name: "Tiếng Anh", detail: "CEFR A1-C2 · giao tiếp, công việc, IELTS/TOEIC" },
  { name: "Tiếng Trung", detail: "HSK · pinyin, thanh điệu, câu dùng hằng ngày" },
  { name: "Tiếng Nhật", detail: "JLPT · kana, kanji cơ bản, mẫu câu ngắn" },
  { name: "Tiếng Hàn", detail: "TOPIK · Hangul, trợ từ, hội thoại nhập môn" },
];

const dailyFlow = [
  { title: "Học 1 bài ngắn", copy: "8-12 phút. Mỗi bài chỉ có một mục tiêu rõ." },
  {
    title: "Luyện nói nhẹ nhàng",
    copy: "Roleplay theo tình huống, có transcript và gợi ý sửa lỗi.",
  },
  {
    title: "Ôn đúng lỗi hay gặp",
    copy: "Dashboard nhắc bài cần học tiếp, không nhồi quá nhiều số liệu.",
  },
];

const trustItems = [
  "Bám khung CEFR, JLPT, HSK, TOPIK.",
  "AI chỉ hỗ trợ gợi ý, không tự xuất bản bài học.",
  "Bài publish cần nguồn, license và kiểm duyệt.",
  "Không copy giáo trình lậu hoặc nội dung không rõ quyền dùng.",
];

export function HomePage() {
  return (
    <main id="main-content" className="min-h-screen overflow-hidden bg-background text-foreground">
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3"
          aria-label="Học ngoại ngữ cùng AI"
          aria-current="page"
        >
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Globe2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-foreground">
            Học ngoại ngữ cùng AI
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <Link
            className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-accent hover:text-foreground"
            href="/dashboard"
          >
            Góc học
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-accent hover:text-foreground"
            href="/#flow"
          >
            Cách học
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-xl px-3 transition hover:bg-accent hover:text-foreground"
            href="/#trust"
          >
            Nguồn học
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button
            size="sm"
            asChild
            className="h-11 rounded-2xl bg-primary px-4 text-primary-foreground hover:opacity-90"
          >
            <Link href="/dashboard">Bắt đầu</Link>
          </Button>
        </div>
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
        className="absolute left-1/2 top-32 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-1/4 top-64 -z-10 size-[300px] rounded-full bg-primary/10 blur-[100px]"
      />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Badge className="mb-4 border-primary/30 bg-primary/10 text-primary">Beta mở</Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Học ngoại ngữ
            <br />
            <span className="text-primary">nhẹ hơn mỗi ngày.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Bài học ngắn, giao diện yên, AI sửa lỗi vừa đủ. Mở web lên là biết hôm nay nên học gì.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-2xl bg-primary px-6 text-base font-medium text-primary-foreground hover:opacity-90"
            >
              <Link href="/dashboard">
                Vào học thử <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-border px-6 text-base text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Link href="/demo-speaking">Xem luyện nói</Link>
            </Button>
          </div>
          <div className="mt-8 flex gap-6 text-sm text-muted-foreground">
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
          <div className="rounded-3xl border border-border bg-card p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/30">A1</Badge>
              <span className="text-sm text-muted-foreground">Bài 1</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Chào hỏi người mới gặp</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nói được một lời chào, giới thiệu ngắn và hỏi thêm một câu lịch sự.
            </p>
            <Progress value={45} className="h-1.5 mb-4" />
            <div className="space-y-2">
              {["Nghe mẫu", "Tập câu", "Nói thử"].map((step, i) => (
                <div key={step} className="flex items-center gap-3 rounded-xl bg-accent px-3 py-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio waveform card */}
          <div className="rounded-3xl border border-border bg-card p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
                <Mic className="size-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">AI feedback</span>
            </div>
            {/* Waveform visualization */}
            <div className="flex items-end gap-[3px] h-10 mb-3">
              {[
                3, 5, 8, 12, 7, 10, 14, 9, 6, 11, 15, 8, 5, 9, 12, 7, 4, 8, 11, 6, 9, 13, 7, 5, 8,
              ].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-primary/60"
                  animate={{ height: [h * 2.5, h * 1.5, h * 2.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic">
              &ldquo;Chậm hơn một nhịp ở câu thứ hai — nghe tự nhiên hơn đó.&rdquo;
            </p>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Lộ trình có sẵn</h2>
          <p className="mt-2 text-muted-foreground">Chọn ngôn ngữ, bắt đầu từ trình độ phù hợp.</p>
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
              <div className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl transition hover:border-primary/30 hover:bg-accent">
                <h3 className="font-semibold text-foreground">{lang.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{lang.detail}</p>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Cách học mỗi ngày</h2>
          <p className="mt-2 text-muted-foreground">
            Không cần kế hoạch phức tạp. Mở lên, học, xong.
          </p>
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
              <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl h-full">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary mb-3">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Nguồn học minh bạch</h2>
          <p className="mt-2 text-muted-foreground">Nội dung có kiểm chứng, không AI tự phát.</p>
        </motion.div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <ul className="space-y-3">
            {trustItems.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm text-foreground">{item}</span>
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
          className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-10 text-center backdrop-blur-xl sm:p-14"
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Sẵn sàng thử?</h2>
          <p className="mt-3 text-muted-foreground">
            Không cần đăng ký. Mở dashboard, chọn bài, bắt đầu.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-2xl bg-primary px-6 text-base font-medium text-primary-foreground hover:opacity-90"
            >
              <Link href="/dashboard">
                Vào học thử <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-border px-6 text-base text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Link href="/demo-speaking">Xem luyện nói</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
