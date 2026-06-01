import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50"
    >
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
          <Compass className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Trang bạn tìm không tồn tại hoặc đã được di chuyển. Hãy quay lại trang chủ hoặc tiếp tục
          học.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild className="h-11">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Về trang chủ
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 border-slate-700">
            <Link href="/dashboard">Vào góc học</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
