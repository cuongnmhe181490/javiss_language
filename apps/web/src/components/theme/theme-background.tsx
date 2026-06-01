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
/*  Thủy Mặc — cinematic Chinese ink-wash scene with swimming koi  */
/* ============================================================= */
function InkScene() {
  // Open paths that enter from off-screen and exit off-screen, so koi glide
  // across the scene and the loop reset happens out of view (never a circle).
  // rotate="auto" keeps the head pointing along the direction of travel.
  const koi = [
    {
      id: "a",
      tint: "strong",
      scale: 1,
      dur: 48,
      opacity: 0.8,
      path: "M-280 700 C160 768 470 612 770 576 C1090 538 1380 462 1740 372",
    },
    {
      id: "b",
      tint: "cold",
      scale: 0.66,
      dur: 66,
      opacity: 0.5,
      path: "M1720 250 C1320 300 1000 248 720 332 C440 414 120 366 -280 470",
    },
    {
      id: "c",
      tint: "mid",
      scale: 0.46,
      dur: 88,
      opacity: 0.3,
      path: "M-280 520 C260 486 660 560 1000 498 C1300 444 1500 506 1740 470",
    },
  ];

  return (
    <div className="scene-stack scene-ink">
      {/* 1. deep ink base + cold depth */}
      <div className="scene-base scene-base-ink" />
      {/* 2. xuyến-chỉ paper grain */}
      <div className="ink-texture" />
      {/* 3. soft ink-bleed blooms (parallax slow) */}
      <div className="ink-bleed ink-parallax-slow" />
      {/* 4. distant mountains + faint yin-yang watermark for depth */}
      <div className="ink-far ink-parallax-slow">
        <InkMountains />
        <span className="ink-yinyang-watermark">
          <YinYang />
        </span>
      </div>
      {/* 5. ambient glow + drifting mist (parallax mid) */}
      <div className="scene-glow scene-glow-ink" />
      <span className="ink-mist ink-mist-1" />
      <span className="ink-mist ink-mist-2" />
      {/* 6. lower water surface with very subtle ripples */}
      <div className="ink-water">
        <span className="ink-ripple" style={{ left: "24%", top: "72%", animationDelay: "0s" }} />
        <span className="ink-ripple" style={{ left: "62%", top: "80%", animationDelay: "5s" }} />
        <span className="ink-ripple" style={{ left: "46%", top: "88%", animationDelay: "10s" }} />
      </div>
      {/* 7. koi gliding through the ink water */}
      <svg
        className="koi-canvas"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* brush-edge filter: roughens outlines so koi look ink-painted */}
          <filter id="koiInk" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9 0.85"
              numOctaves="1"
              seed="7"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="3.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          {/* ink wash: dense at head, lifting off toward the tail */}
          <linearGradient id="koiWash" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        {koi.map((k) => (
          <Koi
            key={k.id}
            tint={k.tint as KoiTint}
            scale={k.scale}
            dur={k.dur}
            opacity={k.opacity}
            path={k.path}
          />
        ))}
      </svg>
      {/* 8. readability vignette specific to ink scene */}
      <div className="ink-vignette" />
    </div>
  );
}

function InkMountains() {
  return (
    <svg className="ink-mountains" viewBox="0 0 1440 480" preserveAspectRatio="xMidYMax slice">
      <path
        className="ink-mtn ink-mtn-far"
        d="M0 360 C160 250 280 300 420 240 C560 180 700 280 880 220 C1040 168 1200 250 1440 200 L1440 480 L0 480 Z"
      />
      <path
        className="ink-mtn ink-mtn-mid"
        d="M0 420 C200 330 360 380 520 320 C700 250 860 350 1040 300 C1220 256 1340 336 1440 312 L1440 480 L0 480 Z"
      />
      <path
        className="ink-mtn ink-mtn-near"
        d="M0 470 C240 410 420 446 600 414 C820 374 980 446 1180 410 C1320 386 1400 420 1440 410 L1440 480 L0 480 Z"
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
    </svg>
  );
}

type KoiTint = "strong" | "soft" | "cold" | "mid";

/**
 * A single ink-wash koi, seen from above, gliding along `path`.
 * - animateMotion + rotate="auto": the head always leads the direction.
 * - the brush filter roughens the silhouette so it reads as painted ink.
 * - tail and pectoral fins oscillate; the whole body sways gently.
 * It is NOT a rotating object: it translates across the scene and exits.
 */
function Koi({
  tint,
  scale,
  dur,
  opacity,
  path,
}: {
  tint: KoiTint;
  scale: number;
  dur: number;
  opacity: number;
  path: string;
}) {
  const color =
    tint === "strong"
      ? "var(--ink-strong)"
      : tint === "cold"
        ? "var(--ink-cold)"
        : tint === "mid"
          ? "var(--ink-mid)"
          : "var(--ink-soft)";

  return (
    <g className="koi" opacity={opacity} style={{ color }}>
      <g
        className="koi-swim"
        style={{ ["--koi-path" as string]: `path("${path}")`, ["--koi-dur" as string]: `${dur}s` }}
      >
        <g filter="url(#koiInk)" className="koi-inner">
          <g transform={`scale(${scale})`}>
            {/* flowing tail — trailing ribbon that sways */}
            <g className="koi-tail">
              <path
                d="M-22 0 C-44 -7 -66 -20 -86 -16 C-72 -8 -72 8 -86 16 C-66 20 -44 7 -22 0 Z"
                fill="url(#koiWash)"
                opacity="0.7"
              />
            </g>

            {/* pectoral fins */}
            <g className="koi-fin">
              <path
                d="M8 7 C2 19 -10 24 -18 20 C-10 13 -4 9 0 6 Z"
                fill="currentColor"
                opacity="0.4"
              />
            </g>
            <path
              d="M8 -7 C2 -19 -10 -24 -18 -20 C-10 -13 -4 -9 0 -6 Z"
              fill="currentColor"
              opacity="0.3"
            />

            {/* body — elongated almond, head at +x */}
            <path
              d="M50 0 C40 -15 8 -19 -22 -15 C-34 -13 -34 13 -22 15 C8 19 40 15 50 0 Z"
              fill="url(#koiWash)"
            />
            {/* spine accent */}
            <path
              d="M44 0 C34 -6 6 -8 -18 -6 C6 -3 34 -3 44 0 Z"
              fill="currentColor"
              opacity="0.25"
            />
            {/* eye near the head */}
            <circle cx="38" cy="-3" r="1.8" fill="var(--ink-soft)" opacity="0.85" />
          </g>
        </g>
      </g>
    </g>
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
