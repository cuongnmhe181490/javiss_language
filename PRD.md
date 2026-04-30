# Polyglot AI Academy - Product Requirements Document

## 1. Product summary

Polyglot AI Academy là web app học tiếng Anh, tiếng Trung, tiếng Nhật, tiếng Hàn với AI tutor cá nhân, luyện nói realtime, kiểm tra phát âm, lộ trình học cá nhân hóa, gamification, dashboard học tập, admin CMS, và data pipeline có kiểm chứng.

Mục tiêu MVP:

- Người học mới biết bắt đầu từ đâu sau onboarding và placement test.
- Người học có daily plan rõ ràng và lesson flow liên kết từ vựng, ngữ pháp, nghe, nói, đọc, viết.
- Người học có AI tutor riêng theo trình độ, mục tiêu, sở thích và lesson context.
- Người học luyện speaking với transcript, pronunciation feedback, và session report.
- Admin quản lý nội dung, nguồn dữ liệu, validation, user, moderation, subscription, audit log.
- Hệ thống có foundation để scale: module boundaries, validation, RBAC, AI abstraction, observability.

## 2. Target users

### Persona 1: Người học bận rộn

- Tuổi: 22-35.
- Mục tiêu: giao tiếp, công việc, phỏng vấn, du lịch.
- Nỗi đau: không đều, không biết học gì tiếp, ngại nói.
- Success: mở dashboard và biết bài tiếp theo; luyện nói 10 phút không áp lực.

### Persona 2: Người học thi chứng chỉ

- Mục tiêu: IELTS/TOEIC/TOEFL, JLPT, HSK, TOPIK.
- Nỗi đau: lộ trình rời rạc, thiếu review lỗi, thiếu tracking.
- Success: roadmap theo level, practice theo skill, error log và review queue.

### Persona 3: Người học nhập môn chữ viết mới

- Mục tiêu: kana/kanji, pinyin/tone, Hangul.
- Nỗi đau: phát âm và hệ chữ khó, không biết lỗi cụ thể.
- Success: bài học có âm, chữ, ví dụ, drill, feedback từng lỗi.

### Persona 4: Content editor/teacher

- Mục tiêu: tạo, sửa, duyệt nội dung.
- Nỗi đau: AI sinh nội dung chưa chắc đúng, khó track nguồn.
- Success: CMS có source, validation, quality score, review queue, rollback.

### Persona 5: Admin/operator

- Mục tiêu: vận hành user, moderation, subscription, analytics, AI cost.
- Nỗi đau: thiếu audit, thiếu quyền chi tiết, khó debug.
- Success: RBAC, audit log, dashboard metrics, alerting.

## 3. Jobs to be done

- Khi tôi mới bắt đầu học một ngôn ngữ, tôi muốn biết trình độ và lộ trình phù hợp để không học mò.
- Khi tôi học một bài, tôi muốn từ vựng, ngữ pháp, hội thoại và bài tập liên kết với nhau để nhớ trong ngữ cảnh.
- Khi tôi ngại nói, tôi muốn luyện với AI an toàn, có phản hồi cụ thể để tự tin hơn.
- Khi tôi phát âm sai, tôi muốn biết sai âm nào, từ nào, câu nào, và nên luyện drill gì.
- Khi tôi học đều, tôi muốn thấy streak, XP, tiến độ skill và điểm yếu để có động lực.
- Khi tôi là admin, tôi muốn kiểm soát nội dung, nguồn, validation và AI prompt để sản phẩm đáng tin.

## 4. Functional requirements

### A. Public Website

Requirements:

- Landing page premium, rõ product promise, CTA đăng ký và demo speaking.
- Trang từng ngôn ngữ: English, Chinese, Japanese, Korean.
- Pricing, testimonials, FAQ, blog SEO, policy pages.
- AI speaking demo page có transcript/sample report, ghi rõ nếu là demo/mock.
- SSR/SSG, metadata đầy đủ, JSON-LD, sitemap, robots, canonical.

Acceptance criteria:

- User có thể vào landing, chọn ngôn ngữ, xem pricing, đọc policy.
- Mỗi public page có title, description, OpenGraph, canonical.
- FAQ page có FAQ schema.
- Không có text trắng trên nền sáng gây khó đọc.

### B. Auth and User Profile

Requirements:

- Register/login email/password.
- Email verification.
- Forgot/reset password với token expiry.
- Optional social login sau MVP foundation.
- Optional 2FA foundation cho account settings.
- Profile: native language, target language, goals, initial level, weekly schedule, interests.
- Placement test shell theo language/level path.

Acceptance criteria:

- Password được hash bằng Argon2id hoặc bcrypt config mạnh.
- Login/register/reset có rate limit.
- Reset token dùng một lần, có expiry.
- Protected routes yêu cầu session hợp lệ.
- User chỉ đọc/sửa profile của chính mình.

### C. Learner Dashboard

Requirements:

- Overview progress theo target language.
- Daily goal, streak, XP, level.
- Skill map: vocabulary, grammar, listening, speaking, reading, writing.
- Recommended next lesson.
- Weakness analysis từ attempts/mistakes.
- Recent mistakes và review queue.
- AI tutor suggestions.

Acceptance criteria:

- Dashboard render loading, empty, error, success states.
- Nếu user mới, hiển thị onboarding/placement CTA thay vì data giả.
- Nếu có progress, hiển thị lesson tiếp theo và điểm yếu chính.
- Mobile dashboard không overlap text/charts.

### D. Course and Lesson System

Requirements:

- Course list theo language, level, goal.
- Module và lesson map.
- Lesson detail với typed blocks: vocabulary, grammar, dialogue, listening, speaking, reading, writing, quiz, flashcards.
- Exercise attempts và quiz attempts.
- SRS review queue.
- Contextual tasks theo tình huống thực tế.

Acceptance criteria:

- Published lesson bắt buộc có source/validation status.
- Lesson player lưu progress theo block.
- Quiz submit validate server-side.
- Flashcard review tạo SRSReview với next due date.

### E. AI Tutor Chat

Requirements:

- Chat tutor theo language, level, goal, lesson context, mistakes.
- Persona: friendly tutor, strict examiner, native speaker, business coach, travel buddy.
- Không đưa đáp án quá nhanh trong practice mode.
- Có Socratic mode, explanation mode, exam mode.
- Memory học tập user ở mức an toàn, có consent và deletion.
- Moderation và guardrails.
- Citation/learning note từ source allowlist cho kiến thức học tập.

Acceptance criteria:

- Mọi prompt production có prompt_id/version.
- AI response validate schema trước khi lưu/trả.
- AI không expose system prompt.
- Nếu hỏi ngoài phạm vi khi khóa scope, tutor chuyển hướng về học ngôn ngữ.
- AI cost được log theo request/session.

### F. Speaking Realtime

Requirements:

- WebRTC/LiveKit hoặc realtime audio streaming.
- User nói với AI, có transcript realtime.
- STT, intent understanding, response generation, TTS.
- Pronunciation scoring.
- Turn-taking và interrupt handling.
- Roleplay: phỏng vấn, gọi món, khách sạn, meeting, du lịch, lớp học, bạn bè.
- Session report: fluency, pronunciation, grammar, vocabulary, relevance, top mistakes, drills.

Acceptance criteria:

- Speaking room có device permission states.
- Nếu realtime provider lỗi, hiển thị fallback rõ ràng.
- Transcript sync theo turn.
- Report ghi rõ điểm nào mock/prototype nếu chưa nối provider thật.
- Audio retention tuân theo consent/retention policy.

### G. AI Personalized Learning Engine

Requirements:

- Generate learning plan theo language, level, goal, schedule.
- Weakness analysis từ mistakes/attempts/speaking/writing.
- Recommend next lesson.
- Generate drills từ lỗi cũ.
- Adjust difficulty theo performance.
- Content generation không publish thẳng, luôn vào validation queue.

Acceptance criteria:

- Recommendation có reason code.
- Generated exercise gắn source/taxonomy/validation status.
- Không dùng generated content chưa duyệt trong public/published lesson.
- Admin xem được AI output, validation result, quality score.

### H. Admin/CMS

Requirements:

- Admin dashboard.
- User management.
- Course, module, lesson, vocabulary, grammar, dialogue, quiz management.
- AI prompt template manager.
- Data source manager.
- Content validation queue.
- Moderation queue.
- Feedback and content error reports.
- Subscription management foundation.
- RBAC: super admin, content editor, teacher, support, analyst.
- Audit log.

Acceptance criteria:

