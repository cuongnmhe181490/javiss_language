import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Polyglot AI Academy",
    template: "%s | Polyglot AI Academy",
  },
  description:
    "Nền tảng học tiếng Anh, Trung, Nhật, Hàn bằng AI tutor, speaking realtime và dữ liệu học tập có kiểm chứng.",
  openGraph: {
    title: "Polyglot AI Academy",
    description: "AI tutor, speaking coach và learning OS cho người học ngôn ngữ nghiêm túc.",
    url: "/",
    siteName: "Polyglot AI Academy",
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
