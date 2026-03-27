# Learner Activation Retention Report

Generated for research ingestion after the post-activation retention upgrade.

- Workspace: `D:\javiss_language`
- Generated at: `2026-03-27`
- Scope: `account activation`, `first dashboard visit`, `first lesson open`, `first speaking start`, `first writing completion`

## 1. Objective

The codebase already measured acquisition up to account activation. This upgrade extends the measurable funnel into early retention, answering a more valuable question:

- after a learner gets activated, do they actually start learning?

The new analytics layer tracks first-use checkpoints across the learner experience without adding a third-party analytics SDK.

## 2. New Analytics Events

The `AnalyticsEventType` enum now includes:

- `learner_dashboard_first_visited`
- `lesson_catalog_first_opened`
- `speaking_mock_first_started`
- `speaking_mock_first_completed`
- `exercise_first_submitted`
- `writing_feedback_first_completed`

These events reuse the existing `AnalyticsEvent` model and stay aligned with the existing repository/service pattern.

## 3. Tracking Strategy

The retention funnel is intentionally event-based and idempotent:

- one event per user per milestone
- recorded close to business actions
- does not depend on client-only tracking

This makes the counts more stable than pure frontend analytics.

## 4. Tracking Entry Points

### 4.1 First dashboard visit

File: `src/app/(dashboard)/dashboard/page.tsx`

When an active learner opens the main dashboard, the page calls:

- `trackLearnerDashboardFirstVisit({ userId })`

This records the learner's first meaningful post-activation product entry.

### 4.2 First lesson-catalog open

File: `src/app/(dashboard)/dashboard/lessons/page.tsx`

When a learner opens the lesson catalog, the page calls:

- `trackLessonCatalogFirstOpen({ userId })`

This acts as the first clear sign that the user has entered structured learning content.

### 4.3 First speaking start

File: `src/server/services/ai-coach.service.ts`

Inside `startAiSpeakingSession()`, after the conversation is created, the service calls:

- `trackSpeakingMockFirstStart({ userId, conversationId, scenario })`

This tracks the first time a learner enters the speaking product loop.

### 4.4 First writing completion

File: `src/server/services/writing-feedback.service.ts`

After a `WritingFeedbackSubmission` is persisted, the service calls:

- `trackWritingFeedbackFirstCompletion({ userId, submissionId, taskType })`

This measures first successful use of the writing-feedback feature.

### 4.5 First speaking completion

File: `src/server/services/ai-coach.service.ts`

Inside `completeAiSpeakingSession()`, after the conversation is closed, the service now calls:

- `trackSpeakingMockFirstCompletion({ userId, conversationId })`

This distinguishes between learners who only start speaking and learners who actually finish a full mock session.

### 4.6 First submitted exercise

File: `src/server/services/learning.service.ts`

When an exercise attempt is submitted, the service now calls:

- `trackExerciseFirstSubmission({ userId, exerciseId, attemptId })`

This measures the first completed structured practice action outside the AI surfaces.

## 5. Idempotency

File: `src/server/repositories/analytics.repository.ts`

New repository helpers:

- `findAnalyticsEventForUser()`
- `createAnalyticsEventOnceForUser()`
- `countDistinctUsersByEventType()`

The tracking services rely on `createAnalyticsEventOnceForUser()` so repeated page visits or feature reuse do not inflate first-use counts.

## 6. Admin Summary

File: `src/server/services/learner-retention-analytics.service.ts`

`getLearnerRetentionSummary()` computes a `30-day` view of:

- activated learners
- learners who reached dashboard
- learners who opened lessons
- learners who started speaking
- learners who completed a speaking session
- learners who submitted an exercise
- learners who completed writing feedback
- learners who performed at least one real learning action

The summary now also derives:

- average time from activation to first learning action
- recent activation cohorts by week
- retention breakdown by registration source
- retention breakdown by plan
- retention breakdown by exam target

The summary also computes:

- dashboard visit rate from activated users
- lesson-open rate from activated users
- speaking-start rate from activated users
- writing-completion rate from activated users
- learning-start rate from activated users

## 7. Admin UI Surface

Files:

- `src/components/admin/learner-retention-card.tsx`
- `src/app/(admin)/admin/page.tsx`

The admin dashboard now shows a dedicated retention block next to the acquisition funnel and public-chat analytics.

The retention block now also exposes segmented views for:

- source that brought the learner into registration
- plan assigned to the learner
- target exam chosen by the learner

This makes the admin home page answer both questions:

- are we converting visitors into activated learners?
- are activated learners actually starting to learn?

## 8. Product Value

This upgrade makes it possible to measure:

- activation-to-dashboard adoption
- activation-to-learning-start conversion
- early adoption of speaking and writing
- speaking start versus speaking completion
- structured practice adoption through exercise submission
- average time to first real learning action
- which registration sources produce better learning-start quality
- which plans and exam targets show stronger early retention
- whether product value is being reached after approval and verification

This is the missing link between acquisition and retention.

## 9. Recommended Next Steps

1. Add retention checkpoints for first completed lesson and first reviewed exercise.
2. Add median alongside average time-to-first-learning-action.
3. Expand cohort analysis beyond 30 days and split by source.
4. Add retention comparison by teacher assignment once the teacher workflow exists.
5. Join retention data with writing/speaking progress to detect which first actions correlate with repeat usage.
