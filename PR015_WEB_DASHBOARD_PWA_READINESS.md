# PR-015 Web Dashboard PWA Readiness

## Status

PR-015 status: implemented locally, not deployed.

The web app now has a beta learning-app surface while staying honest about the
current platform state: no real login, no public backend staging URL, no live AI
provider, and no API calls from the dashboard.

## Scope

Added frontend-only routes:

- `/dashboard`
- `/grammar`
- `/speaking`
- `/listening`
- `/reading`
- `/placement`
- `/curriculum`

Kept existing routes:

- `/`
- `/login`
- `/register`
- `/demo-speaking`

## Dashboard Components

Dashboard data lives in `apps/web/src/lib/demo-learning-data.ts` and is marked
as beta/demo data. The route does not call an API.

Components:

- `DashboardHero`
- `ProgressOverview`
- `ContinueLearningCard`
- `SkillProgressGrid`
- `DailyGoalCard`
- `AssignmentPreview`
- `AiTutorShortcut`
- `SpeakingShortcut`
- `AchievementStrip`
- `WeeklyPlanCard`
- `RecentActivityCard`

## Public Learning Pages

`apps/web/src/components/marketing/learning-topic-page.tsx` provides reusable
public SEO page structure for Grammar, Speaking, Listening, Reading, Placement,
and Curriculum.

Each page has title, description, canonical, Open Graph URL, OG image, and CTAs
to `/dashboard` or `/register`.

## PWA Changes

Added:

- `apps/web/src/app/manifest.ts`
- `apps/web/public/icon.svg`
- `apps/web/public/apple-icon.svg`

The manifest uses app name `Polyglot AI Academy`, short name `Polyglot AI`,
display `standalone`, start URL `/`, and theme color `#2563eb`.

## Sitemap And Robots

Added production-safe:

- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/robots.ts`

Both use the existing site URL helper and avoid localhost when
`NEXT_PUBLIC_SITE_URL` is set.

## Smoke Coverage

`apps/web/scripts/smoke-routes.mjs` now checks page routes, PWA/SEO assets,
canonical metadata, `og:image`, production-safe sitemap/robots URLs, and
security headers on a production-style server.

## Bundle Notes

No chart library or heavy dashboard dependency was added. The dashboard uses
server-rendered static data and targeted `lucide-react` icon imports. Record
the final route size from `next build` before deployment.

Build output marks `/dashboard` and all PR-015 public pages as static
prerendered routes. Local production `HEAD /dashboard` returned
`Content-Length: 114451`; this is acceptable for the beta surface, but future
charting or interactive widgets should be lazy-loaded.

## Verification

Web gates:

- `pnpm --filter @polyglot/web typecheck`: PASS
- `pnpm --filter @polyglot/web lint`: PASS
- `pnpm --filter @polyglot/web test`: PASS, 4 tests
- `NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app pnpm --filter @polyglot/web build`: PASS
- `WEB_BASE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app pnpm --filter @polyglot/web smoke:routes`: PASS

Full repo gates:

- `pnpm typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm test`: PASS, with 11 known API integration skips in the aggregate unit
  command because DB/Redis integration env was not set
- `pnpm build`: PASS
- `pnpm format:check`: PASS

Local production preview:

- `/dashboard`: `200 OK`
- `/sitemap.xml`: production URLs, no localhost
- `/robots.txt`: production sitemap URL
- `/manifest.webmanifest`: `200 OK`
- security headers remained present

## Limitations

- Dashboard uses local demo data.
- Login and register are beta-safe placeholders.
- Speaking demo is mock-only and does not request microphone access.
- Backend staging is not public.
- API integration waits for `NEXT_PUBLIC_API_BASE_URL`, OIDC staging, managed
  Postgres, and managed Redis.

## Deploy Checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the production web origin.
2. Run web quality gates.
3. Run route smoke against local production preview.
4. Review `next build` route sizes.
5. Deploy only after explicit approval.
6. Retest production routes, sitemap, robots, manifest, and metadata.

## Production Deployment Result

Redeploy date/time: 2026-05-05 01:15:16 +07:00  
Deployment URL: `https://web-krgdxf8y6-cuongnmhe181490s-projects.vercel.app`  
Production alias: `https://web-delta-azure-40.vercel.app`

Deployment status: PASS.

Pre-deploy gates:

- `pnpm --filter @polyglot/web typecheck`: PASS
- `pnpm --filter @polyglot/web lint`: PASS
- `pnpm --filter @polyglot/web test`: PASS, 4 tests
- `NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app pnpm --filter @polyglot/web build`: PASS
- `pnpm typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm test`: PASS, with 11 known API integration skips in aggregate tests
- `pnpm build`: PASS
- `pnpm format:check`: PASS

Production smoke:

- `WEB_BASE_URL=https://web-delta-azure-40.vercel.app NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app pnpm --filter @polyglot/web smoke:routes`: PASS

Route retest:

- `/`: `200 OK`
- `/login`: `200 OK`
- `/register`: `200 OK`
- `/demo-speaking`: `200 OK`
- `/dashboard`: `200 OK`
- `/grammar`: `200 OK`
- `/speaking`: `200 OK`
- `/listening`: `200 OK`
- `/reading`: `200 OK`
- `/placement`: `200 OK`
- `/curriculum`: `200 OK`

PWA/SEO asset retest:

- `/manifest.webmanifest`: `200 OK`
- `/sitemap.xml`: `200 OK`
- `/robots.txt`: `200 OK`
- `/og-image.svg`: `200 OK`
- `/icon.svg`: `200 OK`
- `/apple-icon.svg`: `200 OK`

Metadata retest:

- Production HTML for `/`, `/dashboard`, `/grammar`, and `/speaking` contains no `http://localhost:3000`.
- Canonical metadata uses `https://web-delta-azure-40.vercel.app`.
- `og:url`, `og:image`, Twitter image metadata, and manifest link are present.
- Sitemap contains production URLs only.
- Robots points to `https://web-delta-azure-40.vercel.app/sitemap.xml`.

Security headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` present
- `Content-Security-Policy-Report-Only` present

Production UI/Lighthouse:

- Browser console errors: none.
- Page errors: none.
- Desktop horizontal overflow: false.
- Mobile horizontal overflow: false.
- CTA click checks passed for dashboard, register, demo speaking, placement, curriculum, grammar, speaking, listening, and reading.
- Lighthouse Performance: 94
- Lighthouse Accessibility: 91
- Lighthouse Best Practices: 100
- Lighthouse SEO: 100

Artifacts:

- `.codex/audit/pr015-production/desktop-full.png`
- `.codex/audit/pr015-production/mobile-full.png`
- `.codex/audit/pr015-production/browser-audit-result.json`
- `.codex/audit/pr015-production/lighthouse.json`

Remaining limitations:

- Dashboard uses local demo data only.
- Login/register remain beta-safe placeholders.
- Speaking remains mock/demo only until real provider and backend staging are ready.
- CSP remains Report-Only for beta.
