# Javiss Language Function Structure Report

Generated for research ingestion.

- Workspace: `D:\javiss_language`
- Generated at: `2026-03-27`
- Git baseline: `73e93c2` plus current working-tree updates on `2026-03-27`
- Runtime target: `Next.js 16 App Router`, `TypeScript`, `Prisma`, `PostgreSQL`, `Redis`, `Vercel`

## 1. System Purpose

`Javiss Language` is an AI-assisted language-exam preparation platform. The current product scope includes:

- gated registration with admin approval
- email verification and activation
- funnel analytics from public CTA to registration activation
- retention analytics from activation to first learning actions
- time-based retention analytics for D1, D7, D14, and D30 return behavior
- rolling 30-day activity and repeat-usage analytics
- cross-segmentation analytics across acquisition source, assigned plan, and first learning path
- cross-segmentation analytics across target exam and first learning path
- RBAC for `super_admin`, `admin`, `teacher`, `student`
- learner dashboard and admin dashboard
- AI coaching, speaking mock, public chatbot
- AI writing feedback
- writing feedback history and analytics events
- exam-ready architecture for IELTS now, HSK/JLPT/TOPIK later

The codebase follows a layered structure:

1. `app/` for route entrypoints, pages, layouts, and API handlers
2. `components/` for UI and form logic
3. `features/` for Zod schemas and feature-specific types
4. `lib/` for shared runtime primitives
5. `server/repositories/` for database access
6. `server/services/` for business workflows
7. `server/policies/` for authorization policy
8. `server/jobs/` for async email queue support

## 2. High-Level Dependency Rules

Expected direction of dependencies:

`page/route handler -> schema validation -> service -> repository -> Prisma/DB`

`page -> server service/repository -> component`

`component client action -> API route -> service -> repository`

Key architectural rules already visible in code:

- UI does not contain core business logic.
- DB access is isolated in repositories.
- Workflow rules live in services.
- Auth guard logic lives in `lib/auth` and `server/policies`.
- Rate limiting, hashing, and response helpers are centralized.
- AI logic is split between provider adapters and workflow services.

## 3. Primary Runtime Flows

### 3.1 Registration Activation Flow

1. `POST /api/auth/register`
2. `registerUser()` creates pending user + registration request
3. admin receives notification email
4. admin calls approve or reject endpoints
5. `approveRegistration()` generates verification code and emails user
6. user submits `POST /api/auth/verify`
7. `verifyRegistrationCode()` activates user and provisions student defaults

### 3.2 Login Flow

1. `POST /api/auth/login`
2. `loginUser()` validates password and status
3. `signSession()` creates JWT payload
4. `setSessionCookie()` writes session cookie
5. route guard + middleware redirect by role/status

### 3.3 AI Coach Flow

1. learner opens `/dashboard/ai-coach`
2. page loads conversation list and selected conversation
3. composer posts to `/api/ai/conversations` or `/api/ai/conversations/[id]/messages`
4. `sendAiCoachMessage()` resolves provider, rate limit, fallback, persistence
5. conversation + messages are stored in Prisma models

### 3.4 Speaking Mock Flow

1. learner starts a speaking session via `/api/ai/speaking/sessions`
2. `startAiSpeakingSession()` creates `AiConversation(kind=speaking_mock)`
3. learner submits turns through `/api/ai/conversations/[id]/messages`
4. `sendAiCoachMessage()` also generates speaking assessment snapshot
5. learner can close session via `/api/ai/conversations/[id]/complete`

### 3.5 Writing Feedback Flow

1. learner opens `/dashboard/writing-feedback`
2. page loads recent writing history and summary analytics from DB
3. client form posts to `/api/ai/writing-feedback`
4. `generateWritingFeedback()` validates, rate-limits, invokes provider
5. provider returns structured JSON feedback
6. service persists `WritingFeedbackSubmission` and `AnalyticsEvent`
7. client renders latest review plus historical trend and stored submissions

## 4. Database Domain Map

### 4.1 Enums

- `UserStatus`
- `RegistrationStatus`
- `NotificationStatus`
- `AuditAction`
- `LicenseStatus`
- `EntitlementStatus`
- `FeatureFlagType`
- `GoalStatus`
- `PlanStatus`
- `ExerciseType`
- `QuestionType`
- `LessonStatus`
- `PromptType`
- `AttemptStatus`
- `AiProvider`
- `AiMessageRole`
- `AiConversationKind`
- `WritingTaskType`
- `AnalyticsEventType`

