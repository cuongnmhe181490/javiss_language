import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Shown on /login and /register when Clerk is not configured. Instead of a
 * broken auth widget, learners are pointed to the keyless demo experience.
 */
export function AuthDemoNotice({ mode }: { mode: "sign-in" | "sign-up" }) {
  const heading = mode === "sign-in" ? "Đăng nhập" : "Tạo tài khoản";

  return (
    <Card className="w-full max-w-sm rounded-3xl border-border/50 bg-card/50 backdrop-blur-xl">
      <CardContent className="p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-foreground">{heading}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Bản demo đang chạy ở chế độ không cần đăng nhập. Bạn có thể vào học thử ngay mà không cần
          tài khoản. Khi cấu hình khóa Clerk, màn hình đăng nhập thật sẽ xuất hiện ở đây.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="h-11 rounded-xl">
            <Link href="/dashboard">
              Vào học thử
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
