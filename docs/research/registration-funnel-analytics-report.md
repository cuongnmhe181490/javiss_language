# Registration Funnel Analytics Report

Generated for research ingestion after the attribution and funnel upgrade.

- Workspace: `D:\javiss_language`
- Generated at: `2026-03-27`
- Scope: `public CTA attribution`, `registration submission tracking`, `approval/activation funnel`, `admin funnel summary`

## 1. Objective

The system previously tracked public interactions and registration lifecycle as separate concerns.

This upgrade connects them into a measurable funnel:

- public CTA click
- register form submission
- admin approval or rejection
- account activation after verification

The main technical goal is to preserve lightweight attribution from anonymous public traffic into the authenticated registration lifecycle without introducing a full analytics SDK.

## 2. New Analytics Events

The generic `AnalyticsEventType` enum now includes registration funnel milestones:

- `registration_submitted`
- `registration_approved`
- `registration_rejected`
- `account_activated`

These reuse the existing `AnalyticsEvent` table.

## 3. Attribution Handoff Design

### 3.1 Client-side attribution capture

File: `src/components/shared/public-analytics-link-button.tsx`

When a public CTA navigates to `/register`, the button now:

1. creates or reuses a public attribution session id
2. stores attribution in session storage
3. sends the analytics click event
4. navigates to the next page

Tracked attribution fields:

- `sessionId`
- `source`
- `intent`
- `label`
- `href`

### 3.2 Storage utility

File: `src/lib/public/attribution.ts`

Responsibilities:

- create/reuse attribution session ids
- store attribution in `sessionStorage`
- read attribution on the register page
- clear attribution after successful registration
- discard stale attribution older than 24 hours

### 3.3 Register form handoff

File: `src/components/forms/register-form.tsx`

At submit time, the form reads stored attribution and sends:

- `attributionSessionId`
- `attributionSource`
- `attributionIntent`
- `attributionLabel`

If no attribution exists, the form sends `attributionSource = "direct"`.

## 4. Backend Funnel Tracking

File: `src/server/services/registration.service.ts`

### `registerUser()`

Now writes `registration_submitted` with:

- registration id
- user id
- email
- target exam
- preferred language
- attribution session/source/intent/label
- IP address when available

### `approveRegistration()`

Now writes `registration_approved` with:

- registration id
- user id
- email
- actor id
- IP address

### `rejectRegistration()`

Now writes `registration_rejected` with:

- registration id
- user id
- email
- actor id
- rejection reason
- IP address

### `verifyRegistrationCode()`

Now writes `account_activated` with:

- user id
- email
- IP address

## 5. Route-Level IP Capture

These route handlers now pass client IP into the service layer:

- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify/route.ts`
- `src/app/api/admin/registrations/[id]/approve/route.ts`
- `src/app/api/admin/registrations/[id]/reject/route.ts`

This improves both audit logs and analytics metadata.

## 6. Admin Summary

File: `src/server/services/registration-funnel-analytics.service.ts`

`getRegistrationFunnelSummary()` computes a 7-day funnel summary:

- total register clicks
- unique register-click sessions
- registrations submitted
- attributed registrations
- approvals
- rejections
- activated accounts
- click-to-registration rate
- approval rate
- activation rate
- top registration sources

UI surface:

- `src/components/admin/registration-funnel-card.tsx`
- rendered on `src/app/(admin)/admin/page.tsx`

## 7. Product Value

This upgrade makes it possible to answer:

- how many people clicked `Đăng ký`
- how many actually submitted the form
- how many were approved
- how many finished activation
- which sources create the most registrations
- how much of the funnel is currently unattributed/direct

This is the first meaningful product funnel inside the codebase.

## 8. Recommended Next Steps

1. Connect `register submit -> pending age -> approval turnaround` in admin.
2. Add filter by source and date range for funnel reporting.
3. Join funnel analytics with public chatbot intents to measure `intent -> register -> activate`.
4. Track failed verification attempts in a separate product-analytics stream.
5. Add retention checkpoints after activation, such as first lesson, first speaking mock, first writing feedback.
