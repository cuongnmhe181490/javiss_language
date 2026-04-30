# Polyglot AI Academy - Project Master Plan

## 1. Tầm nhìn sản phẩm

Polyglot AI Academy là nền tảng học ngôn ngữ bằng AI hướng tới chuẩn sản phẩm thương mại quốc tế: học có lộ trình, luyện nói realtime, phản hồi phát âm chi tiết, nội dung có nguồn kiểm chứng, và vận hành được như một doanh nghiệp EdTech nghiêm túc.

North Star:

- Giúp người học biết hôm nay cần học gì, luyện như thế nào, và tiến bộ ra sao.
- Biến luyện nói từ hoạt động gây ngại thành trải nghiệm thường ngày, an toàn, cá nhân hóa.
- Xây một nền tảng nội dung và AI có kiểm soát, không publish kiến thức chưa được xác thực.

Định vị:

- Premium SaaS + EdTech + AI companion.
- Không cạnh tranh bằng "nhiều bài học nhất", mà bằng chất lượng lộ trình, phản hồi AI, trải nghiệm speaking và độ tin cậy dữ liệu.
- Hỗ trợ ban đầu: English, Chinese, Japanese, Korean.

## 2. Phạm vi MVP có nền tảng mở rộng

MVP không phải demo. MVP phải đủ nền móng để mở rộng thành sản phẩm thật.

In scope cho giai đoạn đầu:

- Public website: landing, language pages, pricing, blog SEO, AI speaking demo, testimonials, FAQ, policy pages.
- Auth và learner profile: đăng ký, đăng nhập, verify email, reset password, profile học tập, mục tiêu, trình độ, placement test.
- Learner dashboard: progress, streak, XP, skill map, recommendation, weakness analysis, mistake queue.
- Course/Lesson core: course, module, lesson, vocab, grammar, dialogue, listening, speaking, reading, writing, quiz, flashcards, SRS.
- AI tutor chat: text tutor theo ngữ cảnh bài học, persona, memory, guardrails, citations/learning notes.
- Speaking room prototype: realtime audio architecture, transcript sync, pronunciation scoring interface, session report.
- Admin/CMS foundation: RBAC, audit log, user/course/lesson/source/validation/moderation/subscription foundations.
- Data source registry và content validation workflow.
- Observability, security baseline, SEO foundation.

Out of scope cho MVP đầu:

- Native mobile apps.
- Marketplace giáo viên.
- Full payment reconciliation đa quốc gia.
- AI model tự huấn luyện từ audio người dùng.
- Certification chính thức thay thế IELTS/JLPT/HSK/TOPIK.
- Offline-first learning.

## 3. Nguyên tắc sản phẩm

- Data hợp pháp trước, nội dung nhiều sau.
- AI phải có ranh giới: schema output, moderation, source allowlist, prompt versioning, cost tracking.
- Mọi hành động admin quan trọng phải có RBAC và audit log.
- UI phải bán được: responsive, accessible, dark/light, không dùng placeholder vô nghĩa.
- Backend không tin frontend: validate runtime, object-level authorization, rate limit, logs có redaction.
- Mock data phải được ghi rõ là mock và có đường thay thế bằng dữ liệu thật.

## 4. Vai trò đội ngũ

