"use client";

import { useSyncExternalStore } from "react";

export type ThemeId = "default" | "tra-dao" | "thuy-mac" | "hello-kitty";

function readTheme(): ThemeId {
  if (typeof document === "undefined") return "default";
  const t = document.documentElement.getAttribute("data-theme");
  if (t === "tra-dao" || t === "thuy-mac" || t === "hello-kitty") return t;
  return "default";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener("app-theme-change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("app-theme-change", onChange);
    observer.disconnect();
  };
}

/**
 * Full-screen, fixed "scene" background that changes with the active theme.
 *
 * Architecture (shared by every theme):
 *   1. base gradient        — deepest color field
 *   2. fog / light glow      — soft radial light for depth
 *   3. moving objects        — SVG actors (koi, leaves, clouds…)
 *   4. extra effects         — particles, ripples, steam
 *   5. readability mask      — gradient overlay keeping content legible
 *
 * Purely decorative: pointer-events disabled, hidden from assistive tech.
 * Scenes cross-fade when the theme changes; honours prefers-reduced-motion.
 */
export function ThemeBackground() {
  const theme = useSyncExternalStore<ThemeId>(subscribe, readTheme, () => "default");

  return (
    <div className="scene" data-scene={theme} aria-hidden="true">
      {theme === "default" && <JadeScene />}
      {theme === "tra-dao" && <TeaScene />}
      {theme === "thuy-mac" && <InkScene />}
      {theme === "hello-kitty" && <KittyScene />}
      <div className="scene-mask" />
    </div>
  );
}

/* ============================================================= */
/*  Ngọc Lục — jade / bamboo / deep forest                       */
/* ============================================================= */
function JadeScene() {
  return (
    <div className="scene-stack scene-jade">
      <div className="scene-base" />
      <div className="scene-glow scene-glow-jade" />
      <BambooLeaves />
      <div className="scene-dust" />
    </div>
  );
}

function BambooLeaves() {
  const leaves = [
    { left: "12%", delay: "0s", dur: "17s", scale: 1, hue: 0 },
    { left: "28%", delay: "5s", dur: "21s", scale: 0.7, hue: 8 },
    { left: "47%", delay: "11s", dur: "19s", scale: 0.9, hue: -6 },
    { left: "66%", delay: "3s", dur: "23s", scale: 0.8, hue: 4 },
    { left: "84%", delay: "8s", dur: "18s", scale: 1.05, hue: -3 },
  ];
  return (
    <div className="layer layer-leaves">
      {leaves.map((l, i) => (
        <span
          key={i}
          className="bamboo-leaf"
          style={{
            left: l.left,
            animationDelay: l.delay,
            animationDuration: l.dur,
            ["--s" as string]: l.scale,
            ["--h" as string]: `${l.hue}deg`,
          }}
        >
          <LeafSvg />
        </span>
      ))}
    </div>
  );
}

