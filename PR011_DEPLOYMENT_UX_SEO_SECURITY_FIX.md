# PR-011 Deployment UX/SEO/Security Fix

## Scope

Fix deployment audit issues without adding large product features, backend integration, AI providers, or architecture changes.

## Files Changed

- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/register/page.tsx`
- `apps/web/src/app/demo-speaking/page.tsx`
- `apps/web/src/components/marketing/beta-page-shell.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/lib/site-url.ts`
- `apps/web/src/lib/site-url.spec.ts`
- `apps/web/public/og-image.svg`
- `apps/web/next.config.ts`
- `apps/web/package.json`
- `apps/web/scripts/smoke-routes.mjs`
- `DEPLOYMENT_UI_UX_AUDIT.md`

## Before

- `/login`, `/register`, and `/demo-speaking` returned 404.
- `og:url` resolved to `http://localhost:3000` in production HTML.
- Homepage lacked canonical metadata.
- No OpenGraph image asset was configured.
- Security headers were limited to platform defaults.

## After

- `/login`, `/register`, and `/demo-speaking` are App Router pages.
- Auth/signup pages clearly state beta status and do not pretend production auth exists.
- Speaking demo is mock-only and does not call backend/API/provider code.
- Metadata uses `NEXT_PUBLIC_SITE_URL`, then `VERCEL_URL`, then localhost only for local fallback.
- Canonical, `og:url`, `og:image`, Twitter card, and Twitter image metadata are present.
- Security headers are configured in `next.config.ts`.
- CSP is enabled as `Content-Security-Policy-Report-Only` for beta safety.

## Tests

Added:

- `apps/web/src/lib/site-url.spec.ts`
- `apps/web/scripts/smoke-routes.mjs`

Expected verification:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm format:check`
- Local production start and curl checks for `/`, `/login`, `/register`, `/demo-speaking`
- `pnpm --filter @polyglot/web smoke:routes`

## Known Limitations

- Login and registration are beta placeholders only.
- Speaking demo is a product explanation/mock page only.
- CSP is report-only, not enforced, until production runtime reports are reviewed.
- No custom production domain is configured in this change.
- PR-015 adds more web routes locally; production must be redeployed and retested
  before those routes are considered live.

## Deploy Checklist

1. Set `NEXT_PUBLIC_SITE_URL=https://web-delta-azure-40.vercel.app` in Vercel project env unless a custom domain is adopted.
2. Deploy from `apps/web` as the Vercel project root.
3. After deploy, run:
   - `curl.exe -I https://web-delta-azure-40.vercel.app`
   - `curl.exe -I https://web-delta-azure-40.vercel.app/login`
   - `curl.exe -I https://web-delta-azure-40.vercel.app/register`
   - `curl.exe -I https://web-delta-azure-40.vercel.app/demo-speaking`
4. Confirm response headers include security headers.
5. Confirm generated HTML contains production `og:url`, canonical, and `og:image`.

PR-015 route matrix to retest after deploy approval:

- `/dashboard`
- `/grammar`
- `/speaking`
- `/listening`
- `/reading`
- `/placement`
- `/curriculum`
- `/manifest.webmanifest`
- `/sitemap.xml`
- `/robots.txt`

## Production Deployment Result

Redeploy date/time: 2026-05-01 09:56:45 +07:00  
Vercel project: `cuongnmhe181490s-projects/web`  
Final deployment URL: `https://web-6jay2kg3w-cuongnmhe181490s-projects.vercel.app`  
Production alias: `https://web-delta-azure-40.vercel.app`

Deployment status: success.

Production route retest:

- `/`: `200 OK`
- `/login`: `200 OK`
- `/register`: `200 OK`
- `/demo-speaking`: `200 OK`

Production metadata retest:

- Localhost removed from generated HTML.
- Canonical exists and uses production URL.
- `og:url` exists and uses production URL.
- `og:image` exists and points to `/og-image.svg`.
- Twitter image metadata exists.
- `/og-image.svg` returns `200 OK`.

Production security header retest:

- `X-Content-Type-Options` present.
- `Referrer-Policy` present.
- `X-Frame-Options` present.
- `Permissions-Policy` present.
- `Content-Security-Policy-Report-Only` present.

