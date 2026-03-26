import { AppShell } from "@/components/shared/app-shell";
import { PublicAnalyticsLinkButton } from "@/components/shared/public-analytics-link-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { vi } from "@/i18n/dictionaries/vi";

export const dynamic = "force-dynamic";

const howItWorks = [
  {
    step: "Bước 1",
    title: "Gửi hồ sơ đăng ký",
    description:
      "Bạn chọn kỳ thi mục tiêu, điểm mong muốn và ngôn ngữ muốn học để đội ngũ hiểu đúng nhu cầu ngay từ đầu.",
  },
  {
    step: "Bước 2",
    title: "Đội ngũ xem xét và phê duyệt",
    description:
      "Mỗi tài khoản đều được kiểm duyệt trước khi mở quyền truy cập, giúp môi trường học tập nghiêm túc và hỗ trợ đúng người.",
  },
  {
    step: "Bước 3",
    title: "Nhận mã xác thực qua email",
    description:
      "Khi được duyệt, bạn sẽ nhận email chứa mã kích hoạt. Chỉ cần nhập đúng mã để hoàn tất bước mở tài khoản.",
  },
  {
    step: "Bước 4",
    title: "Bắt đầu học với AI và lộ trình cá nhân",
    description:
      "Sau khi kích hoạt, bạn vào dashboard để luyện speaking, theo dõi tiến độ và nhận gợi ý học tập phù hợp.",
  },
];

const capabilities = [
  {
    title: "Luyện speaking 1:1 với AI",
    description:
      "Tập nói theo từng lượt như một buổi phỏng vấn thật, có chấm band sơ bộ và lưu lịch sử từng lần nói.",
  },
  {
    title: "Theo dõi mục tiêu và tiến độ",
    description:
      "Bạn biết mình đang hướng tới kỳ thi nào, cần đạt mức điểm nào và hiện đang ở giai đoạn nào trong lộ trình.",
  },
  {
    title: "Nhận gợi ý bước tiếp theo",
    description:
      "Dashboard luôn nhắc bạn nên học gì tiếp theo thay vì để bạn tự loay hoay giữa quá nhiều tài liệu.",
  },
  {
    title: "Sẵn sàng mở rộng nhiều ngôn ngữ",
    description:
      "Hôm nay ưu tiên IELTS tiếng Anh. Về sau vẫn có thể mở rộng sang tiếng Trung, tiếng Nhật và tiếng Hàn mà không phải làm lại nền tảng.",
  },
];

const audiences = [
  {
    title: "Người mới bắt đầu nhưng muốn học bài bản",
    description:
      "Bạn cần một quy trình rõ ràng, ít nhiễu, biết mình nên bắt đầu từ đâu và học thế nào cho đúng hướng.",
  },
  {
    title: "Người đã học trước đó nhưng thiếu kỷ luật",
    description:
      "Bạn muốn quay lại học nghiêm túc, có dashboard theo dõi và một hệ thống nhắc đúng việc cần làm.",
  },
  {
    title: "Người chuẩn bị thi và cần tăng tốc",
    description:
      "Bạn muốn tập trung vào mục tiêu điểm, luyện speaking và writing có phản hồi nhanh thay vì học lan man.",
  },
];

const faqs = [
  {
    question: "Vì sao phải chờ phê duyệt mới dùng được tài khoản?",
    answer:
      "Vì Javiss Language không mở tài khoản đại trà. Quy trình phê duyệt giúp đội ngũ kiểm soát chất lượng người dùng, hỗ trợ đúng nhu cầu và giữ hệ thống ổn định cho học viên đang học.",
  },
  {
    question: "Sau khi được duyệt, tôi cần làm gì tiếp theo?",
    answer:
      "Bạn sẽ nhận email chứa mã xác thực. Nhập mã tại trang xác thực để kích hoạt tài khoản, sau đó có thể đăng nhập vào dashboard học tập.",
  },
  {
    question: "Nếu chưa nhận được email xác thực thì sao?",
    answer:
      "Bạn có thể vào trang xác thực để gửi lại mã. Đồng thời hãy kiểm tra cả hộp thư rác và mục quảng cáo nếu đang dùng Gmail.",
  },
  {
    question: "Hiện tại web hỗ trợ kỳ thi nào?",
    answer:
      "Ở giai đoạn này hệ thống ưu tiên IELTS tiếng Anh. Tuy nhiên nền tảng đã được thiết kế để mở rộng sang HSK, JLPT và TOPIK trong các giai đoạn tiếp theo.",
  },
];