- Admin routes server-protected.
- RBAC tested per permission.
- Mọi action create/update/delete quan trọng ghi audit log.
- Content publish bị chặn nếu validation policy không pass.

### I. Analytics

Requirements:

- DAU/MAU.
- Conversion funnel.
- Lesson completion.
- Speaking session duration.
- Retention/churn risk.
- Skill progress.
- AI cost.
- Error rate.
- Content quality score.

Acceptance criteria:

- Event taxonomy có version.
- PII không gửi vào analytics event.
- Admin/analyst có dashboard foundation.
- AI cost được aggregate theo provider/model/feature/user tier.

## 5. User stories

| ID     | Story                                                                             | Priority | Acceptance criteria                                       |
| ------ | --------------------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| US-001 | Là visitor, tôi muốn hiểu sản phẩm trong 30 giây để quyết định đăng ký            | P0       | Landing có clear headline, value props, CTA, demo section |
| US-002 | Là learner mới, tôi muốn chọn ngôn ngữ, mục tiêu, trình độ                        | P0       | Onboarding lưu profile và tạo learning plan draft         |
| US-003 | Là learner, tôi muốn làm placement test                                           | P0       | Test có question flow, score, recommended level           |
| US-004 | Là learner, tôi muốn thấy bài tiếp theo                                           | P0       | Dashboard có recommendation và reason                     |
| US-005 | Là learner, tôi muốn học lesson có nhiều block                                    | P0       | Lesson player render typed blocks và lưu progress         |
| US-006 | Là learner, tôi muốn chat với AI tutor theo bài đang học                          | P0       | AI nhận lesson context và user level                      |
| US-007 | Là learner, tôi muốn luyện roleplay bằng giọng nói                                | P1       | Speaking room có transcript và report                     |
| US-008 | Là learner, tôi muốn review lỗi cũ                                                | P1       | Mistake log và review queue hoạt động                     |
| US-009 | Là content editor, tôi muốn tạo lesson draft                                      | P0       | CMS tạo draft, chưa publish khi thiếu validation          |
| US-010 | Là editor, tôi muốn duyệt nguồn dữ liệu                                           | P0       | Source registry có license/risk/status                    |
| US-011 | Là admin, tôi muốn quản lý prompt template                                        | P1       | Prompt có version, schema, eval tests, approval           |
| US-012 | Là support, tôi muốn xem user issue mà không xem dữ liệu nhạy cảm không cần thiết | P1       | RBAC và redaction áp dụng                                 |

## 6. Non-functional requirements

Security:

- OWASP ASVS Level 2 baseline, nâng Level 3 cho admin/payment/audio/AI-sensitive areas khi phù hợp.
- Runtime validation cho mọi request.
- RBAC và object-level authorization.
- Secure cookies/session rotation hoặc refresh token rotation tùy auth strategy.
- Rate limit auth, AI, upload, speaking session endpoints.
- Audit log admin actions.

Privacy:

- PII minimization.
- Audio/chat retention rõ ràng.
- User có quyền xóa dữ liệu học tập cá nhân.
- Không dùng audio để train nếu chưa có consent.
- Logs masking cho PII, token, cookie, Authorization.

Performance:

- Public pages Lighthouse target: Performance >= 90 nếu có thể, Accessibility >= 95, Best Practices >= 95, SEO >= 95.
- Dashboard p95 API dưới 500ms cho cached/normal paths.
- AI chat p95 phụ thuộc provider nhưng phải track.
- Speaking target latency 800ms-1500ms nếu provider/network cho phép.

Accessibility:

- WCAG 2.2 AA target.
- Keyboard navigation.
- Visible focus.
- Screen reader labels.
- Color contrast AA.
- Form errors có text rõ, không chỉ màu.

Reliability:

- Health checks.
- Graceful degradation khi AI/STT/TTS provider lỗi.
- Queue retry cho jobs.
- Idempotency key cho payment và actions quan trọng.

Scalability:

- Stateless web/API where possible.
- PostgreSQL normalized core plus pgvector/Qdrant for vector workloads.
- Redis cache/queue.
- Object storage cho audio/image.
- Feature flags cho AI/speaking/admin.

## 7. Analytics events draft

