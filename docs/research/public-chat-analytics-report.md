# Public Chat Analytics And Conversion Tracking Report

Generated for research ingestion after the public-chat analytics upgrade.

- Workspace: `D:\javiss_language`
- Generated at: `2026-03-27`
- Scope: `public chatbot`, `anonymous analytics`, `CTA conversion tracking`, `admin analytics summary`

## 1. Objective

The public chatbot is no longer only a support widget. It now acts as a measurable conversion surface:

- it records what anonymous visitors ask about
- it classifies message intent
- it tracks which suggested actions users click
- it tracks key landing CTA clicks
- it exposes a 7-day summary in the admin dashboard

## 2. Schema Changes

The generic `AnalyticsEventType` enum now includes public-site events:

- `public_chat_widget_opened`
- `public_chat_message_requested`
- `public_chat_message_completed`
- `public_chat_fallback_used`
- `public_chat_action_clicked`
- `landing_cta_clicked`

All public-chat analytics reuse the existing `AnalyticsEvent` table.

## 3. Request/Tracking Flow

### 3.1 Public chatbot message flow

1. visitor opens the widget
2. widget can emit `widget_opened`
3. visitor sends a message or clicks a suggestion prompt
4. `POST /api/public-chat`
5. `sendPublicChatMessage()` classifies intent
6. service writes:
   - `public_chat_message_requested`
   - `public_chat_message_completed`
   - optionally `public_chat_fallback_used`
7. response returns:
   - AI reply
   - suggested actions
   - normalized intent

### 3.2 Click/conversion flow

1. visitor clicks chatbot action or landing CTA
2. client sends `POST /api/public-analytics`
3. `trackPublicAnalyticsEvent()` stores:
   - `public_chat_action_clicked`
   - or `landing_cta_clicked`
4. navigation continues to `/register`, `/login`, `/verify`, etc.

## 4. Key Files

### 4.1 Schemas

- `src/features/public-chat/schemas.ts`
  - `publicChatMessageSchema`
  - `publicAnalyticsEventSchema`

### 4.2 Routes

- `src/app/api/public-chat/route.ts`
- `src/app/api/public-analytics/route.ts`

### 4.3 Services

- `src/server/services/public-chat.service.ts`
- `src/server/services/public-chat-analytics.service.ts`

### 4.4 Repositories

- `src/server/repositories/analytics.repository.ts`

### 4.5 UI

- `src/components/shared/public-ai-chat-widget.tsx`
- `src/components/shared/public-analytics-link-button.tsx`
- `src/app/page.tsx`
- `src/app/(admin)/admin/page.tsx`
- `src/components/admin/public-chat-analytics-card.tsx`

## 5. Intent Layer

The chatbot now classifies messages into a compact intent set:

- `registration`
- `approval_status`
- `verification`
- `login_support`
- `speaking`
- `writing`
- `pricing`
- `exam_scope`
- `dashboard`
- `general`

Current classification is rule-based via keyword detection inside `sendPublicChatMessage()`.

This is intentionally simple, cheap, and deterministic. It is good enough for early-stage analytics and can later be replaced by a model-based classifier.

## 6. Admin Summary

`getPublicChatAnalyticsSummary()` currently returns a 7-day summary with:

- widget opens
- completed chatbot messages
- total tracked clicks
- register clicks
- login clicks
- verify clicks
- register click rate over completed chats
- top intents
- top clicked actions

This data is rendered directly on the admin home page so product/admin users can see anonymous demand without querying the database manually.

## 7. Product Value

This upgrade turns the public chatbot into a measurable conversion funnel surface.

Immediate benefits:

- identify what visitors are most confused about before registering
- see whether chatbot traffic tends to click `register`, `login`, or `verify`
- compare information intent vs conversion action
- improve landing copy based on real pre-signup questions

## 8. Recommended Next Steps

1. Track `register submit`, `approval`, `verify success`, and connect them back to public CTA/session paths.
2. Add date filtering and charts for public-chat analytics in admin.
3. Replace keyword intent detection with a lightweight classifier if query volume grows.
4. Split chatbot analytics by page source (home, register, login, verify).
5. Add cohort analysis for `public chat -> register -> active learner`.
