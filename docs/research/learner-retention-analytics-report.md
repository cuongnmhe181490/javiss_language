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
- 7-day repeat learners
- multi-surface learners in the last 7 days
- average learning actions per active learner in the last 7 days
- median time from activation to first learning action
- a composite repeat learner quality score
- D1, D7, and D14 return rates based on post-activation activity
- D30 return rate based on post-activation activity
- repeat rate by activation cohort
- rough learning-quality correlation between repeat and non-repeat learners
- retention split by the learner's first real learning path
- rolling 30-day active and repeat usage metrics

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

It also exposes short-horizon repeat usage indicators:

- repeat learners in the last 7 days
- learners who used 2 or more product surfaces in the last 7 days
- average actions per active learner
- top repeated surface
- repeat learner quality score

It now also exposes time-based return signals:

- D1 return rate
- D7 return rate
- D14 return rate
- D30 return rate

It now also exposes retention by first learning path:

- started from lesson catalog
- started from speaking mock
- started from exercise submission
- started from writing feedback

And it surfaces a simple repeat-versus-non-repeat comparison for:

- latest speaking band
- latest writing band
- latest overall learning progress

It now also exposes rolling 30-day health signals:

- active learners in the last 30 days
- repeat learners in the last 30 days
- multi-surface learners in the last 30 days
- average learning actions per active learner in the last 30 days

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
- median time to first real learning action
- which registration sources produce better learning-start quality
- which plans and exam targets show stronger early retention
- which learner groups merely start once versus actually come back within 7 days
- how much of that return behavior survives to day 1, day 7, and day 14
- whether retention still holds by day 30
- whether short-horizon repeat usage still translates into healthy rolling 30-day usage
- which first learning path leads to stronger repeat usage and long-tail return
- whether repeat learners also show stronger speaking, writing, and progress signals
- whether product value is being reached after approval and verification

## 10. Repeat Usage Model

For the current admin dashboard, a learner is considered a `repeat learner` when they perform at least `2` learning actions in the last `7 days` across:

- speaking sessions
- writing feedback submissions
- submitted exercise attempts

A learner is considered `multi-surface` when they touch at least `2` of those product surfaces within the same 7-day window.

The `repeat learner quality score` is currently a lightweight composite based on:

- repeat learner rate
- multi-surface learner rate
- average action depth per active learner

This score is intentionally simple and admin-facing; it is meant to rank current product health, not to be treated as a strict BI metric.

This is the missing link between acquisition and retention.

## 11. Time-Based Return Model

The latest upgrade adds a second lens on retention:

- `D1`: learner performed any learning activity at least 24 hours after activation
- `D7`: learner performed any learning activity at least 7 days after activation
- `D14`: learner performed any learning activity at least 14 days after activation
- `D30`: learner performed any learning activity at least 30 days after activation

Eligible users are only counted once they have actually existed long enough to reach that checkpoint. This prevents fresh activations from artificially depressing D7 and D14 rates.

Learning activity for this purpose is derived from persisted product actions:

- speaking conversations
- writing feedback submissions
- submitted exercise attempts

This keeps the metric aligned with server-tracked product behavior.

## 12. Rolling 30-Day Retention Lens

The admin dashboard now complements the 7-day repeat view with a broader rolling 30-day lens:

- learners with at least one learning action in the last 30 days
- learners with at least two learning actions in the last 30 days
- learners who touched multiple product surfaces in that same period
- average action depth per active learner in the 30-day window

This helps separate:

- short-term re-engagement
- sustained month-level usage

The dashboard also now shows both `average` and `median` time to first learning action. Median is important because a few late-start learners can skew the average upward.

## 13. First Learning Path Retention

The latest upgrade also classifies each learner by the first persisted learning surface they touched:

- lesson catalog
- speaking mock
- exercise submission
- writing feedback

For each first-path group, the admin dashboard now shows:

- number of learners who started there
- repeat learner rate in the 7-day window
- D7 return rate
- D30 return rate

This helps answer a product question that the previous dashboard could not answer:

- which first learning experience produces the healthiest follow-up behavior?

## 14. Repeat Cohort And Learning Correlation

The service now enriches retention analysis in two additional ways:

1. `Repeat by activation cohort`

- weekly activation cohorts now track both:
  - learners who started learning
  - learners who later became repeat learners

2. `Repeat-versus-non-repeat comparison`

The admin dashboard now compares the latest available learner outcomes between repeat and non-repeat groups:

- speaking band
- writing band
- overall progress snapshot

This is not a causal model. It is an operational signal for product research: if repeat learners consistently outperform non-repeat learners, improving return behavior becomes easier to justify as a product priority.

## 15. Recommended Next Steps

1. Add retention checkpoints for first completed lesson and first reviewed exercise.
2. Add plan-level and source-level rolling 30-day reporting once cohorts are larger.
3. Compare median time-to-first-learning-action across source, plan, and first-path groups.
4. Add retention comparison by teacher assignment once the teacher workflow exists.
5. Correlate first learning path choice with later repeat usage and band gain more formally.
