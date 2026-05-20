"use client";

import { SignIn } from "@clerk/nextjs";

export function LoginForm() {
  return (
    <div className="w-full max-w-sm flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-none w-full",
            headerTitle: "text-xl font-bold text-foreground",
            headerSubtitle: "text-sm text-muted-foreground",
            formButtonPrimary:
              "w-full h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90",
            formFieldInput:
              "h-11 rounded-xl bg-accent/50 border-border/50 text-foreground",
            formFieldLabel: "text-sm text-foreground",
            socialButtonsBlockButton:
              "h-11 rounded-xl border-border/50 text-foreground",
            footerActionLink: "text-primary hover:underline",
            dividerLine: "bg-border/50",
            dividerText: "text-muted-foreground",
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/register"
      />
    </div>
  );
}
