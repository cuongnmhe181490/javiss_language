# Deployment UI/UX Audit

Audit date: 2026-05-01  
URL tested: https://web-delta-azure-40.vercel.app  
Vercel project: `cuongnmhe181490s-projects/web`  
Latest ready deployment from `vercel ls`: `https://web-ooo5mgark-cuongnmhe181490s-projects.vercel.app`  
Production alias: `https://web-delta-azure-40.vercel.app`

## Status

Production site is reachable.

`curl -I https://web-delta-azure-40.vercel.app`:

- Status: `200 OK`
- Content-Type: `text/html; charset=utf-8`
- Content-Length: `41833`
- Cache-Control: `public, max-age=0, must-revalidate`
- X-Vercel-Cache: `HIT`
- X-Nextjs-Prerender: `1`
- Strict-Transport-Security: `max-age=63072000; includeSubDomains; preload`
- Server: `Vercel`
- No redirect observed for the tested URL.

`curl -L https://web-delta-azure-40.vercel.app` returned rendered HTML for the homepage.

## Screenshots

Generated with Playwright Chromium:

- Desktop full page: `.codex/audit/desktop-full.png`
- Mobile full page: `.codex/audit/mobile-full.png`
- Lighthouse JSON: `.codex/audit/lighthouse.json`
- Browser audit JSON: `.codex/audit/audit-result.json`

## Scores

UI/UX score: 7/10

The landing page looks polished on desktop and mobile, with no horizontal overflow and good visual hierarchy. The main UX issue is that primary CTAs lead to 404 pages.

Lighthouse scores:

- Performance: 97
- Accessibility: 91
- Best Practices: 96
- SEO: 100

Measured Lighthouse metrics:

- First Contentful Paint: 1.0 s
- Largest Contentful Paint: 2.7 s
- Speed Index: 1.9 s
- Total Blocking Time: 40 ms
- Cumulative Layout Shift: 0
- Total byte weight: 359 KiB

## Routing

Broken routes found from visible links:

- `/login` returns `404 Not Found`
- `/register` returns `404 Not Found`
- `/demo-speaking` returns `404 Not Found`

Working routes:

- `/` returns `200 OK`
- Hash navigation links `#languages`, `#product`, `#trust` work on the homepage.

## Console Errors

Playwright captured three browser console errors:

- `Failed to load resource: the server responded with a status of 404 ()`
- These correspond to the broken CTA routes above.

No uncaught page exceptions were captured.

## UI/UX Notes

Strengths:

- Desktop layout is balanced and visually coherent.
- Mobile layout stacks cleanly with no horizontal overflow.
- Vietnamese copy renders correctly in the deployed browser HTML.
- Header stays compact and usable.
- Main content sections are easy to scan.

Issues:

- Primary conversion actions are broken because `/register` and `/demo-speaking` 404.
- `/login` is shown as a real action but has no route.
- The final CTA repeats `/register`, so the same broken route appears multiple times.
- No footer is present, so there is no persistent place for legal, contact, privacy, or support links.
- Hero is decorative UI only; there is no actual product media or screenshot asset.

## SEO Metadata

Detected:

- `html lang="vi"`
- Title: `Polyglot AI Academy`
- Description exists.
- Robots: `index, follow`
- One H1: `Polyglot AI Academy`
- OpenGraph title and description exist.
- Twitter card exists.

Issues:

- `metadataBase` resolves OpenGraph URL to `http://localhost:3000`.
- `og:url` is wrong for production: `http://localhost:3000`.
- No canonical URL.
- No `og:image`.
- Twitter metadata has no image.

## Accessibility

Automated checks:

- Images without alt: 0
- Buttons without accessible name: 0
- Links without accessible name: 0
- Main landmark: 1
- Header landmark: 1
- Nav landmark: 1
- Footer landmark: 0
- No sampled text contrast below 4.5:1 in the browser audit.

Issues:

- Missing footer landmark.
- Animated hero/report widgets do not expose meaningful semantic structure beyond decorative text.
- Progress bars use indeterminate state while visually presenting numeric values, which can be confusing for assistive tech.
- No skip link for keyboard users.

## Mobile

Mobile viewport tested: 390 x 844.

Result:

- No horizontal overflow.
- Header height: 65 px.
- Main content is readable.
- CTA buttons stack correctly.

Issues:

