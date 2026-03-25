import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SpeakingTrendPoint = {
  id: string;
  estimatedBand: string;
  createdAt: string;
  conversationId: string;
  scenario: string | null;
};

function parseBand(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SpeakingTrendCard({
  items,
}: {
  items: SpeakingTrendPoint[];
}) {
  const trendPoints = [...items].reverse();
  const latestBand = trendPoints.at(-1)?.estimatedBand ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Band speaking gần đây</CardTitle>
        <CardDescription>
          Theo dõi các lượt chấm band gần nhất để nhìn ra xu hướng tiến bộ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            Bạn chưa có dữ liệu speaking gần đây. Hãy mở một phiên speaking mock để bắt đầu được chấm band.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Band mới nhất
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {latestBand ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Số lượt đã chấm
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {items.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Màn hình chi tiết
                </p>
                <div className="mt-2">
                  <Link href="/dashboard/ai-coach">
                    <Button size="sm" type="button" variant="outline">
                      Mở AI Coach
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 items-end gap-3">
              {trendPoints.map((item, index) => {
                const band = parseBand(item.estimatedBand);
                const height = Math.max(20, Math.round((band / 9) * 160));

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex h-44 items-end justify-center rounded-2xl bg-slate-50/80 px-2 py-3 dark:bg-slate-900/50">
                      <div
                        className="flex w-full items-end justify-center rounded-2xl bg-gradient-to-t from-sky-500 to-cyan-300 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/20"
                        style={{ height }}
                        title={`${item.estimatedBand} band`}
                      >
                        <span className="pb-2">{item.estimatedBand}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Lượt {index + 1}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/ai-coach?conversationId=${item.conversationId}`}
                  className="block rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-sky-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-sky-800"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      Band {item.estimatedBand}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {item.scenario ?? "Phiên speaking mock"}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