function LeafSvg() {
  return (
    <svg viewBox="0 0 48 18" className="leaf-svg">
      <path d="M1 9 C14 1 34 1 47 9 C34 17 14 17 1 9 Z" fill="currentColor" opacity="0.85" />
      <path d="M3 9 H45" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

/* ============================================================= */
/*  Trà Đạo — tea ceremony, warm zen                             */
/* ============================================================= */
function TeaScene() {
  const leaves = [
    { left: "62%", delay: "0s", dur: "16s", scale: 0.8 },
    { left: "78%", delay: "6s", dur: "20s", scale: 1 },
    { left: "88%", delay: "11s", dur: "18s", scale: 0.65 },
  ];
  const ripples = [{ delay: "0s" }, { delay: "2.6s" }, { delay: "5.2s" }];
  return (
    <div className="scene-stack scene-tea">
      <div className="scene-base" />
      <div className="scene-glow scene-glow-tea" />

      {/* steam rising from a warm cup, lower-left */}
      <div className="tea-cup">
        <span className="tea-steam" style={{ left: "8px", animationDelay: "0s" }} />
        <span className="tea-steam" style={{ left: "20px", animationDelay: "1.8s" }} />
        <span className="tea-steam" style={{ left: "32px", animationDelay: "0.9s" }} />
      </div>

      {/* ripple rings, like the surface of tea */}
      <div className="tea-ripples">
        {ripples.map((r, i) => (
          <span key={i} className="tea-ripple" style={{ animationDelay: r.delay }} />
        ))}
      </div>

      <div className="layer layer-tea-leaves">
        {leaves.map((l, i) => (
          <span
            key={i}
            className="tea-leaf"
            style={{
              left: l.left,
              animationDelay: l.delay,
              animationDuration: l.dur,
              ["--s" as string]: l.scale,
            }}
          >
            <LeafSvg />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================= */
/*  Thủy Mặc — Chinese ink wash, mountains, koi, yin-yang         */
/* ============================================================= */
function InkScene() {
  const koi = [
    { orbit: 0, dur: "34s", scale: 1, delay: "0s" },
    { orbit: 1, dur: "44s", scale: 0.72, delay: "-12s" },
  ];
  return (
    <div className="scene-stack scene-ink">
      <div className="scene-base scene-base-ink" />
      <div className="scene-glow scene-glow-ink" />

      {/* distant mountains, layered for depth */}
      <InkMountains />

      {/* faint yin-yang watermark, slowly breathing */}
      <div className="ink-yinyang">
        <YinYang />
      </div>

      {/* ink ripples on the water */}
      <div className="ink-ripples">
        <span className="ink-ripple" style={{ animationDelay: "0s" }} />
        <span className="ink-ripple" style={{ animationDelay: "3s" }} />
        <span className="ink-ripple" style={{ animationDelay: "6s" }} />
      </div>

      {/* two koi circling around the yin-yang */}
      <div className="koi-field">
        {koi.map((k, i) => (
          <span
            key={i}
            className={`koi-orbit koi-orbit-${k.orbit}`}
            style={{ animationDuration: k.dur, animationDelay: k.delay }}
          >
            <span className="koi-body" style={{ ["--s" as string]: k.scale }}>
              <Koi dark={i === 0} />
            </span>
          </span>
        ))}
      </div>

      {/* drifting ink mist */}
      <span className="ink-mist ink-mist-1" />
      <span className="ink-mist ink-mist-2" />
    </div>
  );
}

function InkMountains() {
  return (
    <svg className="ink-mountains" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice">
      <path
        className="ink-mtn ink-mtn-far"
        d="M0 360 C160 250 280 300 420 240 C560 180 700 280 880 220 C1040 168 1200 250 1440 200 L1440 420 L0 420 Z"
      />
      <path
        className="ink-mtn ink-mtn-mid"
        d="M0 400 C200 320 360 360 520 300 C700 234 860 330 1040 286 C1220 244 1340 320 1440 300 L1440 420 L0 420 Z"
      />
    </svg>
  );
}

function YinYang() {
  return (
    <svg viewBox="0 0 100 100" className="yinyang-svg">
      <defs>
        <clipPath id="yyClipScene">
          <circle cx="50" cy="50" r="49" />
        </clipPath>
      </defs>
      <g clipPath="url(#yyClipScene)">
        <circle cx="50" cy="50" r="49" fill="var(--ink-soft)" />
        <path
          d="M50 1 a49 49 0 0 1 0 98 a24.5 24.5 0 0 1 0-49 a24.5 24.5 0 0 0 0-49 z"
          fill="var(--ink-strong)"
        />
        <circle cx="50" cy="25.5" r="7.5" fill="var(--ink-strong)" />
        <circle cx="50" cy="74.5" r="7.5" fill="var(--ink-soft)" />
        <circle cx="50" cy="25.5" r="2.4" fill="var(--ink-soft)" />
        <circle cx="50" cy="74.5" r="2.4" fill="var(--ink-strong)" />
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="var(--ink-strong)" strokeWidth="0.5" />
    </svg>
  );
}

function Koi({ dark }: { dark: boolean }) {
  const fill = dark ? "var(--ink-strong)" : "var(--ink-soft)";
  const stroke = dark ? "var(--ink-soft)" : "var(--ink-strong)";
  return (
    <svg viewBox="0 0 96 34" className="koi-svg">
      <path d="M10 17 C30 4 60 4 74 17 C60 30 30 30 10 17 Z" fill={fill} opacity="0.9" />
      <path d="M74 17 L94 6 L87 17 L94 28 Z" fill={fill} opacity="0.7" />
      <path d="M40 6 L49 1 L53 8 Z" fill={fill} opacity="0.55" />
      <circle cx="22" cy="15" r="1.9" fill={stroke} />
    </svg>
  );
}

/* ============================================================= */
/*  Hello Kitty — kawaii pastel, modern                          */
/* ============================================================= */
function KittyScene() {
  const clouds = [
    { top: "14%", dur: "60s", delay: "0s", scale: 1, op: 0.5 },
    { top: "30%", dur: "80s", delay: "-30s", scale: 0.7, op: 0.4 },
    { top: "52%", dur: "70s", delay: "-50s", scale: 0.9, op: 0.35 },
  ];
  const floats = [
    { left: "14%", delay: "0s", dur: "18s", icon: "ribbon", scale: 1 },
    { left: "30%", delay: "6s", dur: "22s", icon: "heart", scale: 0.7 },
    { left: "50%", delay: "3s", dur: "20s", icon: "ribbon", scale: 0.85 },
    { left: "68%", delay: "9s", dur: "24s", icon: "heart", scale: 0.9 },
    { left: "86%", delay: "5s", dur: "19s", icon: "ribbon", scale: 0.65 },
  ];
  return (
    <div className="scene-stack scene-kitty">
      <div className="scene-base" />
      <div className="scene-glow scene-glow-kitty" />

      {clouds.map((c, i) => (
        <span
          key={`cloud-${i}`}
          className="kitty-cloud"
          style={{
            top: c.top,
            animationDuration: c.dur,
            animationDelay: c.delay,
            ["--s" as string]: c.scale,
            ["--op" as string]: c.op,
          }}
        >
          <CloudSvg />
        </span>
      ))}

      <div className="layer layer-kitty-floats">
        {floats.map((f, i) => (
          <span
            key={`f-${i}`}
            className="kitty-float"
            style={{
              left: f.left,
              animationDelay: f.delay,
              animationDuration: f.dur,
              ["--s" as string]: f.scale,
            }}
          >
            {f.icon === "ribbon" ? <RibbonSvg /> : <HeartSvg />}
          </span>
        ))}
      </div>

      <div className="kitty-sparkles">
        {[
          { top: "20%", left: "32%", delay: "0s" },
          { top: "44%", left: "72%", delay: "1.3s" },
          { top: "64%", left: "18%", delay: "0.7s" },
          { top: "34%", left: "54%", delay: "2.1s" },
        ].map((s, i) => (
          <span
            key={`sp-${i}`}
            className="kitty-sparkle"
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </div>
    </div>
  );
}

function CloudSvg() {
  return (
    <svg viewBox="0 0 120 56" className="cloud-svg">
      <path
        d="M28 44 C12 44 6 30 18 24 C18 10 38 8 44 20 C50 8 74 8 78 22 C94 18 104 32 96 42 C96 44 92 44 90 44 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RibbonSvg() {
  return (
    <svg viewBox="0 0 40 28" className="ribbon-svg">
      <path d="M20 14 L4 4 C1 2 1 24 4 22 Z" fill="currentColor" />
      <path d="M20 14 L36 4 C39 2 39 24 36 22 Z" fill="currentColor" />
      <circle cx="20" cy="14" r="4.5" fill="currentColor" />
    </svg>
  );
}

function HeartSvg() {
  return (
    <svg viewBox="0 0 32 30" className="heart-svg">
      <path
        d="M16 28 C2 18 2 6 10 6 C14 6 16 10 16 10 C16 10 18 6 22 6 C30 6 30 18 16 28 Z"
        fill="currentColor"
      />
    </svg>
  );
}