- Header only shows brand and primary CTA; login disappears on small screens. This may be acceptable, but it should be intentional.
- Hero product mockup is tall and pushes subsequent content far down the page.
- The final CTA heading wraps heavily on mobile.

## Performance

Browser resource summary:

- DOMContentLoaded: 622 ms
- Load event: 627 ms
- Transfer size from browser resource timing: 354 KiB
- Script resources: 9
- Script transfer: 241 KiB
- CSS transfer: 83 KiB

Issues:

- LCP is acceptable but not excellent at 2.7 s.
- Framer Motion is loaded for the landing page, increasing client JS for mostly static marketing content.
- The homepage is a client component, so static content ships more JavaScript than necessary.

## Security Headers

Present:

- `Strict-Transport-Security`
- `Access-Control-Allow-Origin: *`

Missing or not observed on the tested response:

- `Content-Security-Policy`
- `X-Frame-Options` or CSP `frame-ancestors`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`

Note: `Access-Control-Allow-Origin: *` is acceptable for static public pages, but should be reviewed before adding authenticated/API behavior.

## Top 10 Fixes

1. Add real routes for `/login`, `/register`, and `/demo-speaking`, or change CTAs to valid anchors until those pages exist.
2. Replace `metadataBase: http://localhost:3000` with the production domain.
3. Add a canonical URL for the homepage.
4. Add `og:image` and Twitter image metadata.
5. Add baseline security headers in `next.config.ts`.
6. Add a footer landmark with privacy, terms, contact, and support links.
7. Convert static marketing sections to server components where possible; isolate only animated widgets as client components.
8. Review progress bar accessibility: expose determinate values or mark decorative progress as hidden.
9. Add a skip-to-content link for keyboard users.
10. Add a deployment smoke test that checks all rendered internal links return non-404 statuses.

## Exact Files To Fix

- `apps/web/src/components/marketing/home-page.tsx`
  - Lines 120, 123, 159, 165, 408 contain links to missing routes.
  - Same file should receive a footer or link changes if those pages are not planned yet.

- `apps/web/src/app/layout.tsx`
  - Line 17 sets `metadataBase` to `http://localhost:3000`.
  - Metadata block needs canonical, OpenGraph image, and Twitter image.

- `apps/web/next.config.ts`
  - Add security headers with `headers()`.

- `apps/web/src/app/login/page.tsx`
  - Create only if login should be live.

- `apps/web/src/app/register/page.tsx`
  - Create only if registration should be live.

- `apps/web/src/app/demo-speaking/page.tsx`
  - Create only if the speaking demo should be live.

- `apps/web/src/app/page.tsx`
  - Add or wire smoke coverage for homepage route if route-level tests are introduced.

## Audit Commands Run

- `curl.exe -I https://web-delta-azure-40.vercel.app`
- `curl.exe -L https://web-delta-azure-40.vercel.app`
- `vercel ls --yes`
- `npx --yes playwright screenshot --browser=chromium --viewport-size=1440,1100 https://web-delta-azure-40.vercel.app .codex/audit/desktop.png`
- `npx --yes playwright screenshot --browser=chromium --viewport-size=390,844 --full-page https://web-delta-azure-40.vercel.app .codex/audit/mobile.png`
- `node .codex/audit/browser-audit.js`
- `npx --yes lighthouse https://web-delta-azure-40.vercel.app --output=json --output-path=.codex/audit/lighthouse.json --chrome-flags="--headless --no-sandbox --disable-gpu" --quiet`

## PR-011 Fixes Implemented

Status: implemented locally, pending redeploy.

Routes fixed:

- Added `/login` beta-safe placeholder page.
- Added `/register` beta-safe tenant pilot placeholder page.
- Added `/demo-speaking` READY-BETA mock speaking page.
- Existing public CTAs now point to routes that exist locally.

SEO metadata fixed:

- Replaced production metadata localhost dependency with `NEXT_PUBLIC_SITE_URL`.
- Added fallback to `https://${VERCEL_URL}` for Vercel preview/production builds.
- Kept `http://localhost:3000` only as local development fallback.
- Added canonical metadata for homepage and the three new pages.
- Added `og:image` and Twitter image metadata.
- Added static OG asset at `apps/web/public/og-image.svg`.

Security headers added:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
- `Content-Security-Policy-Report-Only`

Remaining risk:

- CSP is report-only for beta to avoid breaking Next.js/Vercel runtime behavior during the first deployment after this change.
- Auth and signup are still placeholders; no production login or self-serve registration is implemented.
- Speaking demo remains mock-only and does not call backend realtime APIs.

Retest commands:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm format:check`
- `pnpm --filter @polyglot/web start`
- `curl.exe -I http://localhost:3000`
- `curl.exe -I http://localhost:3000/login`
- `curl.exe -I http://localhost:3000/register`
- `curl.exe -I http://localhost:3000/demo-speaking`
- `$env:WEB_BASE_URL="http://localhost:3000"; $env:NEXT_PUBLIC_SITE_URL="https://web-delta-azure-40.vercel.app"; pnpm --filter @polyglot/web smoke:routes`

## PR-011 Production Retest

Retest date/time: 2026-05-01 09:56:45 +07:00  
Final deployment URL: `https://web-6jay2kg3w-cuongnmhe181490s-projects.vercel.app`  
Production alias: `https://web-delta-azure-40.vercel.app`

Production redeploy status:

- Vercel project linked: `cuongnmhe181490s-projects/web`
- `NEXT_PUBLIC_SITE_URL` was added for production.
- Final production build completed successfully.
- Production alias updated successfully.

Route retest result:

- `/`: `200 OK`
- `/login`: `200 OK`
- `/register`: `200 OK`
- `/demo-speaking`: `200 OK`
- CTA click audit: `Đăng nhập`, `Bắt đầu`, and `Xem speaking loop` all reached expected routes.

Metadata retest result:

- `http://localhost:3000` removed from production HTML.
- Canonical exists: `https://web-delta-azure-40.vercel.app`
- `og:url` exists and uses production URL.
- `og:image` exists: `https://web-delta-azure-40.vercel.app/og-image.svg`
- Twitter image metadata exists.
- `/og-image.svg` returns `200 OK`.

Security header retest result:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
- `Content-Security-Policy-Report-Only` present.

Production UI audit result:

- Desktop horizontal overflow: false.
- Mobile horizontal overflow: false.
- Browser console errors: none.
- Page errors: none.
- Screenshots: `.codex/audit/pr011-production/desktop-full.png`, `.codex/audit/pr011-production/mobile-full.png`
- Browser audit JSON: `.codex/audit/pr011-production/browser-audit-result.json`
- Lighthouse JSON: `.codex/audit/pr011-production/lighthouse.json`

Production Lighthouse result:

- Performance: 91
- Accessibility: 91
- Best Practices: 100
- SEO: 100
- First Contentful Paint: 1.1 s
- Largest Contentful Paint: 2.9 s
- Total Blocking Time: 130 ms
- Cumulative Layout Shift: 0
- Total byte weight: 366 KiB

Remaining issues:

- Login and registration are beta placeholders, not production auth/signup.
- Speaking demo is mock-only.
- CSP remains Report-Only for beta; enforce after reviewing runtime behavior.

## PR-011 Production Redeploy Retest

Retest date/time: 2026-05-01 22:45 +07:00  
Deployment URL: `https://web-bj74snmlc-cuongnmhe181490s-projects.vercel.app`  
Production alias: `https://web-delta-azure-40.vercel.app`

Production redeploy status:

- Vercel project linked: `cuongnmhe181490s-projects/web`
- `NEXT_PUBLIC_SITE_URL` confirmed in Production as `https://web-delta-azure-40.vercel.app`.
- Previous literal newline suffix in `NEXT_PUBLIC_SITE_URL` was removed before redeploy.
- `vercel --prod --yes` completed successfully.
- Production alias updated successfully.

Route retest result:

- `/`: `200 OK`
- `/login`: `200 OK`
- `/register`: `200 OK`
- `/demo-speaking`: `200 OK`

Metadata retest result:

- `http://localhost:3000` absent from production HTML.
- Canonical exists and uses production URL.
- `og:url` exists and uses production URL.
- `og:image` exists and points to `/og-image.svg`.
- `/og-image.svg` returns `200 OK`.

Security header retest result:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
- `Content-Security-Policy-Report-Only` present.

Remaining issues:

- Login and registration are beta placeholders, not production auth/signup.
- Speaking demo is mock-only.
- CSP remains Report-Only for beta; enforce after reviewing runtime behavior.

PR-011 production verdict: PASS.