| Vai trò            | Trách nhiệm chính                         | Deliverable                          |
| ------------------ | ----------------------------------------- | ------------------------------------ |
| CEO                | Vision, thị trường, chiến lược thương mại | Positioning, milestone, go-to-market |
| CTO                | Kiến trúc, scale, engineering governance  | Architecture, quality gates          |
| CPO                | Product strategy, UX value proposition    | PRD, roadmap                         |
| Product Manager    | Scope, backlog, release plan              | User stories, acceptance criteria    |
| Business Analyst   | Domain model, process, metrics            | Entity model, analytics events       |
| Solution Architect | System design, integration contracts      | Diagrams, API boundaries             |
| UI/UX Director     | IA, flows, interaction model              | UX spec, high-fidelity direction     |
| Design System Lead | Tokens, components, accessibility         | Design system                        |
| Frontend Lead      | Next.js architecture, UI implementation   | Web app shell, components            |
| Backend Lead       | API, database, domain services            | NestJS/API modules, Prisma           |
| AI Engineer        | Tutor, speaking, RAG, evals               | AI service contracts, prompts        |
| Data Engineer      | Ingestion, validation, content quality    | Data pipeline, source registry       |
| DevSecOps          | CI/CD, infra, observability               | Deployment, monitoring, secrets      |
| QA Lead            | Test strategy, release gates              | Test plan, E2E, QA checklist         |
| Security Engineer  | Threat model, controls, audits            | Security plan, hardening backlog     |
| SEO Lead           | Public content and technical SEO          | SEO plan, schema, sitemap            |
| Legal/Compliance   | Privacy, license, consent                 | Policies, data source review         |
| Technical Writer   | Product docs, admin docs, changelog       | Documentation set                    |

## 5. PR plan

### PR-001: Foundation and docs

Objective:

- Khóa vision, PRD, architecture, security, data strategy, folder structure.

Files changed:

- `PROJECT_MASTER_PLAN.md`
- `PRD.md`
- `ARCHITECTURE.md`
- `DATA_STRATEGY.md`
- `SECURITY.md`
- `FOLDER_STRUCTURE.md`

Implementation notes:

- Chưa scaffold code.
- Chốt stack đề xuất: monorepo TypeScript, Next.js App Router, NestJS API, PostgreSQL, Prisma, Redis, BullMQ, object storage, provider abstraction cho AI/STT/TTS.

Tests:

- Review checklist nội dung.
- Kiểm tra không có secret, không claim nguồn dữ liệu chưa rõ license.

Risks:

- Scope lớn, cần chia milestone nhỏ.

Rollback plan:

- Revert tài liệu PR-001, không ảnh hưởng code runtime.

Done Criteria:

- 6 tài liệu nền tảng tồn tại.
- Có PR roadmap, phase plan, risk register, stack decision, security/data stance.

### PR-002: Design system and layout

Objective:

- Khởi tạo web shell, design tokens, UI primitives, responsive layout, dark/light mode.

Files changed dự kiến:

- `apps/web/src/app/*`
- `apps/web/src/components/ui/*`
- `apps/web/src/components/layout/*`
- `packages/design-tokens/*`
- `packages/ui/*`

Implementation notes:

- Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Framer Motion.
- Component variants: Button, Input, Select, Modal, Toast, Card, ChatBubble, VoiceWaveform, ProgressRing, AdminTable.

Tests:

- Typecheck, lint, component smoke tests, accessibility scan.

Risks:

- UI quá trang trí làm giảm usability.

Rollback plan:

- Revert design shell và token package.

Done Criteria:

- Public layout và app shell render tốt desktop/tablet/mobile.
- Theme switch hoạt động.
- Không có contrast issue rõ ràng.

### PR-003: Auth and user profile

Objective:

- Auth nền tảng, learner profile, onboarding, placement test shell.

Files changed dự kiến:

- `apps/api/src/modules/auth/*`
- `apps/api/src/modules/users/*`
- `apps/web/src/features/auth/*`
- `apps/web/src/features/onboarding/*`
- `packages/contracts/src/auth/*`

Implementation notes:

- Password hash Argon2id hoặc bcrypt config mạnh.
- Email verification, reset token expiry, refresh/session rotation.
- Optional 2FA interface.

Tests:

- Unit auth service, integration auth API, rate limit tests, object-level auth tests.

Risks:

- Social login scope creep.

Rollback plan:

- Disable social login, giữ email/password secure baseline.

Done Criteria:

- Register/login/reset/verify chạy được.
- Protected routes không truy cập được khi unauthenticated.

### PR-004: Course and lesson core

Objective:

- Course, lesson, exercise, attempt, SRS, progress.

Files changed dự kiến:

- `apps/api/src/modules/courses/*`
- `apps/api/src/modules/lessons/*`
- `apps/api/src/modules/progress/*`
- `apps/web/src/features/courses/*`
- `apps/web/src/features/lesson-player/*`

Implementation notes:

- LessonBlock typed union.
- Every published content item must have `source_id` and validation status.

Tests:

- API contract tests, lesson player E2E, SRS scheduling tests.

Risks:

- Domain model rộng, cần giữ MVP slice rõ.

Rollback plan:

- Disable publishing flow, giữ draft-only content.

Done Criteria:

- Learner xem course map, mở lesson, làm quiz, lưu progress.

### PR-005: AI tutor chat

Objective:

- Chat tutor theo persona, lesson context, memory, moderation, prompt versioning.

Files changed dự kiến:

- `apps/api/src/modules/ai-chat/*`
- `apps/api/src/modules/ai-safety/*`
- `packages/ai-core/*`
- `apps/web/src/features/ai-tutor/*`

Implementation notes:

- Provider abstraction, no hard-code provider.
- Output schema validation.
- Citation/learning note chỉ từ source allowlist.

Tests:

- Prompt evals, safety cases, schema validation, cost tracking.

Risks:

- Prompt injection và hallucination.

Rollback plan:

- Feature flag AI chat hoặc chuyển sang read-only tutor mode.

Done Criteria:

- Chat dùng được theo lesson context, không expose system prompt, có moderation và cost log.

### PR-006: Speaking realtime

Objective:

- Realtime speaking room prototype có transcript, turn-taking, report.

Files changed dự kiến:

- `apps/realtime/*`
- `apps/api/src/modules/speaking/*`
- `packages/realtime-contracts/*`
- `apps/web/src/features/speaking-room/*`

Implementation notes:

- Ưu tiên LiveKit/WebRTC gateway.
- STT/TTS/pronunciation provider abstraction.
- Latency target thiết kế: 800ms-1500ms nếu provider và network cho phép.

Tests:

- WebSocket/WebRTC contract tests, session report tests, fallback state tests.

Risks:

- Latency và provider cost.

Rollback plan:

- Degrade to push-to-talk audio upload plus async report.

Done Criteria:

- User có thể vào speaking room prototype, thấy transcript, nhận report có điểm mock-to-real rõ ràng.

### PR-007: Admin CMS

Objective:

- Admin shell, RBAC, audit log, lesson editor, prompt manager, data source manager, moderation queue.

Files changed dự kiến:

- `apps/web/src/app/(admin)/*`
- `apps/api/src/modules/admin/*`
- `apps/api/src/modules/audit/*`
- `apps/api/src/modules/content-validation/*`

Implementation notes:

- Super admin, content editor, teacher, support, analyst.
- Admin routes server-protected, not only UI-hidden.

Tests:

- RBAC matrix tests, audit log tests, editor workflow E2E.

Risks:

- Admin permissions phức tạp.

Rollback plan:

- Lock admin to super admin only.

Done Criteria:

- Admin CRUD core content, prompt template, source registry, validation queue.

### PR-008: Data pipeline

Objective:

- Ingest, normalize, deduplicate, license check, level estimation, validation queue.

Files changed dự kiến:

- `apps/worker/src/jobs/content-ingest/*`
- `apps/api/src/modules/content-source/*`
- `apps/api/src/modules/content-validation/*`
- `packages/data-pipeline/*`

Implementation notes:

- Không scrape trái phép.
- Publish content only after validation policy passes.

Tests:

- Fixture ingestion tests, license gate tests, duplicate detection tests.

Risks:

- License ambiguity for Korean datasets.

Rollback plan:

- Mark ambiguous sources as blocked, use only internally created reviewed content.

Done Criteria:

- Có source registry, validation records, publish workflow versioned.

### PR-009: Security hardening

Objective:

- OWASP-aligned hardening, SAST/dependency/secret scanning, headers, rate limits, CSRF, upload restrictions.

