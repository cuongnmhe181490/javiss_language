import type { Metadata } from "next";
import { Headphones } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import { BetaPageShell } from "@/components/marketing/beta-page-shell";

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
  return (
    <BetaPageShell
      badge="READY-BETA speaking demo"
      title="Speaking realtime demo đang ở chế độ mock."
      description="Trang demo mô tả vòng luyện nói realtime, transcript và feedback phát âm. Bản này không gọi API, không mở microphone và không kết nối provider AI thật."
      icon={Headphones}
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