Production UI/Lighthouse retest:

- Browser console errors: none.
- Page errors: none.
- Desktop horizontal overflow: false.
- Mobile horizontal overflow: false.
- CTA clicks reached expected routes.
- Lighthouse Performance: 91
- Lighthouse Accessibility: 91
- Lighthouse Best Practices: 100
- Lighthouse SEO: 100

Artifacts:

- `.codex/audit/pr011-production/desktop-full.png`
- `.codex/audit/pr011-production/mobile-full.png`
- `.codex/audit/pr011-production/browser-audit-result.json`
- `.codex/audit/pr011-production/lighthouse.json`

Remaining issues:

- Auth/signup pages are beta placeholders.
- Speaking demo is mock-only.
- CSP is Report-Only, not enforced, until beta runtime behavior is reviewed.

Production verdict: PASS.

## Local Production Preview Before Redeploy

Preview date/time: 2026-05-01 22:41 +07:00  
Preview command:

```powershell
$env:NEXT_PUBLIC_SITE_URL="https://web-delta-azure-40.vercel.app"
pnpm --filter @polyglot/web build
pnpm --filter @polyglot/web start
```

Local preview URL: `http://localhost:3000`

Port check:

- `3000`: free before preview startup.
- `3001`: free before preview startup.

Route checks:

| Route            | Result |
| ---------------- | ------ |
| `/`              | 200 OK |
| `/login`         | 200 OK |
| `/register`      | 200 OK |
| `/demo-speaking` | 200 OK |

Metadata checks from `curl.exe -L http://localhost:3000`:

- `localhost` absent from generated HTML.
- canonical tag present.
- production site URL present.
- `og:image` present.

Security header checks:

- `X-Content-Type-Options: nosniff` present.
- `Referrer-Policy: strict-origin-when-cross-origin` present.
- `X-Frame-Options: DENY` present.
- `Permissions-Policy` present.
- `Content-Security-Policy-Report-Only` present.

Local preview verdict: PASS. Ready for production redeploy when explicitly requested.

## Production Redeploy Retest

Redeploy date/time: 2026-05-01 22:45 +07:00  
Vercel CLI: `50.33.0`  
Vercel project: `cuongnmhe181490s-projects/web`  
Deployment URL: `https://web-bj74snmlc-cuongnmhe181490s-projects.vercel.app`  
Production alias: `https://web-delta-azure-40.vercel.app`

Environment:

- `NEXT_PUBLIC_SITE_URL` confirmed in Production.
- Existing malformed value containing literal `\r\n` was removed and re-added as `https://web-delta-azure-40.vercel.app`.
- No other application secret was added.

Deploy command:

```powershell
vercel --prod --yes
```

Deployment status: success. Production alias updated successfully.

Production route retest:

| Route            | Result |
| ---------------- | ------ |
| `/`              | 200 OK |
| `/login`         | 200 OK |
| `/register`      | 200 OK |
| `/demo-speaking` | 200 OK |

Production metadata retest:

- `http://localhost:3000` absent from production HTML.
- canonical uses `https://web-delta-azure-40.vercel.app`.
- `og:url` uses `https://web-delta-azure-40.vercel.app`.
- `og:image` is present.
- `/og-image.svg` returns `200 OK`.

Production security header retest:

- `X-Content-Type-Options: nosniff` present.
- `Referrer-Policy: strict-origin-when-cross-origin` present.
- `X-Frame-Options: DENY` present.
- `Permissions-Policy` present.
- `Content-Security-Policy-Report-Only` present.

Remaining issues:

- Auth/signup pages are beta placeholders.
- Speaking demo is mock-only.
- CSP remains Report-Only until beta runtime behavior is reviewed.

PR-011 production verdict: PASS.

## PR-016 Regression Check

Retest date/time: 2026-05-05 02:15:19 +07:00  
Production alias: `https://web-delta-azure-40.vercel.app`

PR-016 redeploy did not regress PR-011 fixes:

- `/`, `/login`, `/register`, and `/demo-speaking`: `200 OK`.
- `http://localhost:3000` remains absent from production metadata.
- Canonical, `og:url`, `og:image`, and Twitter image metadata remain present.
- `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, and `Content-Security-Policy-Report-Only` remain
  present.
