import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản học ngoại ngữ cùng AI.",
  alternates: { canonical: absoluteUrl("/register") },
};

export default function RegisterPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-4 py-16">
      <RegisterForm />
    </main>
  );
}