| Event                        | Properties                                 | Privacy notes                                |
| ---------------------------- | ------------------------------------------ | -------------------------------------------- |
| `visitor_landing_viewed`     | locale, referrer_group                     | no PII                                       |
| `signup_started`             | method                                     | no password/email raw                        |
| `signup_completed`           | method, target_language                    | user_id pseudonymous                         |
| `onboarding_completed`       | target_language, goal, initial_level       | no free text interests unless categorized    |
| `placement_started`          | language                                   | no PII                                       |
| `placement_completed`        | language, recommended_level, score_band    | no question text if copyrighted              |
| `lesson_started`             | lesson_id, language, level                 | lesson IDs only                              |
| `lesson_completed`           | lesson_id, duration_seconds, score_band    | no raw answers in analytics                  |
| `ai_chat_message_sent`       | persona, language, lesson_id, token_band   | no message content                           |
| `speaking_session_started`   | roleplay_type, language, level             | no raw audio                                 |
| `speaking_session_completed` | duration_seconds, score_band               | no transcript in analytics                   |
| `flashcard_review_completed` | due_count, remembered_count                | aggregate only                               |
| `admin_content_published`    | content_type, validation_status            | admin ID in audit log, not product analytics |
| `ai_cost_recorded`           | provider, model_family, feature, cost_band | no prompt content                            |

## 8. Release scope

### MVP Alpha

- Docs and architecture.
- Web shell and design system.
- Auth/Profile/Onboarding.
- Dashboard shell.
- Course/lesson reader with sample legal content.
- AI tutor chat with provider abstraction and safety gates.
- Admin source/lesson/prompt foundation.

### MVP Beta

- Speaking room prototype.
- Pronunciation report mock-to-real architecture.
- Content validation workflow.
- SEO public pages.
- Analytics dashboard foundation.
- Security hardening.

### Public Launch Candidate

- Billing/pricing operational path.
- Legal policies complete.
- Production monitoring.
- Data deletion workflow.
- AI eval suite.
- Launch audit pass.

## 9. Screen requirements summary

Detailed UX spec will live in `UX_SPEC.md`. The MVP must cover:

1. Landing page.
2. Language selection.
3. Placement test.
4. Dashboard.
5. Course map.
6. Lesson player.
7. AI chat tutor.
8. Realtime speaking room.
9. Pronunciation report.
10. Flashcard review.
11. Writing correction.
12. Reading practice.
13. Listening practice.
14. Profile/settings.
15. Pricing/billing.
16. Admin dashboard.
17. CMS lesson editor.
18. AI prompt manager.
19. Data source manager.
20. Moderation queue.

For each screen:

- User goal.
- Primary components.
- Loading/empty/error/success states.
- Desktop layout.
- Mobile layout.
- Accessibility notes.
- SEO notes for public pages.

## 10. Done Criteria for PRD

- Product goals and target users are explicit.
- MVP modules have functional requirements and acceptance criteria.
- NFRs cover security, privacy, performance, accessibility, reliability, scalability.
- Analytics events avoid raw PII and raw learning content.
- Release scope is sliced into Alpha, Beta, Launch Candidate.

## 11. Enterprise PRD upgrade

Polyglot AI Academy is now enterprise-first. B2B/B2B2C workflows are not an extension; they are core requirements.

Enterprise functional requirements:

- Tenant onboarding and tenant branding.
- OIDC SSO and SAML bridge design.
- SCIM v1 user/group provisioning and deprovisioning.
- RBAC + ABAC with tenant/course/document context.
- Group, department, site and cohort management.
- Assignments for groups/cohorts with due dates and completion status.
- Manager/L&D analytics for adoption, completion, speaking outcomes and skill progress.
- Tenant glossary and tenant document registry.
- Tenant/site-specific AI agents with prompt/policy/eval governance.
- Data policy configuration: retention, export, data residency and feature flags.

Enterprise acceptance criteria:

- A tenant admin can configure users, groups, assignments and basic analytics.
- A learner only sees tenant-authorized content, assignments and agents.
- A manager can see cohort analytics without accessing raw sensitive audio/transcripts unless permission allows.
- A tenant agent cannot retrieve or answer from another tenant's documents.
- Cross-tenant access attempts are tested and denied.
- SCIM deprovisioning disables access and is audit logged.

Updated north-star metric:

- Weekly successful speaking minutes per active learner.

Enterprise KPIs:

- MAU by tenant.
- Assignment completion.
- Cohort progress.
- Manager dashboard usage.
- Speaking minutes by team.
- Rubric score delta.
- Expansion signal by tenant.
