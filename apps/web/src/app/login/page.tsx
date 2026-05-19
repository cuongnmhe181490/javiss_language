import type { Metadata } from "next";
import Link from "next/link";
import { Globe2 } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào nền tảng học ngoại ngữ cùng AI.",
  alternates: { canonical: absoluteUrl("/login") },
};

export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-3">
            <Globe2 className="size-6" />
          </span>
          <h1 className="text-xl font-bold text-slate-100">Đăng nhập</h1>
          <p className="mt-1 text-sm text-slate-400">Tiếp tục hành trình học ngoại ngữ</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()} action="#">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Mật khẩu</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              Đăng nhập
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">hoặc</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* SSO buttons */}
          <div className="space-y-2">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-slate-300 transition hover:bg-white/10">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Đăng nhập bằng Google
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300">Đăng ký</Link>
        </p>
      </div>
    </main>
  );
}