const heroMetrics = [
  { value: "4 bước", label: "để đi từ đăng ký đến kích hoạt" },
  { value: "1 dashboard", label: "theo dõi mục tiêu, tiến độ và bài luyện" },
  { value: "AI 1:1", label: "cho speaking mock và coaching cá nhân" },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <AppShell session={session}>
      <div className="space-y-16">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge>{vi.home.badge}</Badge>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700 dark:text-sky-300">
                {vi.home.socialProof}
              </p>
              <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
                {vi.home.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                {vi.home.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PublicAnalyticsLinkButton
                href="/register"
                label={vi.home.primaryCta}
                eventName="landing_cta_clicked"
                source="hero"
                intent="registration"
                size="lg"
              />
              <PublicAnalyticsLinkButton
                href="/login"
                label={vi.home.secondaryCta}
                eventName="landing_cta_clicked"
                source="hero"
                intent="login_support"
                size="lg"
                variant="outline"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <p className="text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="overflow-hidden border-white/70 bg-white/80 shadow-2xl shadow-sky-100/60 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-none">
              <CardHeader className="space-y-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Bảng điều khiển học tập</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Đang hoạt động
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Thấy ngay kỳ thi mục tiêu, điểm cần đạt, trạng thái hiện tại và bước nên học tiếp.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 p-6">
                <div className="rounded-2xl bg-slate-950 p-4 text-white dark:bg-slate-900">
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Mục tiêu hiện tại</p>
                  <p className="mt-2 text-2xl font-bold">IELTS Academic 7.0</p>
                  <p className="mt-2 text-sm text-slate-300">Speaking là kỹ năng cần ưu tiên trong tuần này.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bước tiếp theo</p>
                    <p className="mt-2 font-semibold">Hoàn thành một speaking mock Part 2</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tiến độ tuần này</p>
                    <p className="mt-2 font-semibold">3/5 buổi học đã hoàn thành</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
                <CardHeader>
                  <CardTitle className="text-lg">Speaking với AI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                      Examiner AI:
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Tell me about a recent trip that you enjoyed.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-sky-600 p-4 text-sm leading-6 text-white">
                    Technology helps me prepare more flexibly because I can practise speaking at
                    home and review feedback whenever I want.
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Band sơ bộ</span>
                    <span className="text-lg font-bold text-slate-950 dark:text-white">5.5</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
                <CardHeader>
                  <CardTitle className="text-lg">Nhận góp ý cho bài viết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                      Điểm mạnh
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Bố cục rõ ràng, có luận điểm chính và ví dụ tương đối thuyết phục.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Cần cải thiện
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-700 dark:text-amber-300">
                      Câu ghép còn lặp cấu trúc, từ nối chưa đa dạng, kết luận cần dứt khoát hơn.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              {vi.home.howItWorksTitle}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Quy trình rõ ràng ngay từ lần đầu đăng ký
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <Card key={item.step} className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
                <CardContent className="space-y-4 p-6">
                  <Badge className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {item.step}
                  </Badge>
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              {vi.home.capabilitiesTitle}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Bạn sẽ làm được gì trên nền tảng này?
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item) => (
              <Card key={item.title} className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
                <CardContent className="space-y-3 p-6">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              {vi.home.audienceTitle}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Phù hợp với ai?
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {audiences.map((item) => (
              <Card key={item.title} className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
                <CardContent className="space-y-3 p-6">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              {vi.home.faqTitle}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Những điều người học thường hỏi trước khi đăng ký
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <Card key={item.question} className="border-white/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
                <CardContent className="space-y-3 p-6">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">
                    {item.question}
                  </p>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