### 4.2 Models

Identity and access:

- `User`
- `UserProfile`
- `Role`
- `UserRole`

Registration and verification:

- `RegistrationRequest`
- `VerificationCode`
- `PasswordResetToken`
- `AdminNotification`
- `AuditLog`

Plans and entitlements:

- `SubscriptionPlan`
- `License`
- `UserEntitlement`
- `FeatureFlag`

Learning foundation:

- `Language`
- `Exam`
- `ExamPack`
- `Goal`
- `SkillProfile`
- `StudyPlan`
- `ProgressSnapshot`

Content:

- `Topic`
- `Lesson`
- `Exercise`
- `Question`
- `ExerciseAttempt`
- `AttemptAnswer`
- `Rubric`
- `PromptTemplate`

Settings and AI:

- `SystemSetting`
- `AiConversation`
- `AiMessage`
- `AiSpeakingAssessmentSnapshot`
- `WritingFeedbackSubmission`
- `AnalyticsEvent`

## 5. API Surface

### 5.1 Auth APIs

| Route | Method | Handler file | Main service |
|---|---|---|---|
| `/api/auth/register` | `POST` | `src/app/api/auth/register/route.ts` | `registerUser()` |
| `/api/auth/login` | `POST` | `src/app/api/auth/login/route.ts` | `loginUser()` |
| `/api/auth/logout` | `POST` | `src/app/api/auth/logout/route.ts` | session clear only |
| `/api/auth/verify` | `POST` | `src/app/api/auth/verify/route.ts` | `verifyRegistrationCode()` |
| `/api/auth/resend-code` | `POST` | `src/app/api/auth/resend-code/route.ts` | `resendVerificationCode()` |
| `/api/auth/forgot-password` | `POST` | `src/app/api/auth/forgot-password/route.ts` | `requestPasswordReset()` |
| `/api/auth/reset-password` | `POST` | `src/app/api/auth/reset-password/route.ts` | `resetPassword()` |

### 5.2 Admin APIs

| Route | Method | Handler file | Main service |
|---|---|---|---|
| `/api/admin/registrations/[id]/approve` | `POST` | `src/app/api/admin/registrations/[id]/approve/route.ts` | `approveRegistration()` |
| `/api/admin/registrations/[id]/reject` | `POST` | `src/app/api/admin/registrations/[id]/reject/route.ts` | `rejectRegistration()` |
| `/api/admin/users/[id]/toggle-block` | `POST` | `src/app/api/admin/users/[id]/toggle-block/route.ts` | `toggleBlockUser()` |
| `/api/admin/users/create-admin` | `POST` | `src/app/api/admin/users/create-admin/route.ts` | `createAdminAccount()` |
| `/api/admin/settings` | `POST` | `src/app/api/admin/settings/route.ts` | `updateSystemSettings()` |
| `/api/admin/plans` | `POST` | `src/app/api/admin/plans/route.ts` | `createSubscriptionPlan()` |
| `/api/admin/content/lessons` | `POST` | `src/app/api/admin/content/lessons/route.ts` | `createLessonContent()` |
| `/api/admin/content/exercises` | `POST` | `src/app/api/admin/content/exercises/route.ts` | `createExerciseContent()` |

### 5.3 Learner APIs

| Route | Method | Handler file | Main service |
|---|---|---|---|
| `/api/users/profile` | `POST` | `src/app/api/users/profile/route.ts` | `updateStudentProfile()` |
| `/api/exercises/[slug]/attempts` | `POST` | `src/app/api/exercises/[slug]/attempts/route.ts` | `saveExerciseAttempt()` |

### 5.4 AI APIs

