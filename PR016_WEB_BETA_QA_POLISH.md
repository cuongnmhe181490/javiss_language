# PR-016 Web Beta QA Polish & Accessibility Uplift

## Current Production Audit

Audit date/time: 2026-05-05 +07:00  
Production URL: `https://web-delta-azure-40.vercel.app`

Current production score:

- Lighthouse Performance: 94
- Lighthouse Accessibility: 91
- Lighthouse Best Practices: 100
- Lighthouse SEO: 100

Production audit artifacts:

- `.codex/audit/pr016-production/audit-result.json`
- `.codex/audit/pr016-production/home-desktop.png`
- `.codex/audit/pr016-production/dashboard-desktop.png`
- `.codex/audit/pr016-production/demo-speaking-desktop.png`
- `.codex/audit/pr016-production/grammar-desktop.png`
- `.codex/audit/pr016-production/placement-desktop.png`
- `.codex/audit/pr016-production/curriculum-desktop.png`

## Issues Found

- Several header and dashboard links are visually smaller than a 44px tap target.
- No skip-to-content link is available for keyboard users.
- The homepage has no footer landmark.
- Dashboard and beta/learning pages rely mostly on `main`; lightweight header/nav/footer landmarks would improve structure.
- Dashboard shortcut links labeled `Open track` are repeated without more specific accessible names.
- Beta placeholder copy is clear, but page chrome can better state demo/beta status consistently.
- CSP is still Report-Only and should remain Report-Only until a beta runtime review confirms no breakage.

No production blockers were found:

- All audited routes returned `200`.
- No console errors.
- No page errors.
- No horizontal overflow across 360, 390, 430, and 768px widths.
- No sampled low contrast text.
- PWA metadata, sitemap, robots, and security headers are present.

## Planned Fixes

- Add a reusable skip-to-content link and ensure key pages expose `id="main-content"`.
- Increase public nav/CTA tap targets to at least 44px where practical.
- Add footer landmarks to public beta surfaces.
- Improve dashboard shortcut accessible labels where link text repeats.
- Add `aria-current` for self-referential/current route links where appropriate.
- Polish beta copy without implying production auth, real speaking API, or backend data is live.
- Keep CSP as `Content-Security-Policy-Report-Only`; document future enforcement steps.

## Risk

- Low implementation risk: changes are semantic/copy/layout polish only.
- Performance risk should remain low because no dependency or charting library is added.
- Accessibility score should improve, but Lighthouse may still vary by environment.

## Done Criteria

- No public route regresses to 404.
- No horizontal overflow on audited mobile widths.
- Key pages have one `h1`, `main`, skip link, and footer landmark where appropriate.
- Repeated dashboard links have specific accessible names.
- Web typecheck/lint/test/build/smoke pass.
- Full repo typecheck/lint/test/build/format pass or known skips documented.
- No production deploy in PR-016 local work.

## Fixes Made

- Added a reusable skip-to-content link in the root layout.
- Added `id="main-content"` to the homepage, beta placeholder pages,
  learning topic pages, and dashboard.
- Added a shared footer landmark for public beta surfaces.
- Increased header, beta page, learning page, and dashboard CTA tap targets to
  44px where practical.
- Added `aria-current="page"` for the homepage brand link.
- Replaced repeated dashboard shortcut text with route-specific labels such as
  `Open Grammar`.
- Added accessible names to visual progress bars in the homepage product
  preview.
- Raised the homepage `Live` badge contrast to clear the Lighthouse contrast
  audit.

## Accessibility Improvements

- Local Lighthouse Accessibility improved from the production baseline of `91`
  to `100`.
- Lighthouse found no failing accessibility audits after the fixes.
- Keyboard navigation now starts with `Skip to main content`, then proceeds
  through the primary navigation and CTA links.
- Playwright local audit found no missing accessible names on audited links and
  buttons.
- Audited key pages still expose one `h1`.

## Mobile And Responsive Check

Audited widths: `360`, `390`, `430`, and `768`.

Routes checked:

- `/`
- `/dashboard`
- `/demo-speaking`
- `/grammar`
- `/placement`
- `/curriculum`

Result:

- No horizontal overflow found.
- No sampled low contrast text found.
- No small tap targets found after the fixes.

## Copy And CTA Polish

- Dashboard CTA labels now describe the target track instead of repeating
  generic `Open track` text.
- Learning page CTA copy now uses `Start dashboard` for the dashboard path.
- Existing beta clarity remains intact: login/register are placeholders,
  dashboard uses demo data, and speaking remains mock-only.

## CSP Review

The web app still sends `Content-Security-Policy-Report-Only`.

Current beta posture:

- Keep Report-Only until runtime behavior is reviewed after a preview or
  production deploy.
- Do not enforce CSP yet because Next/Vercel runtime script and style behavior
  must be verified under real traffic first.
- Current policy does not add broad `*` wildcards.
- Future enforcement should review whether `unsafe-inline` and `unsafe-eval`
  can be removed or narrowed without breaking Next runtime behavior.

## Bundle And Performance Notes

Local Lighthouse result:

- Performance: `93`
- Accessibility: `100`
- Best Practices: `100`
- SEO: `100`
- FCP: `1.1 s`
- LCP: `3.3 s`
- TBT: `20 ms`
- CLS: `0`
- Total byte weight: `383 KiB`

Build output shows all web routes remain static. Next.js 16/Turbopack did not
emit per-route JS sizes in this build output, so dashboard route size is tracked
qualitatively as low risk. No dependency, chart library, provider SDK, or large
client conversion was added.

## Verification

Local web checks:

- `pnpm --filter @polyglot/web typecheck`: PASS
- `pnpm --filter @polyglot/web lint`: PASS
- `pnpm --filter @polyglot/web test`: PASS, 4 tests
- `pnpm --filter @polyglot/web build`: PASS
- `pnpm --filter @polyglot/web smoke:routes`: PASS

Local browser audit artifacts:

- `.codex/audit/pr016-local/audit-result.json`
- `.codex/audit/pr016-local/lighthouse.json`

Full repo gates:

- `pnpm typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm test`: PASS, including API 97 passed and 11 skipped
- `pnpm build`: PASS
- `pnpm format:check`: pending final rerun after docs update

## Remaining Limitations

- Dashboard data remains local demo data only.
- Login/register remain beta placeholders.
- Speaking remains mock-only and does not request microphone access.
- CSP remains Report-Only.
- PR-016 was not deployed to production.

## Retest Checklist

- Redeploy preview or production when approved.
- Re-run route smoke against the deployed URL.
- Re-run Lighthouse desktop/mobile.
- Confirm security headers still include CSP Report-Only, frame protection,
  referrer policy, permissions policy, and nosniff.
- Confirm no horizontal overflow at `360`, `390`, `430`, and `768`.
- Confirm keyboard focus starts at the skip link and remains visible.
