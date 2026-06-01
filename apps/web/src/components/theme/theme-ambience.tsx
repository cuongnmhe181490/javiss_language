"use client";

import { useSyncExternalStore } from "react";

type ThemeId = "default" | "tra-dao" | "thuy-mac" | "hello-kitty";

function readTheme(): ThemeId {
  if (typeof document === "undefined") return "default";
  const t = document.documentElement.getAttribute("data-theme");
  if (t === "tra-dao" || t === "thuy-mac" || t === "hello-kitty") return t;
  return "default";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener("app-theme-change", onChange);
  // Also observe direct attribute changes (e.g. initial boot script).
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
 * Full-screen animated decorative layer that changes with the active theme.
 * Purely cosmetic: fixed behind content, ignores pointer events.
 */
export function ThemeAmbience() {
  const theme = useSyncExternalStore<ThemeId>(subscribe, readTheme, () => "default");

  return (
    <div className="ambience" aria-hidden="true">
      {theme === "default" && <JadeAmbience />}
      {theme === "tra-dao" && <TeaAmbience />}
      {theme === "thuy-mac" && <InkAmbience />}
      {theme === "hello-kitty" && <KittyAmbience />}
    </div>
  );
}

/* ---------- Ngọc Lục: drifting jade orbs ---------- */
function JadeAmbience() {
  const orbs = [
    { top: "12%", left: "8%", size: 320, delay: "0s", dur: "16s" },
    { top: "55%", left: "70%", size: 380, delay: "3s", dur: "20s" },
    { top: "78%", left: "20%", size: 260, delay: "6s", dur: "18s" },
  ];
  return (
    <>
      <div className="amb-base amb-base-jade" />
      {orbs.map((o, i) => (
        <span
          key={i}
          className="amb-orb"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
            animationDelay: o.delay,
            animationDuration: o.dur,
          }}
        />
      ))}
    </>
  );
}

/* ---------- Trà Đạo: rising steam + falling leaves ---------- */
function TeaAmbience() {
  const steams = [
    { left: "18%", delay: "0s", dur: "7s" },
    { left: "22%", delay: "2.5s", dur: "8s" },
    { left: "26%", delay: "1.2s", dur: "6.5s" },
  ];
  const leaves = [
    { left: "70%", delay: "0s", dur: "13s" },
    { left: "82%", delay: "4s", dur: "16s" },
    { left: "60%", delay: "8s", dur: "15s" },
  ];
  return (
    <>
      <div className="amb-base amb-base-tea" />
      {/* tea cup steam, anchored near bottom-left */}
      <div className="amb-teacup">
        {steams.map((s, i) => (
          <span
            key={i}
            className="amb-steam"
            style={{ left: s.left, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}
      </div>
      {leaves.map((l, i) => (
        <span
          key={i}
          className="amb-leaf"
          style={{ left: l.left, animationDelay: l.delay, animationDuration: l.dur }}
        >
          🍃
        </span>
      ))}
    </>
  );
}

/* ---------- Thủy Mặc: yin-yang + swimming koi + ink clouds ---------- */
function InkAmbience() {
  const koi = [
    { bottom: "9%", delay: "0s", dur: "26s", scale: 1 },
    { bottom: "18%", delay: "8s", dur: "32s", scale: 0.7 },
    { bottom: "26%", delay: "15s", dur: "38s", scale: 0.85 },
  ];
  const clouds = [
    { top: "10%", delay: "0s", dur: "40s", scale: 1 },
    { top: "24%", delay: "14s", dur: "52s", scale: 0.8 },
  ];
  return (
    <>
      <div className="amb-base amb-base-ink" />

      {clouds.map((c, i) => (
        <span
          key={`cloud-${i}`}
          className="amb-cloud"
          style={{
            top: c.top,
            animationDelay: c.delay,
            animationDuration: c.dur,
            transform: `scale(${c.scale})`,
          }}
        />
      ))}

      {/* Yin-yang (cá âm dương) medallion, slowly rotating near the bottom */}
      <div className="amb-yinyang" aria-hidden="true">
        <YinYangKoi />
      </div>

      {koi.map((k, i) => (
        <span
          key={`koi-${i}`}
          className="amb-koi"
          style={{
            bottom: k.bottom,
            animationDelay: k.delay,
            animationDuration: k.dur,
            ["--koi-scale" as string]: k.scale,
          }}
        >
          <Koi />
        </span>
      ))}
    </>
  );
}

function YinYangKoi() {
  return (
    <svg viewBox="0 0 100 100" className="amb-yinyang-svg">
      <defs>
        <clipPath id="yyClip">
          <circle cx="50" cy="50" r="49" />
        </clipPath>
      </defs>
      <g clipPath="url(#yyClip)">
        <circle cx="50" cy="50" r="49" fill="var(--amb-ink-light)" />
        <path
          d="M50 1 a49 49 0 0 1 0 98 a24.5 24.5 0 0 1 0-49 a24.5 24.5 0 0 0 0-49 z"
          fill="var(--amb-ink-dark)"
        />
        <circle cx="50" cy="25.5" r="7.5" fill="var(--amb-ink-dark)" />
        <circle cx="50" cy="74.5" r="7.5" fill="var(--amb-ink-light)" />
        {/* koi eyes */}
        <circle cx="50" cy="25.5" r="2.4" fill="var(--amb-ink-light)" />
        <circle cx="50" cy="74.5" r="2.4" fill="var(--amb-ink-dark)" />
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="var(--amb-ink-dark)" strokeWidth="0.6" />
    </svg>
  );
}

function Koi() {
  return (
    <svg viewBox="0 0 90 32" className="amb-koi-svg">
      {/* body */}
      <path
        d="M8 16 C26 4 54 4 68 16 C54 28 26 28 8 16 Z"
        fill="var(--amb-ink-dark)"
        opacity="0.85"
      />
      {/* tail */}
      <path d="M68 16 L86 6 L80 16 L86 26 Z" fill="var(--amb-ink-dark)" opacity="0.7" />
      {/* dorsal fin */}
      <path d="M36 6 L44 1 L48 7 Z" fill="var(--amb-ink-dark)" opacity="0.6" />
      {/* eye */}
      <circle cx="20" cy="14" r="1.8" fill="var(--amb-ink-light)" />
    </svg>
  );
}

/* ---------- Hello Kitty: floating bows, hearts, sparkles ---------- */
function KittyAmbience() {
  const floats = [
    { left: "10%", delay: "0s", dur: "14s", icon: "🎀" },
    { left: "26%", delay: "5s", dur: "17s", icon: "💗" },
    { left: "44%", delay: "2s", dur: "15s", icon: "🎀" },
    { left: "62%", delay: "8s", dur: "18s", icon: "💖" },
    { left: "80%", delay: "3.5s", dur: "16s", icon: "🎀" },
    { left: "90%", delay: "10s", dur: "19s", icon: "💗" },
  ];
  const sparkles = [
    { top: "18%", left: "30%", delay: "0s" },
    { top: "40%", left: "75%", delay: "1.5s" },
    { top: "62%", left: "15%", delay: "0.8s" },
    { top: "30%", left: "55%", delay: "2.2s" },
  ];
  return (
    <>
      <div className="amb-base amb-base-kitty" />
      {floats.map((f, i) => (
        <span
          key={`float-${i}`}
          className="amb-float"
          style={{ left: f.left, animationDelay: f.delay, animationDuration: f.dur }}
        >
          {f.icon}
        </span>
      ))}
      {sparkles.map((s, i) => (
        <span
          key={`spark-${i}`}
          className="amb-twinkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        >
          ✨
        </span>
      ))}
    </>
  );
}