| Route | Method | Handler file | Main service |
|---|---|---|---|
| `/api/ai/conversations` | `POST` | `src/app/api/ai/conversations/route.ts` | `sendAiCoachMessage()` |
| `/api/ai/conversations/[id]/messages` | `POST` | `src/app/api/ai/conversations/[id]/messages/route.ts` | `sendAiCoachMessage()` |
| `/api/ai/conversations/[id]/complete` | `POST` | `src/app/api/ai/conversations/[id]/complete/route.ts` | `completeAiSpeakingSession()` |
| `/api/ai/speaking/sessions` | `POST` | `src/app/api/ai/speaking/sessions/route.ts` | `startAiSpeakingSession()` |
| `/api/ai/writing-feedback` | `POST` | `src/app/api/ai/writing-feedback/route.ts` | `generateWritingFeedback()` |
| `/api/public-chat` | `POST` | `src/app/api/public-chat/route.ts` | `sendPublicChatMessage()` |
| `/api/public-analytics` | `POST` | `src/app/api/public-analytics/route.ts` | `trackPublicAnalyticsEvent()` |

## 6. Service Layer Inventory

### 6.1 Auth and Account Services

File: `src/server/services/auth.service.ts`

- `loginUser(input)`
  - validates credentials
  - checks user status and role routing
  - updates login state
  - issues session payload

File: `src/server/services/registration.service.ts`

- `registerUser(input, ipAddress?)`
  - validates registration business rules
  - hashes password
  - creates `User`, `UserProfile`, `RegistrationRequest`
  - notifies admins by email
- `approveRegistration(input)`
  - admin approval workflow
  - updates registration + user status
  - generates verification code hash
  - sends verification email
  - writes audit log
- `rejectRegistration(input)`
  - admin rejection workflow
  - updates registration + user status
  - optional rejection email
  - writes audit log
- `verifyRegistrationCode(input, ipAddress?)`
  - checks latest code
  - validates attempts/expiry/usage
  - activates account
  - provisions student entitlements and learning artifacts
- `resendVerificationCode(input, ipAddress?)`
  - checks resend policy and cooldown
  - issues a new verification code
  - sends verification email again

File: `src/server/services/password-reset.service.ts`

- `requestPasswordReset(input, ipAddress?)`
  - invalidates previous reset tokens
  - creates new token hash
  - sends password reset email
  - writes audit log
- `resetPassword(input, ipAddress?)`
  - verifies reset token
  - hashes new password
  - invalidates token
  - bumps `sessionVersion`
  - writes audit log

### 6.2 Admin and Settings Services

File: `src/server/services/admin.service.ts`

- `toggleBlockUser(input)`
  - switches user between blocked and active states
  - writes audit log

File: `src/server/services/settings.service.ts`

- `updateSystemSettings(input)`
  - validates admin settings payload
  - persists settings via repository
  - writes audit log

File: `src/server/services/user-management.service.ts`

- `createAdminAccount(input)`
  - creates new admin user
  - assigns admin role
  - writes audit log
- `updateStudentProfile(input)`
  - updates learning profile and preferences
  - writes audit log

### 6.3 Content and Learning Services

File: `src/server/services/content.service.ts`

- `createLessonContent(input)`
  - creates lesson draft/published content
  - writes audit log
- `createExerciseContent(input)`
  - creates exercise and question set
  - writes audit log

File: `src/server/services/learning.service.ts`

- `saveExerciseAttempt(input)`
  - validates answer/question matching
  - upserts draft or submitted attempt
  - updates progress snapshots after submission

File: `src/server/services/plan.service.ts`

- `createSubscriptionPlan(input)`
  - creates plan records for product access

### 6.4 Email and Audit Services

File: `src/server/services/email.service.ts`

- `notifyAdminsOfRegistration(input)`
- `sendVerificationCodeEmail(input)`
- `sendRejectionEmail(input)`
- `sendPasswordResetEmail(input)`

These functions select an email provider and dispatch email payloads, usually through the queue abstraction.

File: `src/server/services/audit.service.ts`

- `createAuditLog(input)`
- `listAuditLogs()`

### 6.5 AI Services

File: `src/server/services/ai-coach.service.ts`

- `getAiCoachDashboardData(userId)`
  - loads learner profile + conversation list
- `getAiConversationDetail(input)`
  - loads one conversation with full message history and speaking assessments
- `getStudentAiWidgetData(userId)`
  - loads latest coach conversation and latest speaking summary for dashboard widget
- `startAiSpeakingSession(input)`
  - creates a speaking mock conversation and opening examiner message
- `sendAiCoachMessage(input)`
  - sends learner message to AI provider
  - applies rate limit and Gemini quota
  - falls back to mock provider if needed
  - persists messages
  - creates speaking band snapshots for speaking conversations
- `completeAiSpeakingSession(input)`
  - closes a speaking session and stores final band

