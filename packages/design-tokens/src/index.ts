export const colors = {
  background: "oklch(0.985 0.003 247)",
  foreground: "oklch(0.18 0.015 250)",
  ink: "oklch(0.22 0.022 255)",
  paper: "oklch(0.98 0.006 90)",
  mist: "oklch(0.93 0.014 230)",
  jade: "oklch(0.62 0.12 170)",
  indigo: "oklch(0.48 0.16 265)",
  coral: "oklch(0.68 0.14 35)",
  gold: "oklch(0.78 0.12 82)",
  danger: "oklch(0.58 0.2 25)",
  success: "oklch(0.62 0.15 150)",
} as const;

export const typography = {
  fontSans: '"Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif',
  fontMono: '"Geist Mono", "Geist Mono Fallback", ui-monospace, monospace',
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const radius = {
  xs: "0.25rem",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.625rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

export const shadow = {
  soft: "0 24px 80px -40px rgb(15 23 42 / 0.35)",
  panel: "0 18px 48px -30px rgb(15 23 42 / 0.4)",
  focus: "0 0 0 3px rgb(96 165 250 / 0.35)",
} as const;

export const glass = {
  subtle:
    "color-mix(in oklab, var(--background) 78%, transparent); backdrop-filter: blur(18px) saturate(1.25);",
  strong:
    "color-mix(in oklab, var(--background) 64%, transparent); backdrop-filter: blur(28px) saturate(1.35);",
} as const;

export const designTokens = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  glass,
} as const;

export type DesignTokens = typeof designTokens;
