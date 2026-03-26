# Writing Feedback History And Analytics Report

Generated for research ingestion after the writing-history persistence upgrade.

- Workspace: `D:\javiss_language`
- Generated at: `2026-03-27`
- Scope: `writing feedback persistence`, `learner-facing history`, `analytics event schema`

## 1. Objective

The writing feature no longer behaves like a stateless one-off AI response. It now stores each submission, exposes recent history to the learner, and writes analytics events that can later support product funnels, quota dashboards, and recommendation loops.

## 2. New Prisma Surface

### 2.1 Enums

- `WritingTaskType`
  - `task1`
  - `task2`
- `AnalyticsEventType`
  - `writing_feedback_requested`
  - `writing_feedback_completed`
  - `writing_feedback_fallback_used`

### 2.2 Models

#### `WritingFeedbackSubmission`

Purpose:

- stores every learner writing submission and the AI review attached to it
- enables learner history, trend charts, and future writing recommendations

Important fields:

- `userId`
- `taskType`
- `prompt`
- `essay`
- `wordCount`
- `overallBand`
- `taskBand`
- `coherenceBand`
- `lexicalBand`
- `grammarBand`
- `summary`
- `strengths`
- `improvements`
- `sampleRewrite`
- `provider`
- `modelName`
- `fallbackReason`
- `createdAt`

#### `AnalyticsEvent`

Purpose:

- generic event sink for product analytics
- currently used by writing feedback
- designed to be extendable for chatbot, registration funnel, speaking usage, and billing later

Important fields:

- `userId`
- `eventType`
- `entityType`
- `entityId`
- `metadata`
- `createdAt`

## 3. Repository Layer

File: `src/server/repositories/writing-feedback.repository.ts`

- `createWritingFeedbackSubmission(input)`
- `listRecentWritingFeedbackSubmissionsByUser(userId, take?)`
- `countWritingFeedbackSubmissionsByUser(userId)`
- `aggregateWritingFeedbackByUser(userId)`
- `groupWritingFeedbackByTaskType(userId)`

File: `src/server/repositories/analytics.repository.ts`

- `createAnalyticsEvent(input)`

The first repository handles durable learner writing records. The second handles generic analytics events.

## 4. Service Flow

File: `src/server/services/writing-feedback.service.ts`

### 4.1 `getWritingFeedbackDashboardData(userId)`

Responsibilities:

- load recent writing submissions
- compute learner-facing summary metrics
- prepare data for the `/dashboard/writing-feedback` page

Returned UI-ready summary:

- `totalSubmissions`
- `latestBand`
- `bestBand`
- `averageBand`
- `task1Count`
- `task2Count`
- `lastSubmittedAt`

### 4.2 `generateWritingFeedback(input)`

Responsibilities:

1. enforce rate limit
2. load learner profile context
3. write `writing_feedback_requested`
4. call Gemini/OpenAI/mock provider
5. normalize structured AI output
6. persist `WritingFeedbackSubmission`
7. write `writing_feedback_completed`
8. optionally write `writing_feedback_fallback_used`
9. reload summary analytics for fresh UI state

This means the POST route now returns both:

- the latest AI feedback
- the persisted submission summary
- the refreshed dashboard summary

## 5. UI Changes

Page:

- `src/app/(dashboard)/dashboard/writing-feedback/page.tsx`

Client component:

- `src/components/dashboard/writing-feedback-form.tsx`

Current learner experience:

- submit a writing task
- receive AI review
- see historical trend for recent attempts
- see best band / latest band / average band
- see Task 1 vs Task 2 usage split
- reuse an old prompt directly from history

## 6. Architectural Value

This upgrade changes writing feedback from a pure inference endpoint into a reusable learning data source.

It unlocks:

- writing progress dashboards
- mistake clustering over time
- recommendation engines for next writing task
- retention analytics
- usage-based quotas and billing later
- admin visibility into writing usage patterns

## 7. Recommended Next Steps

1. Add learner-facing detail pages for individual writing submissions.
2. Add admin reporting for writing volume, average band, and fallback rate.
3. Add recommendation logic based on repeated weaknesses across stored submissions.
4. Connect writing history to `ProgressSnapshot` or a dedicated writing-progress model.
5. Extend `AnalyticsEvent` usage to public chatbot and registration funnel conversion.
