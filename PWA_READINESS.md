# PWA Readiness

## Status

Basic PWA readiness exists for the web app.

## Files

- `apps/web/src/app/manifest.ts`
- `apps/web/public/icon.svg`
- `apps/web/public/apple-icon.svg`

## Manifest

The manifest defines:

- name: `Polyglot AI Academy`
- short name: `Polyglot AI`
- start URL: `/`
- display: `standalone`
- orientation: `portrait-primary`
- theme color: `#2563eb`
- background color: `#fbfaf7`

## Not Included Yet

- No service worker.
- No offline lesson cache.
- No push notifications.
- No install prompt UI.

These should wait until the API and content caching strategy are settled.

## Verification

The web smoke script checks `/manifest.webmanifest` returns `200`.

## Production Retest

Retest date/time: 2026-05-05 01:15:16 +07:00  
Production alias: `https://web-delta-azure-40.vercel.app`

Result:

- `/manifest.webmanifest`: `200 OK`
- `/icon.svg`: `200 OK`
- `/apple-icon.svg`: `200 OK`
- Homepage HTML includes a manifest link.
- Lighthouse PWA installability was not treated as a release gate because no
  service worker/offline cache is included yet.

Remaining limitations:

- No service worker.
- No offline lesson cache.
- No push notifications.
- No install prompt UI.

## PR-016 Local Retest

PR-016 did not change PWA architecture.

Local verification:

- `/manifest.webmanifest`: PASS in route smoke.
- `/icon.svg`: PASS in route smoke.
- `/apple-icon.svg`: PASS in route smoke.
- Homepage metadata remains production-safe when `NEXT_PUBLIC_SITE_URL` is set.

PWA limitations remain unchanged until a real offline/cache strategy is added.
