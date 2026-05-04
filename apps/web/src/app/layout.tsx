import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SkipLink } from "@/components/ui/skip-link";
import { absoluteUrl, resolveSiteUrl } from "@/lib/site-url";
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

const description =
  "Nền tảng học tiếng Anh, Trung, Nhật, Hàn bằng AI tutor, speaking realtime và dữ liệu học tập có kiểm chứng.";

const socialDescription =
  "AI tutor, speaking coach và learning OS cho người học ngôn ngữ nghiêm túc.";

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "Polyglot AI Academy",
    template: "%s | Polyglot AI Academy",
  },
  description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Polyglot AI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Polyglot AI Academy",
    description: socialDescription,
    url: absoluteUrl("/"),
    siteName: "Polyglot AI Academy",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Polyglot AI Academy",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polyglot AI Academy",
    description: socialDescription,
    images: ["/og-image.svg"],
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
        <SkipLink />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