Internal helper logic inside the same file:

- provider resolution
- speaking title/scenario/opening generation
- AI context construction from learner profile
- fallback handling for reply generation and speaking assessment generation
- conversation history mapping

File: `src/server/services/public-chat.service.ts`

- `sendPublicChatMessage(input)`
  - handles public-site chatbot
  - rate-limits by fingerprint/IP
  - uses Gemini/OpenAI/mock provider
  - classifies intent for analytics
  - returns action links for user navigation
  - writes analytics events for request/completion/fallback

File: `src/server/services/public-chat-analytics.service.ts`

- `trackPublicAnalyticsEvent(input)`
  - persists widget-open, action-click, and landing CTA events
- `getPublicChatAnalyticsSummary()`
  - aggregates 7-day widget opens, completed chats, tracked clicks, top intents, and top actions for admin UI

File: `src/server/services/registration-funnel-analytics.service.ts`

- `getRegistrationFunnelSummary()`
  - aggregates 7-day counts for register clicks, submitted registrations, approvals, rejections, and activated accounts
  - computes click-to-submit, approval, and activation rates
  - groups registration submissions by attributed source

File: `src/server/services/learner-retention-analytics.service.ts`

- `trackLearnerDashboardFirstVisit(input)`
  - records the first learner dashboard visit per user
- `trackLessonCatalogFirstOpen(input)`
  - records the first time a learner opens the lesson catalog
- `trackSpeakingMockFirstStart(input)`
  - records the first speaking mock start per user
- `trackSpeakingMockFirstCompletion(input)`
  - records the first completed speaking mock per user
- `trackExerciseFirstSubmission(input)`
  - records the first submitted exercise attempt per user
- `trackWritingFeedbackFirstCompletion(input)`
  - records the first completed writing-feedback submission per user
- `getLearnerRetentionSummary()`
  - aggregates 30-day retention checkpoints from activation to first learning actions
  - reports dashboard visit, lesson open, speaking start, speaking completion, exercise submission, writing completion, cohort trend, average and median time-to-first-learning-action, segmented retention by source/plan/exam, 7-day repeat usage quality, rolling 30-day usage depth, D1/D7/D14/D30 return rates, retention by first learning path, source×first-path, plan×first-path, exam×first-path combinations, and repeat-vs-non-repeat learning outcome comparison

File: `src/server/services/writing-feedback.service.ts`

- `getWritingFeedbackDashboardData(userId)`
  - loads recent persisted writing submissions
  - computes summary analytics for learner UI
- `generateWritingFeedback(input)`
  - validates learner existence
  - rate-limits request
  - applies Gemini quota
  - requests structured JSON writing feedback from provider
  - parses into normalized band and recommendation object
  - falls back to mock feedback if provider fails
  - persists `WritingFeedbackSubmission`
  - writes `AnalyticsEvent` records for request/completion/fallback

Internal helper logic in this file:

- provider resolution
- OpenAI-compatible Gemini client creation
- JSON extraction and schema parsing
- writing-specific prompt construction
- mock feedback generation

## 7. Repository Layer Inventory

### 7.1 AI Repositories

File: `src/server/repositories/ai-coach.repository.ts`

- `listAiConversationsByUser(userId)`
- `findLatestCoachConversationForUser(userId)`
- `findLatestSpeakingConversationForUser(userId)`
- `listRecentSpeakingAssessmentsByUser(userId, take?)`
- `findAiConversationByIdForUser(input)`
- `createAiConversation(input)`
- `createAiMessage(input)`
- `updateAiConversationState(input)`
- `createAiSpeakingAssessmentSnapshot(input)`

Data scope:

- `AiConversation`
- `AiMessage`
- `AiSpeakingAssessmentSnapshot`

### 7.2 Registration and User Repositories

File: `src/server/repositories/registration.repository.ts`

- `findRegistrationById(id)`
- `listRegistrations(params?)`
- `findLatestVerificationCode(userId)`
- `findLatestAvailableVerificationCode(userId)`
- `createStudentEntitlements(userId)`
- `ensureStudentRole(userId)`
- `createDefaultLearningArtifacts(userId)`
- `updateUserStatus(userId, status)`

File: `src/server/repositories/user.repository.ts`

- `findUserByEmail(email)`
- `findUserById(id)`
- `listUsers(query?)`
- `createAdminUser(input)`
- `updateUserLearningProfile(input)`

