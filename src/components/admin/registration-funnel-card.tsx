import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RegistrationFunnelCardProps = {
  periodLabel: string;
  registerClickCount: number;
  registerClickSessions: number;
  registrationsSubmitted: number;
  attributedRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  activatedAccounts: number;
  clickToRegistrationRate: string;
  approvalRate: string;
  activationRate: string;
  topSources: Array<{
    source: string;
    count: number;
  }>;
};

export function RegistrationFunnelCard({
  periodLabel,
  registerClickCount,
  registerClickSessions,
  registrationsSubmitted,
  attributedRegistrations,
  approvedRegistrations,
  rejectedRegistrations,
  activatedAccounts,
  clickToRegistrationRate,
  approvalRate,
  activationRate,
  topSources,
}: RegistrationFunnelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel đăng ký và kích hoạt</CardTitle>
        <CardDescription>
          Theo dõi hành trình từ click Đăng ký đến khi tài khoản được kích hoạt trong {periodLabel.toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Click Đăng ký
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {registerClickCount}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {registerClickSessions} phiên khác nhau
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Gửi đăng ký thành công
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {registrationsSubmitted}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {attributedRegistrations} đơn có attribution
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Được duyệt
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {approvedRegistrations}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Tỷ lệ duyệt: {approvalRate}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Đã kích hoạt
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {activatedAccounts}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Tỷ lệ kích hoạt: {activationRate}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Chất lượng funnel
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400">Click → đăng ký</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {clickToRegistrationRate}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400">Bị từ chối</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {rejectedRegistrations}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400">Direct / không track</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  {Math.max(0, registrationsSubmitted - attributedRegistrations)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Nguồn đăng ký nhiều nhất
            </p>
            <div className="mt-4 space-y-3">
              {topSources.length > 0 ? (
                topSources.map((item) => (
                  <div
                    key={item.source}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{item.source}</span>
                    <span className="font-semibold text-slate-950 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có đủ dữ liệu nguồn đăng ký trong giai đoạn này.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
