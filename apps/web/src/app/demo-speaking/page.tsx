import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { BetaPageShell } from "@/components/marketing/beta-page-shell";
import { hasConfiguredApiBaseUrl } from "@/lib/api-base-url";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Speaking realtime demo",
  description:
    "Demo speaking realtime dạng mock cho Polyglot AI Academy, chưa gọi API hoặc provider AI thật.",
  alternates: {
    canonical: absoluteUrl("/demo-speaking"),
  },
  openGraph: {
    title: "Speaking realtime demo | Polyglot AI Academy",
    url: absoluteUrl("/demo-speaking"),
    images: ["/og-image.svg"],
  },
};

export default function DemoSpeakingPage() {
  const isApiConfigured = hasConfiguredApiBaseUrl();

  return (
    <BetaPageShell
      badge="READY-BETA speaking demo"
      title="Speaking realtime demo đang ở chế độ mock."
      description="Trang demo mô tả vòng luyện nói realtime, transcript và feedback phát âm. Bản này chưa mở microphone hoặc kết nối provider AI thật trong public beta."
      icon={Headphones}
      eyebrow={isApiConfigured ? "API CONFIGURED" : "API MOCK MODE"}
      statusCallout={{
        title: isApiConfigured ? "Staging API env detected" : "No staging API connected",
        copy: isApiConfigured
          ? "NEXT_PUBLIC_API_BASE_URL đã được cấu hình, nhưng trang demo vẫn giữ chế độ mô tả cho tới khi realtime flow có browser smoke test."
          : "Chưa có NEXT_PUBLIC_API_BASE_URL nên trang này không gọi backend. Khi API staging sẵn sàng, dùng helper apiUrl() để nối luồng thật.",
      }}
      primaryCta={{ label: "Đăng ký tenant pilot", href: "/register" }}
      secondaryCta={{ label: "Quay về trang chủ", href: "/" }}
      asideTitle="Mock speaking loop"
      asideCopy="Mục tiêu là cho người dùng hiểu trải nghiệm beta mà không tạo phụ thuộc vào backend realtime trong deployment public."
      points={[
        {
          title: "Roleplay theo ngữ cảnh",
          copy: "Người học luyện tình huống như check-in khách sạn, phỏng vấn hoặc hội thoại công việc.",
        },
        {
          title: "Transcript và feedback",
          copy: "Luồng sản phẩm dự kiến hiển thị transcript, điểm phát âm, fluency và gợi ý sửa lỗi.",
        },
        {
          title: "Không dùng microphone",
          copy: "Bản public này không xin quyền thiết bị và không gửi âm thanh ra ngoài.",
        },
      ]}
    />
  );
}