File: `src/server/repositories/password-reset.repository.ts`

- `invalidateActivePasswordResetTokens(userId)`
- `createPasswordResetToken(input)`
- `findPasswordResetTokenByHash(tokenHash)`
- `completePasswordReset(input)`

### 7.3 Learning and Content Repositories

File: `src/server/repositories/learning.repository.ts`

- `getLearningCatalogForUser(userId)`
- `getExerciseBySlug(slug)`
- `getExerciseDetailForUser(slug, userId)`
- `upsertExerciseAttempt(input)`
- `updateProgressFromAttempt(input)`
- `listRecentAttemptsByUser(userId)`

File: `src/server/repositories/content.repository.ts`

- `listContentOverview()`
- `listContentFormOptions()`
- `findLessonBySlug(slug)`
- `findExerciseBySlug(slug)`
- `createLesson(input)`
- `createExerciseWithQuestions(input)`

### 7.4 Plans, Exams, Settings

File: `src/server/repositories/plan.repository.ts`

- `listPlans()`
- `createPlan(input)`

File: `src/server/repositories/exam.repository.ts`

- `findExamByCode(code)`
- `findLanguageByCode(code)`
- `listExams()`

File: `src/server/repositories/settings.repository.ts`

- `getSettingValue(key)`
- `getAllSettings()`
- `upsertSettings(entries)`

File: `src/server/repositories/writing-feedback.repository.ts`

- `createWritingFeedbackSubmission(input)`
- `listRecentWritingFeedbackSubmissionsByUser(userId, take?)`
- `countWritingFeedbackSubmissionsByUser(userId)`
- `aggregateWritingFeedbackByUser(userId)`
- `groupWritingFeedbackByTaskType(userId)`

File: `src/server/repositories/analytics.repository.ts`

- `createAnalyticsEvent(input)`
- `findAnalyticsEventForUser(params)`
- `createAnalyticsEventOnceForUser(input)`
- `listAnalyticsEvents(params?)`
- `countAnalyticsEvents(params)`
- `countDistinctUsersByEventType(params)`

## 8. Auth, Policy, and Security Utilities

### 8.1 Auth Guards

File: `src/lib/auth/guards.ts`

- `requireSession()`
- `requireRoles(roles)`
- `requireActiveStudentSession()`

Purpose:

- page-level protection
- status enforcement
- role-specific access checks

### 8.2 Session Utilities

File: `src/lib/auth/session.ts`

- `signSession(payload)`
- `verifySession(token)`
- `getSession()`
- `setSessionCookie(token)`
- `clearSessionCookie()`

Session design notes:

- cookie-based JWT session
- DB re-check on each session read
- `sessionVersion` invalidates old sessions after password reset

### 8.3 Redirect and Status Helpers

File: `src/lib/auth/redirects.ts`

- `getPostLoginRedirect(roles)`

File: `src/lib/auth/status-redirect.ts`

- `getStatusRedirect(userStatus)`

### 8.4 RBAC Policy

File: `src/server/policies/rbac.ts`

- `assertHasRole(userRoles, allowedRoles)`
- `canManageGlobalSettings(userRoles)`

### 8.5 Security Helpers

File: `src/lib/security/password.ts`

- `hashPassword(password)`
- `verifyPassword(password, hash)`

File: `src/lib/security/verification-code.ts`

- `generateVerificationCode(length?)`
- `hashVerificationCode(code)`

File: `src/lib/security/password-reset.ts`

- `generatePasswordResetToken()`
- `hashPasswordResetToken(token)`

## 9. Rate Limiting, Email, Queue, and Logging

### 9.1 Rate Limit Utilities

File: `src/lib/rate-limit/memory-rate-limit.ts`

- `enforceRateLimit(key, limit, windowMs)`

File: `src/lib/rate-limit/provider-quota.ts`

- `consumeDailyProviderQuota(input)`

### 9.2 Email Provider Abstraction

File: `src/lib/email/providers.ts`

- `getEmailProvider()`

Provider modes:

- `mock`
- `smtp`

File: `src/lib/email/templates.ts`

- `renderAdminRegistrationEmail(input)`
- `renderVerificationEmail(input)`
- `renderRejectionEmail(input)`
- `renderPasswordResetEmail(input)`