Files changed dự kiến:

- `.github/workflows/*`
- `apps/api/src/common/security/*`
- `apps/web/next.config.*`
- `infra/*`

Implementation notes:

- ASVS Level 2 as baseline, Level 3 for admin/payment/audio/AI sensitive areas where feasible.

Tests:

- Security test suite, dependency scan, secret scan, DAST smoke.

Risks:

- CSP có thể làm hỏng third-party integrations.

Rollback plan:

- CSP report-only trước enforce.

Done Criteria:

- Security checklist pass cho MVP gate.

### PR-010: SEO and launch audit

Objective:

- Public SEO pages, JSON-LD, sitemap, robots, Core Web Vitals, launch checklist.

Files changed dự kiến:

- `apps/web/src/app/(public)/*`
- `apps/web/src/lib/seo/*`
- `apps/web/public/*`
- `SEO_PLAN.md`
- `DEPLOYMENT.md`

Implementation notes:

- SSR/SSG cho public pages.
- Blog CMS-ready content model.

Tests:

- Lighthouse, metadata snapshot tests, schema validation.

Risks:

- SEO pages nhiều nhưng nội dung chưa đủ depth.

Rollback plan:

- Launch limited set: landing, language pages, pricing, policies.

Done Criteria:

- Public pages đạt SEO/accessibility targets gần mức yêu cầu.

## 6. Phase plan

### Phase 0: Discovery

Activities:

- Vision, target users, competitor assumptions, legal/data constraints, success metrics.
- Risk list: AI accuracy, licensing, realtime latency, privacy, cost, security.

Deliverables:

- Project master plan.
- Initial market positioning.
- Initial risk register.

Done Criteria:

- Stakeholders đồng ý target user, product promise, non-negotiables về data/security.

### Phase 1: Product Requirement Document

Activities:

- Personas, JTBD, user stories, acceptance criteria, analytics events.
- Release scope for MVP and next releases.

Deliverables:

- `PRD.md`
- Analytics taxonomy draft.

Done Criteria:

- Mỗi module MVP có user story và acceptance criteria.
- NFR được định nghĩa: security, performance, accessibility, AI safety.

### Phase 2: UX Research and Design

Activities:

- IA, user flows, wireframes, design system, high-fidelity screens, prototype, design QA.

Deliverables:

- `UX_SPEC.md`
- `DESIGN_SYSTEM.md`

Done Criteria:

- 20 màn hình chính có mục tiêu, component, states, desktop/mobile, accessibility notes.
- Design tokens và component variants đủ cho MVP.

### Phase 3: Technical Architecture

Activities:

- System, database, API, AI, realtime, security, deployment, observability design.

Deliverables:

