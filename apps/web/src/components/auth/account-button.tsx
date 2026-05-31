"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { isClerkConfigured } from "@/lib/auth";

/**
 * Renders Clerk's account menu when auth is configured. In keyless demo mode it
 * falls back to a simple login link so the dashboard still renders.
 */
export function AccountButton() {
  if (!isClerkConfigured()) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <LogIn className="size-4" aria-hidden="true" />
        Đăng nhập
      </Link>
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "size-8",
        },
      }}
    />
  );
}
