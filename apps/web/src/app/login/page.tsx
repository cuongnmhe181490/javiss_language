import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import { BetaPageShell } from "@/components/marketing/beta-page-shell";

export const metadata: Metadata = {
  title: "Đăng nhập beta",
  description:
    "Cổng đăng nhập Polyglot AI Academy đang ở trạng thái beta và chỉ mở cho tenant pilot.",
  alternates: {
    canonical: absoluteUrl("/login"),
  },
  openGraph: {
    title: "Đăng nhập beta | Polyglot AI Academy",
    url: absoluteUrl("/login"),
    images: ["/og-image.svg"],
  },
};

export default function LoginPage() {
  return (
    <BetaPageShell
      badge="Beta access"
      title="Đăng nhập đang mở theo tenant pilot."
      description="Cổng đăng nhập sản phẩm thật chưa mở công khai. Nhóm pilot sẽ nhận đường dẫn SSO hoặc tài khoản thử nghiệm sau khi tenant được cấu hình."
      icon={Lock}
      primaryCta={{ label: "Xem demo speaking", href: "/demo-speaking" }}
      secondaryCta={{ label: "Quay về trang chủ", href: "/" }}
      asideTitle="Không giả lập auth production"
      asideCopy="Trang này xác nhận trạng thái beta để người dùng không rơi vào 404, đồng thời tránh tạo kỳ vọng sai về hệ thống đăng nhập chưa phát hành."
      points={[
        {
          title: "SSO theo tenant",
          copy: "OIDC, RBAC và policy theo tổ chức sẽ được bật trong giai đoạn pilot có kiểm soát.",
        },
        {
          title: "Không yêu cầu secret",
          copy: "Không có form thu thập mật khẩu hoặc token trong bản public beta này.",
        },
        {
          title: "Luồng an toàn",
          copy: "Người dùng có thể quay về landing page hoặc xem demo speaking mock.",
        },
      ]}
    />
  );
}