### 9.3 Queue and Worker

File: `src/server/jobs/email-queue.ts`

- `enqueueEmail(message)`

File: `src/server/jobs/email-worker.ts`

- `createEmailWorker()`

### 9.4 Logger

File: `src/lib/logger/index.ts`

- `logger.info(message, payload?)`
- `logger.warn(message, payload?)`
- `logger.error(message, payload?)`

## 10. AI Provider Layer

File: `src/lib/ai/providers.ts`

Exported functions:

- `getAiCoachProvider()`
- `getMockAiCoachProvider()`

Internal provider classes:

- `BaseOpenAiCompatibleProvider`
- `MockAiCoachProvider`
- `OpenAiCoachProvider`
- `GeminiAiCoachProvider`

Capabilities implemented here:

- coach reply generation
- speaking mock examiner reply generation
- speaking assessment generation
- OpenAI-compatible Gemini transport
- prompt construction for coach and speaking modes
- mock fallback behavior

File: `src/lib/ai/types.ts`

Core AI contracts:

- `AiCoachContext`
- `AiConversationMode`
- `AiConversationHistoryMessage`
- `AiCoachReplyInput`
- `AiCoachReplyOutput`
- `AiSpeakingAssessment`
- `AiCoachProvider`

## 11. Page and Layout Entry Points

### 11.1 Root App and Shared Shell

- `src/app/layout.tsx -> RootLayout()`
- `src/app/loading.tsx -> Loading()`
- `src/components/shared/app-shell.tsx -> AppShell()`

### 11.2 Public Pages

- `src/app/page.tsx -> HomePage()`
- `src/app/(public)/pending-approval/page.tsx -> PendingApprovalPage()`
- `src/app/(public)/account-status/page.tsx -> AccountStatusPage()`
- `src/app/(public)/rejected/page.tsx -> RejectedPage()`

### 11.3 Auth Pages

- `src/app/(auth)/login/page.tsx -> LoginPage()`
- `src/app/(auth)/register/page.tsx -> RegisterPage()`
- `src/app/(auth)/verify/page.tsx -> VerifyPage()`
- `src/app/(auth)/forgot-password/page.tsx -> ForgotPasswordPage()`
- `src/app/(auth)/reset-password/page.tsx -> ResetPasswordPage()`

### 11.4 Learner Pages

- `src/app/(dashboard)/dashboard/layout.tsx -> DashboardLayout()`
- `src/app/(dashboard)/dashboard/page.tsx -> DashboardPage()`
- `src/app/(dashboard)/dashboard/lessons/page.tsx -> DashboardLessonsPage()`
- `src/app/(dashboard)/dashboard/exercises/[slug]/page.tsx -> ExerciseDetailPage()`
- `src/app/(dashboard)/dashboard/ai-coach/page.tsx -> DashboardAiCoachPage()`
- `src/app/(dashboard)/dashboard/writing-feedback/page.tsx -> DashboardWritingFeedbackPage()`
- `src/app/(dashboard)/dashboard/profile/page.tsx -> DashboardProfilePage()`
- `src/app/(dashboard)/dashboard/plan/page.tsx -> DashboardPlanPage()`
- `src/app/(dashboard)/dashboard/progress/page.tsx -> DashboardProgressPage()`

### 11.5 Admin Pages

- `src/app/(admin)/admin/layout.tsx -> AdminLayout()`
- `src/app/(admin)/admin/page.tsx -> AdminPage()`
- `src/app/(admin)/admin/registrations/page.tsx -> AdminRegistrationsPage()`
- `src/app/(admin)/admin/users/page.tsx -> AdminUsersPage()`
- `src/app/(admin)/admin/content/page.tsx -> AdminContentPage()`
- `src/app/(admin)/admin/plans/page.tsx -> AdminPlansPage()`
- `src/app/(admin)/admin/logs/page.tsx -> AdminLogsPage()`
- `src/app/(admin)/admin/settings/page.tsx -> AdminSettingsPage()`

## 12. Major Interactive Client Components

### 12.1 Learner Components

- `AiCoachComposer()`
  - submits text chat to AI coach
- `AiSpeakingSessionPanel()`
  - starts speaking sessions
  - captures microphone speech
  - submits turns
  - completes session
- `StudentAiChatWidget()`
  - dashboard floating AI helper
  - loads latest coach/speaking context
  - launches quick speaking sessions