- `ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- `API_SPEC.md`
- `SECURITY.md`
- `DATA_STRATEGY.md`

Done Criteria:

- Architecture có diagram, module boundary, scaling path, failure modes.
- Data model có retention và privacy rules.

### Phase 4: Implementation

Activities:

- Repo setup, lint/typecheck/test, frontend shell, auth, DB, course, AI chat, speaking, admin, analytics, SEO.

Deliverables:

- Codebase monorepo.
- CI baseline.
- Feature implementations theo PR plan.

Done Criteria:

- Build, typecheck, lint, unit tests pass.
- MVP flows chạy từ landing tới dashboard, lesson, chat/speaking prototype, admin workflow.

### Phase 5: Testing

Activities:

- Unit, integration, E2E, API, security, accessibility, performance, AI eval, data quality, mobile responsive.

Deliverables:

- `TEST_PLAN.md`
- Test suites.
- QA report.

Done Criteria:

- No critical/high release blocker.
- Auth/RBAC/object-level access tested.
- AI safety core cases tested.

### Phase 6: Pre-release Audit

Activities:

- UX, security, SEO, performance, legal/data source, AI safety, admin workflow, backup/restore.

Deliverables:

- Audit report.
- Release readiness checklist.

Done Criteria:

- Security, privacy, data license, and AI safety sign-off.
- Rollback and incident playbook ready.

### Phase 7: Launch

Activities:

- Staging, production, monitoring, alerting, rollout, rollback rehearsal.

Deliverables:

- Production deployment.
- Launch checklist.

Done Criteria:

- Production health checks green.
- Monitoring and incident contacts active.

### Phase 8: Post-launch

Activities:

- Bug triage, user feedback, funnel analysis, AI cost optimization, content improvement, security patching.

Deliverables:

- Weekly quality report.
- Roadmap update.

Done Criteria:

- Weekly metrics tracked.
- Top issues triaged and assigned.

## 7. Timeline đề xuất

| Tuần  | Milestone                   | Output |
| ----- | --------------------------- | ------ |
| 1     | Foundation docs             | PR-001 |
| 2-3   | Design system and app shell | PR-002 |
| 4-5   | Auth, onboarding, profile   | PR-003 |
| 6-8   | Course/lesson core          | PR-004 |
| 9-10  | AI tutor chat               | PR-005 |
| 11-12 | Speaking prototype          | PR-006 |
| 13    | Admin CMS foundation        | PR-007 |
| 14    | Data pipeline foundation    | PR-008 |
| 15    | Security hardening          | PR-009 |
| 16    | SEO, launch audit, staging  | PR-010 |

## 8. Success metrics

Product:

- Activation: user hoàn thành onboarding và lesson đầu tiên.
- Speaking activation: user hoàn thành phiên speaking đầu tiên.
- D7 retention.
- Lesson completion rate.
- Review queue completion.
- Streak continuation.

Learning:

- Skill progress theo level.
- Mistake recurrence reduction.
- Pronunciation score trend.
- Placement-to-plan accuracy feedback.

Business:

- Visitor-to-signup conversion.
- Trial-to-paid conversion.
- CAC by SEO content cluster.
- Churn risk signals.

AI/Infra:

- AI cost per active learner.
- Chat p95 latency.
- Speaking turn latency.
- STT/TTS error rate.
- Moderation block/flag rate.

Security/Data:

- Number of unresolved high severity findings.
- Published content with source and validation coverage.
- PII/log redaction coverage.
- Data deletion SLA.

## 9. Risk register

| Risk                                              | Severity | Mitigation                                                                  | Owner             |
| ------------------------------------------------- | -------- | --------------------------------------------------------------------------- | ----------------- |
| AI hallucination trong kiến thức ngữ pháp/từ vựng | High     | RAG allowlist, source citation, schema validation, human review             | AI Engineer       |
| Prompt injection vào tutor/chat                   | High     | Instruction/data separation, tool boundaries, output validation, eval suite | Security Engineer |
| Dữ liệu học tập không rõ license                  | High     | Source registry, legal review, block publish nếu thiếu license              | Legal/Compliance  |
| Realtime speaking latency cao                     | High     | LiveKit/WebRTC gateway, streaming STT/TTS, graceful fallback                | CTO               |
| Audio chứa PII                                    | High     | Consent, retention policy, encryption, deletion controls                    | Security Engineer |
| Admin route bị hở                                 | Critical | Server-side RBAC, object-level auth, audit log, tests                       | Backend Lead      |
| Scope creep                                       | Medium   | PR slicing, feature flags, release scope lock                               | Product Manager   |
| AI cost tăng nhanh                                | Medium   | Cost tracking, quotas, caching safe, model routing                          | AI Engineer       |
| UI đẹp nhưng khó dùng                             | Medium   | UX QA, accessibility review, task-based testing                             | UI/UX Director    |
| SEO content mỏng                                  | Medium   | Content strategy by clusters, expert review                                 | SEO Lead          |

## 10. Governance và cadence

- Weekly product review: scope, risks, metrics.
- Weekly engineering review: architecture, quality gates, incidents.
- Design QA trước merge những màn hình chính.
- Security review trước merge auth/admin/payment/AI/tooling changes.
- Data review trước publish content mới.
- AI prompt review: prompt template versioning, eval tests, approval.

## 11. Release quality gate

Không release nếu còn:

- Critical/high security issue chưa có mitigation.
- Admin route hoặc protected API chưa có authz test.
- Nội dung published thiếu source hoặc validation status.
- AI prompt production chưa versioned/evaluated.
- Public pages thiếu metadata/canonical/robots/sitemap.
- Build/typecheck/lint fail.
- Mobile layout vỡ ở core flows.

## 12. Next deliverables sau PR-001

- `UX_SPEC.md`
- `DESIGN_SYSTEM.md`
- `API_SPEC.md`
- `DATABASE_SCHEMA.md`
- `TEST_PLAN.md`
- `SEO_PLAN.md`
- `DEPLOYMENT.md`
- Code scaffold theo `FOLDER_STRUCTURE.md`

## 13. Enterprise-grade addendum

The project is now scoped as enterprise-grade SaaS first, with B2B/B2B2C prioritized before B2C self-serve. The platform must be designed for companies, schools, training centers, hospitality, customer support, sales teams, cross-border workforce and international organizations.

Updated priority rule:

1. Speaking outcome.
2. Enterprise adoption.
3. Trust/safety.
4. Content quality.
5. Analytics visibility.

Enterprise contract blockers:

- Multi-tenant isolation.
- Tenant branding.
- Tenant-specific glossary.
- Tenant-specific AI agents.
- OIDC SSO, SAML bridge where needed, SCIM provisioning.
- RBAC + ABAC.
- Audit log.
- Cohort analytics.
- Manager/L&D dashboard.
- Assignments by group/department/cohort.
- Data residency configuration.
- Exportable reports.
- Feature flags by tenant.

Updated PR order:

| PR     | Scope                                     | Key docs/code                                                                                                 |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| PR-001 | Foundation docs + enterprise architecture | `PROJECT_MASTER_PLAN.md`, `PRD.md`, `ENTERPRISE_REQUIREMENTS.md`, `ARCHITECTURE.md`, `TENANT_ARCHITECTURE.md` |
| PR-002 | Design system + IA                        | `DESIGN_SYSTEM.md`, `UX_SPEC.md`, responsive layouts, WCAG 2.2 AA, CJK/i18n rules                             |
| PR-003 | Auth + tenant core                        | OAuth/OIDC, tenant model, RBAC/ABAC, audit log, session security, admin shell                                 |
| PR-004 | Course/Lesson/Progress core               | course, lesson, progress, assignments, learner dashboard                                                      |
| PR-005 | Speaking realtime architecture            | WebRTC/SFU, realtime token, transcript stream, text fallback, synthetic tests                                 |
| PR-006 | AI orchestration                          | model router, policy layer, prompt versioning, agent scopes, cost tracking                                    |
| PR-007 | Content Studio + data pipeline            | source registry, license validation, AI QA, human review, publish/rollback                                    |
| PR-008 | Enterprise admin                          | SSO config, group management, cohort analytics, assignments, glossary, tenant agents                          |
| PR-009 | Security hardening                        | OWASP ASVS 5.0.0, OWASP LLM Top 10, threat model, SAST/DAST/SCA, cross-tenant tests                           |
| PR-010 | Observability + launch readiness          | OpenTelemetry, SLO, runbooks, canary, rollback, post-launch review                                            |

Enterprise phase done criteria:

- Product: user journey, acceptance criteria and measurable metrics exist.
- UX: desktop/tablet/mobile, states, accessibility checklist and CJK/i18n checks exist.
- Engineering: typecheck, lint, build and tests pass; no hard-coded secrets.
- Security: authz, cross-tenant, admin protection, audit, rate limits and validation are tested.
- AI: prompts are versioned, outputs schema-validated, eval cases pass, tools are allow-listed, cost is tracked.
- Data: source license, lineage, human review and rollback exist.
- Ops: logs, metrics, traces, alerts, runbooks and rollback plan exist.
