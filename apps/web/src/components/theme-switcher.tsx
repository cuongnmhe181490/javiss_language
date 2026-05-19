"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  { id: "default", label: "Ngọc Lục", icon: "🌿" },
  { id: "tra-dao", label: "Trà Đạo", icon: "🍵" },
  { id: "thuy-mac", label: "Thủy Mặc", icon: "🖌️" },
  { id: "hello-kitty", label: "Hello Kitty", icon: "🎀" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem("app-theme") as ThemeId) || "default";
}

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  if (theme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
  localStorage.setItem("app-theme", theme);
}

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeId>("default");

  useEffect(() => {
    const stored = getStoredTheme();
    setCurrent(stored);
    applyTheme(stored);
  }, []);

  function handleSelect(theme: ThemeId) {
    setCurrent(theme);
    applyTheme(theme);
  }

  const currentTheme = themes.find((t) => t.id === current) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 rounded-xl px-3 text-muted-foreground hover:text-foreground"
          aria-label="Chọn theme"
        >
          <span className="text-base" aria-hidden="true">{currentTheme.icon}</span>
          <Palette className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className={current === theme.id ? "bg-accent" : ""}
          >
            <span className="mr-2 text-base">{theme.icon}</span>
            <span>{theme.label}</span>
            {current === theme.id && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
