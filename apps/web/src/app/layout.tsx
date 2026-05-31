import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { SkipLink } from "@/components/ui/skip-link";
import { absoluteUrl, resolveSiteUrl } from "@/lib/site-url";
import { isClerkConfigured } from "@/lib/auth";
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
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "Học ngoại ngữ cùng AI",
    template: "%s | Học ngoại ngữ cùng AI",
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
    title: "Học ngoại ngữ cùng AI",
    description: socialDescription,
    url: absoluteUrl("/"),
    siteName: "Học ngoại ngữ cùng AI",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Học ngoại ngữ cùng AI",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Học ngoại ngữ cùng AI",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('app-theme');if(t&&t!=='default')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <AuthBoundary>
          <SkipLink />
          <AppProviders>{children}</AppProviders>
        </AuthBoundary>
      </body>
    </html>
  );
}

/**
 * Wraps the app in Clerk's provider only when Clerk is configured with a real
 * publishable key. Without it the app runs in keyless demo mode so it can build
 * and start without third-party credentials.
 */
function AuthBoundary({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          card: "rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl",
          formButtonPrimary: "rounded-xl bg-primary hover:opacity-90",
          formFieldInput: "h-11 rounded-xl bg-accent/50 border-border/50",
          footerActionLink: "text-primary hover:underline",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