- `SpeakingTrendCard()`
  - visualizes recent speaking band trend
- `WritingFeedbackForm()`
  - posts writing prompt + essay and renders AI review

### 12.2 Public Components

- `PublicAiChatWidget()`
  - floating public chatbot
  - suggested prompts
  - tracked action links
- `PublicAnalyticsLinkButton()`
  - client-side tracked navigation for public CTA and chatbot action buttons
- `RegistrationFunnelCard()`
  - admin-facing funnel summary for `click -> submit -> approve -> activate`
- `LearnerRetentionCard()`
  - admin-facing retention summary for `activate -> dashboard -> lesson -> speaking -> writing`

### 12.3 Auth and Learner Forms

- `RegisterForm()`
- `LoginForm()`
- `VerifyForm()`
- `ForgotPasswordForm()`
- `ResetPasswordForm()`
- `ProfileForm()`
- `ExerciseAttemptForm()`

### 12.4 Admin Components

- `CreateAdminForm()`
- `CreateLessonForm()`
- `CreateExerciseForm()`
- `CreatePlanForm()`
- `RegistrationActions()`
- `SettingsForm()`
- `ToggleUserBlock()`

## 13. Shared UI Primitive Functions

These are thin presentational helpers and are usually not business-critical, but they are part of the exported function surface:

- `Badge()`
- `Button()`
- `Card()`
- `CardHeader()`
- `CardTitle()`
- `CardDescription()`
- `CardContent()`
- `Input()`
- `Label()`
- `Select()`
- `Skeleton()`
- `Table()`
- `TableHead()`
- `TableCell()`
- `TableRow()`
- `Textarea()`
- `EmptyState()`
- `SectionHeader()`
- `StatusBadge()`
- `ThemeProvider()`
- `ThemeToggle()`
- `AppToaster()`
- `MetricCard()`
- `FormMessage()`

## 14. Feature Schema Inventory

Key Zod validation modules:

- `src/features/auth/schemas.ts`
- `src/features/ai/schemas.ts`
- `src/features/learning/schemas.ts`
- `src/features/admin/schemas.ts`
- `src/features/plans/schemas.ts`
- `src/features/public-chat/schemas.ts`

Important AI schema functions from `src/features/ai/schemas.ts`:

- `aiCoachMessageSchema`
- `aiSpeakingSessionSchema`
- `aiSpeakingTurnSchema`
- `aiWritingFeedbackSchema`

## 15. Research Ingestion Recommendations

If an external research tool needs to analyze the codebase efficiently, use this order:

1. `prisma/schema.prisma`
2. `src/app/api/**/route.ts`
3. `src/server/services/*.ts`
4. `src/server/repositories/*.ts`
5. `src/lib/auth/*.ts`
6. `src/lib/ai/*.ts`
7. `src/components/dashboard/*.tsx`
8. `src/components/forms/*.tsx`
9. `src/app/(dashboard)/**/page.tsx`
10. `src/app/(admin)/**/page.tsx`

This order reconstructs the application from data model -> API surface -> business logic -> persistence -> UI.

## 16. Current Extension Points

Most important extension seams for future work:

- add DB persistence for writing feedback history
- add analytics for public chatbot
- add AI streaming transport for coach and writing feedback
- add writing-feedback recommendation loop from stored history
- add deeper funnel analytics between CTA click -> register submit -> approval -> activation
- attribute registrations to public session/source via session storage handoff from landing/chatbot CTA to register form
- add retention checkpoints after activation, such as first lesson, first speaking mock, first writing feedback
- add multi-exam prompt packs via `ExamPack`, `Rubric`, `PromptTemplate`
- add teacher workflow on top of existing RBAC role
- add more provider adapters beyond Gemini/OpenAI/mock

## 17. Notes for Tooling

- The codebase uses `@/*` path alias mapped to `src/*`.
- Some terminal output on Windows PowerShell may display mojibake for Vietnamese UI text even if the file content is correct in UTF-8.
- API route handlers use native `Request`/`Response` with Next.js App Router route conventions.
- Session state is cookie-based, not NextAuth-based.
- AI provider access is centralized, so changing provider behavior should start in:
  - `src/lib/ai/providers.ts`
  - `src/server/services/public-chat.service.ts`
  - `src/server/services/writing-feedback.service.ts`
