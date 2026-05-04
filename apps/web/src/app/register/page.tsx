import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import { BetaPageShell } from "@/components/marketing/beta-page-shell";

export const metadata: Metadata = {
  title: "Đăng ký tenant pilot",
  description:
    "Trang đăng ký beta cho tổ chức muốn thử nghiệm Polyglot AI Academy trong giai đoạn pilot.",
  alternates: {
    canonical: absoluteUrl("/register"),
  },
  openGraph: {
    title: "Đăng ký tenant pilot | Polyglot AI Academy",
    url: absoluteUrl("/register"),
    images: ["/og-image.svg"],
  },
};

export default function RegisterPage() {
  return (
    <BetaPageShell
      badge="Tenant pilot"
      title="Đăng ký pilot đang được xử lý thủ công."
      description="Bản public beta chưa mở self-serve signup. Tổ chức muốn thử nghiệm sẽ được onboarding qua checklist tenant, dữ liệu học tập mẫu và cấu hình quyền truy cập."
      icon={Building2}
      primaryCta={{ label: "Xem demo speaking", href: "/demo-speaking" }}
      secondaryCta={{ label: "Quay về trang chủ", href: "/" }}
      asideTitle="Pilot readiness"
      asideCopy="Trang này giữ CTA public hoạt động trong khi đội ngũ chuẩn bị luồng đăng ký đầy đủ cho tenant thật."
      points={[
        {
          title: "Phù hợp tổ chức",
          copy: "Thiết kế cho trường học, trung tâm và nhóm L&D cần kiểm soát learner, cohort và assignment.",
        },
        {
          title: "Onboarding có kiểm soát",
          copy: "Tenant, vai trò và dữ liệu mẫu cần được xác nhận trước khi cấp quyền.",
        },
        {
          title: "Không thu thập dữ liệu nhạy cảm",
          copy: "Trang beta này không có form nhập thông tin cá nhân hoặc thanh toán.",
        },
      ]}
    />
  );
}
