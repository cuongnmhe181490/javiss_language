import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AppToaster } from "@/components/shared/toaster";
import { vi } from "@/i18n/dictionaries/vi";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: vi.appName,
  description: "Nền tảng luyện thi ngôn ngữ bằng AI với quy trình duyệt tài khoản có kiểm soát.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${manrope.variable} ${plexMono.variable} min-h-screen font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
