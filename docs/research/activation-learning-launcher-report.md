# Activation To First Learning Launcher Report

Generated for research ingestion after the learner onboarding launcher upgrade.

- Workspace: `D:\javiss_language`
- Generated at: `2026-03-27`
- Scope: `activation`, `first learning action`, `dashboard launcher`, `default first path`

## 1. Objective

The product already measured activation and early retention well, but newly activated learners were still landing on the generic dashboard.

This upgrade changes the experience from:

- activate account
- log in
- see a general dashboard

to:

- activate account
- log in
- if no learning action exists yet, see a focused learning launcher with one recommended first step

The goal is to reduce time-to-first-learning-action and remove post-activation hesitation.

## 2. New Runtime Flow

Entry file: `src/app/(dashboard)/dashboard/page.tsx`

The dashboard root now does:

1. require active student session
2. track first dashboard visit
3. load user, speaking trend, and launcher data in parallel
4. if learner has not started any learning surface yet, render `LearningLauncher`
5. otherwise render the standard dashboard

This means `/dashboard` itself becomes the activation-to-learning bridge.

## 3. Repository Support

File: `src/server/repositories/analytics.repository.ts`

New helper:

- `findFirstAnalyticsEventForUser({ userId, eventTypes })`

Used to detect whether the learner already performed one of these first-learning milestones:

- `lesson_catalog_first_opened`
- `speaking_mock_first_started`
- `exercise_first_submitted`
- `writing_feedback_first_completed`

## 4. Launcher Service

File: `src/server/services/learning-launcher.service.ts`

Main function:

- `getStudentLearningLauncherData(userId)`

Responsibilities:

- load learner profile and goal
- check whether first learning action already exists
- choose a default first path
- build the launcher option list with one recommended CTA

Current default-path heuristic:

- if weakest skill suggests `speaking` -> recommend speaking first
- else if weakest skill suggests `writing` -> recommend writing first
- else if weakest skill suggests `reading/listening` -> recommend lessons first
- else -> recommend AI coach first

This is intentionally heuristic and lightweight. It creates a clear default path today while leaving room for later data-driven path selection.

## 5. Launcher UI

File: `src/components/dashboard/learning-launcher.tsx`

The launcher renders:

- a focused hero block
- one highlighted primary CTA
- three secondary entry points
- goal context when available
- short reasoning for the recommended first path

Current learning surfaces exposed:

- AI Coach
- Speaking Mock
- Writing Feedback
- Lesson Catalog

## 6. Product Value

This upgrade improves the product at the exact point where the current analytics showed the biggest friction:

- after activation, before first learning action

It should help with:

- faster first action
- lower confusion on first login
- clearer default journey
- better conversion from activation into learning-start

## 7. Recommended Next Steps

1. Replace heuristic first-path rules with retention-based defaults by segment.
2. Add reminder nudges if learner still has no first action after 24 hours.
3. Track launcher CTA clicks separately for path-level optimization.
4. A/B test speaking-first vs writing-first vs lesson-first for high-volume segments.
