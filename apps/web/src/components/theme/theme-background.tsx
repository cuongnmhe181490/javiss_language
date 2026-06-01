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
  // Each koi wanders along its own meandering closed path. rotate="auto"
  // orients the head along the direction of travel; a nested tail wiggle and
  // body sway make the motion read as natural swimming, never a spinner.
  const koi = [
    {
      id: "a",
      tint: "strong",
      scale: 1,
      dur: 58,
      opacity: 0.82,
      path: "M180 640 C520 720 920 560 1200 612 C1360 642 1372 392 1040 388 C720 384 420 470 250 528 C70 590 60 580 180 640 Z",
    },
    {
      id: "b",
      tint: "soft",
      scale: 0.62,
      dur: 74,
      opacity: 0.6,
      path: "M1120 230 C820 150 520 250 380 312 C250 370 190 220 470 188 C820 150 980 150 1120 196 C1260 240 1300 300 1120 230 Z",
    },
    {
      id: "c",
      tint: "cold",
      scale: 0.78,
      dur: 92,
      opacity: 0.4,
      path: "M620 470 C840 520 980 430 900 360 C820 292 600 330 520 392 C452 444 420 430 620 470 Z",
    },
  ];

  return (
    <div className="scene-stack scene-ink">
      {/* 1. deep ink base */}
      <div className="scene-base scene-base-ink" />
      {/* 2. paper grain + ink bleed texture */}
      <div className="ink-texture" />
      <div className="ink-bleed" />
      {/* 3. soft light + drifting mist */}
      <div className="scene-glow scene-glow-ink" />
      <span className="ink-mist ink-mist-1" />
      <span className="ink-mist ink-mist-2" />
      {/* 4. distant mountains for depth */}
      <InkMountains />
      {/* large, faint yin-yang watermark, off-center, static */}
      <div className="ink-yinyang-watermark">
        <YinYang />
      </div>
      {/* 5. water surface ripples, very subtle */}
      <div className="ink-water">
        <span className="ink-ripple" style={{ left: "26%", top: "70%", animationDelay: "0s" }} />
        <span className="ink-ripple" style={{ left: "64%", top: "78%", animationDelay: "4s" }} />
        <span className="ink-ripple" style={{ left: "44%", top: "84%", animationDelay: "8s" }} />
      </div>
      {/* 6. koi swimming through the ink water */}
      <svg
        className="koi-canvas"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
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
      <circle cx="50" cy="50" r="49" fill="none" stroke="var(--ink-strong)" strokeWidth="0.5" />
    </svg>
  );
}

type KoiTint = "strong" | "soft" | "cold";

/**
 * A single ink-wash koi that swims along `path`. The group follows the path
 * via SVG animateMotion with rotate="auto" (head leads, body banks into the
 * curve). The tail and pectoral fins wiggle on their own slow oscillation so
 * the fish looks alive rather than rigidly translated.
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
  const fill =
    tint === "strong"
      ? "var(--ink-strong)"
      : tint === "cold"
        ? "var(--ink-cold)"
        : "var(--ink-mid)";
  const eye = tint === "strong" ? "var(--ink-soft)" : "var(--ink-strong)";

  return (
    <g className="koi" opacity={opacity}>
      <g transform={`scale(${scale})`} className="koi-inner">
        {/* tail — wiggles around the body/tail joint near x = -34 */}
        <g>
          <path
            d="M-34 0 C-52 -10 -64 -18 -78 -20 C-70 -10 -70 10 -78 20 C-64 18 -52 10 -34 0 Z"
            fill={fill}
            opacity="0.55"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-9 -34 0; 9 -34 0; -9 -34 0"
            dur="2.4s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;0.5;1"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          />
        </g>

        {/* dorsal fin */}
        <path d="M2 -13 C10 -22 18 -22 22 -14 C14 -12 8 -12 2 -13 Z" fill={fill} opacity="0.5" />

        {/* pectoral fin — gentle flutter */}
        <g>
          <path d="M6 6 C0 18 -10 22 -16 18 C-10 12 -6 8 -2 5 Z" fill={fill} opacity="0.45" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-6 4 4; 8 4 4; -6 4 4"
            dur="2.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;0.5;1"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          />
        </g>

        {/* body — almond shape, head at +x */}
        <path d="M-36 0 C-16 -15 30 -13 46 0 C30 13 -16 15 -36 0 Z" fill={fill} opacity="0.92" />
        {/* subtle ink shading along the back */}
        <path d="M-30 -3 C-10 -12 26 -10 42 -1 C24 -6 -8 -7 -30 -3 Z" fill={eye} opacity="0.12" />
        {/* eye near the head */}
        <circle cx="34" cy="-2" r="2.1" fill={eye} />
      </g>

      {/* drive the whole koi along its meandering path */}
      <animateMotion
        dur={`${dur}s`}
        repeatCount="indefinite"
        rotate="auto"
        path={path}
        calcMode="spline"
        keyTimes="0;0.5;1"
        keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
      />
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
