import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LearningLauncherProps = {
  goalName: string | null;
  targetScore: string | null;
  options: Array<{
    key: string;
    title: string;
    description: string;
    href: string;
    cta: string;
    badge: string;
    recommended: boolean;
    recommendationReason: string | null;
  }>;
};

export function LearningLauncher({
  goalName,
  targetScore,
  options,
}: LearningLauncherProps) {
  const primaryOption = options.find((item) => item.recommended) ?? options[0];
  const secondaryOptions = options.filter((item) => item.key !== primaryOption?.key);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[32px] border border-sky-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.9))] p-8 shadow-xl shadow-sky-100/60 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] dark:shadow-none">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="rounded-full bg-sky-600 px-3 py-1 text-white hover:bg-sky-600">
            Bắt đầu học ngay
          </Badge>
          {goalName ? (
            <Badge className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Mục tiêu: {goalName}
              {targetScore ? ` · ${targetScore}` : ""}
            </Badge>
          ) : null}
        </div>
        <div className="mt-5 max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Tài khoản đã sẵn sàng. Chọn một bước mở màn thật dễ để bắt đầu học ngay hôm nay.
          </h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            Đừng để sau khi kích hoạt xong lại phải tự mò từ đầu. Hệ thống đã chọn sẵn một lối vào
            phù hợp nhất để bạn nhanh chóng có cảm giác tiến bộ.
          </p>
        </div>

        {primaryOption ? (
          <Card className="mt-8 border-sky-200 bg-white/85 shadow-xl shadow-sky-100/70 dark:border-sky-900/60 dark:bg-slate-950/80 dark:shadow-none">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950 dark:bg-sky-500 dark:hover:bg-sky-500">
                  Gợi ý chính
                </Badge>
                <Badge className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {primaryOption.badge}
                </Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl text-slate-950 dark:text-white">
                  {primaryOption.title}
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {primaryOption.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {primaryOption.recommendationReason ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm leading-7 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-4 w-4 shrink-0" />
                    <p>{primaryOption.recommendationReason}</p>
                  </div>
                </div>
              ) : null}
              <Link href={primaryOption.href}>
                <Button className="h-11 rounded-full px-6">
                  {primaryOption.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {secondaryOptions.map((option) => (
          <Card key={option.key} className="border-white/70 bg-white/85 dark:border-slate-800 dark:bg-slate-950/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {option.badge}
                </Badge>
              </div>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <CardDescription className="text-sm leading-7">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={option.href}>
                <Button variant="secondary">{option.cta}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
