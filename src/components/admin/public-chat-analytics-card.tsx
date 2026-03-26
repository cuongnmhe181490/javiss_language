import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PublicChatAnalyticsCardProps = {
  periodLabel: string;
  widgetOpens: number;
  totalMessages: number;
  totalTrackedClicks: number;
  registerIntentClicks: number;
  loginIntentClicks: number;
  verifyIntentClicks: number;
  registerConversionRate: string;
  topIntents: Array<{
    intent: string;
    count: number;
  }>;
  topActions: Array<{
    label: string;
    href: string;
    count: number;
  }>;
};

function getIntentLabel(intent: string) {
  switch (intent) {
    case "registration":
      return "Đăng ký";
    case "approval_status":
      return "Trạng thái duyệt";
    case "verification":
      return "Xác thực";
    case "login_support":
      return "Đăng nhập / mật khẩu";
    case "speaking":
      return "Speaking AI";
    case "writing":
      return "Writing Feedback";
    case "pricing":
      return "Giá / gói học";
    case "exam_scope":
      return "Kỳ thi / ngôn ngữ";
    case "dashboard":
      return "Dashboard / lộ trình";
    default:
      return "Chung";
  }
}

export function PublicChatAnalyticsCard({
  periodLabel,
  widgetOpens,
  totalMessages,
  totalTrackedClicks,
  registerIntentClicks,
  loginIntentClicks,
  verifyIntentClicks,
  registerConversionRate,
  topIntents,
  topActions,
}: PublicChatAnalyticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbot công khai và chuyển đổi</CardTitle>
        <CardDescription>
          Theo dõi nhu cầu người dùng trước khi đăng ký trong {periodLabel.toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Mở widget
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {widgetOpens}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Tin nhắn hoàn tất
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {totalMessages}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Click đã track
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {totalTrackedClicks}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Tỷ lệ click đăng ký
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {registerConversionRate}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Intent được hỏi nhiều nhất
            </p>
            <div className="mt-4 space-y-3">
              {topIntents.length > 0 ? (
                topIntents.map((item) => (
                  <div
                    key={item.intent}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {getIntentLabel(item.intent)}
                    </span>
                    <span className="font-semibold text-slate-950 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có đủ dữ liệu intent trong giai đoạn này.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Action được bấm nhiều nhất
            </p>
            <div className="mt-4 space-y-3">
              {topActions.length > 0 ? (
                topActions.map((item) => (
                  <div
                    key={`${item.label}-${item.href}`}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-950 dark:text-white">
                        {item.label}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {item.count}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.href}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có dữ liệu click để phân tích.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400">Click vào Đăng ký</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {registerIntentClicks}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400">Click vào Đăng nhập</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {loginIntentClicks}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400">Click vào Xác thực</p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {verifyIntentClicks}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
