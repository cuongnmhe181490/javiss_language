import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào nền tảng học ngoại ngữ cùng AI.",
  alternates: { canonical: absoluteUrl("/login") },
};

export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-4 py-16">
      <LoginForm />
    </main>
  );
}
