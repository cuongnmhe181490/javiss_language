# Web Learning Surface

## Current Surface

The web app is now a beta learning surface instead of only a marketing page.

Current public routes:

- `/`
- `/dashboard`
- `/grammar`
- `/speaking`
- `/listening`
- `/reading`
- `/placement`
- `/curriculum`
- `/login`
- `/register`
- `/demo-speaking`

## Dashboard Positioning

`/dashboard` is a demo learner dashboard. It shows the intended product
experience without implying that production auth or backend API integration is
live.

Dashboard sections:

- learning goal
- progress summary
- daily streak
- XP and level
- continue learning
- next lesson
- assignments
- AI tutor shortcut
- speaking practice shortcut
- skill progress
- recent activity
- weekly plan
- achievement badges

## Data Policy

All dashboard content is local demo data from:

- `apps/web/src/lib/demo-learning-data.ts`

Do not treat it as production learner data.

## API Integration Future

When backend staging is deployed:

1. Add `NEXT_PUBLIC_API_BASE_URL`.
2. Keep CORS allowlist scoped to the web origin.
3. Use OIDC for authenticated API calls.
4. Replace demo data with typed API clients.
5. Keep beta fallback states for API unavailable, unauthenticated, and empty
   tenant data.

## Production Retest

Retest date/time: 2026-05-05 01:15:16 +07:00  
Production alias: `https://web-delta-azure-40.vercel.app`

Result:

- `/dashboard`: `200 OK`
- `/grammar`: `200 OK`
- `/speaking`: `200 OK`
- `/listening`: `200 OK`
- `/reading`: `200 OK`
- `/placement`: `200 OK`
- `/curriculum`: `200 OK`
- CTA click audit passed for learning page links from the dashboard.
- Desktop and mobile horizontal overflow: false.
- Browser console errors: none.

Limitations remain unchanged: dashboard data is local demo data only and no
authenticated backend API is connected.

## PR-016 Beta QA Polish

PR-016 keeps the same learning surface and does not add backend integration.

Local polish completed:

- Dashboard shortcuts now use more specific accessible labels.
- Public beta pages include skip-to-content support through the shared layout.
- Learning pages keep clear CTA paths: dashboard, speaking demo, placement, and
  beta join.
- Local responsive audit found no horizontal overflow at `360`, `390`, `430`,
  and `768`.
- Local Lighthouse Accessibility improved to `100`.

Limitations remain unchanged:

- Dashboard data is local demo data.
- Auth pages are placeholders.
- Speaking is mock-only.
- No API/provider integration was added.
