"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
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

const STORAGE_KEY = "app-theme";

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) || "default";
}

/** Apply the theme to the DOM only (no storage write). */
function applyThemeToDom(theme: ThemeId) {
  const root = document.documentElement;
  if (theme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/** Persist the selected theme and apply it. */
function persistTheme(theme: ThemeId) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyThemeToDom(theme);
}

/**
 * Subscribe to theme changes via the `storage` event (cross-tab) and a custom
 * `app-theme-change` event (same-tab). localStorage is an external store, so we
 * read it through useSyncExternalStore to avoid setState-in-effect and stay
 * consistent across tabs.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener("app-theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("app-theme-change", onChange);
  };
}

export function ThemeSwitcher() {
  const current = useSyncExternalStore<ThemeId>(subscribe, readStoredTheme, () => "default");

  // Keep the DOM attribute in sync with the active theme. Never writes to
  // storage here, so it cannot clobber a stored theme during hydration.
  useEffect(() => {
    applyThemeToDom(current);
  }, [current]);

  const handleSelect = useCallback((theme: ThemeId) => {
    persistTheme(theme);
    window.dispatchEvent(new Event("app-theme-change"));
  }, []);

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
          <span className="text-base" aria-hidden="true">
            {currentTheme.icon}
          </span>
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
            {current === theme.id && <span className="ml-auto text-xs text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
