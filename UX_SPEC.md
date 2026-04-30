# Polyglot AI Academy - UX Specification

## 1. UX principles

- Start from the user job, not the component.
- Speaking is a guided loop, never an empty chatbot.
- Enterprise admin flows must show status, ownership, auditability, and exportability.
- Content workflows must make source, license, validation, and publish state visible.
- Mobile speaking must feel native and resilient.

## 2. Information architecture

Learner:

- Learn: roadmap, courses, lessons.
- Speak: drills, roleplay, pronunciation lab.
- AI Coach: chat tutor, summary, next step.
- Review: transcript, repeated mistakes, weak vocabulary, flashcards.
- Exams & Levels: CEFR/JLPT/HSK/TOPIK mapping.
- Profile: goal, level, language, privacy settings.

Enterprise:

- Admin: tenant, SSO, users, groups, roles.
- Assignments: courses/paths for teams.
- Analytics: adoption, completion, speaking outcomes.
- Agents: tenant/site-specific AI agents.
- Glossary: internal terms.
- Data Policy: retention, export, residency.

Content:

- Content Studio.
- Source Registry.
- Review Queue.
- Rubric Manager.
- Prompt Manager.

## 3. Responsive behavior

Mobile 360-767px:

- Bottom nav: Learn, Speak, Coach, Review.
- Speaking is full-screen.
- Chat opens as bottom sheet.
- Admin tables become searchable lists.

Tablet 768-1023px:

- 30/70 split where appropriate.
- Transcript/feedback side panel can collapse.
- Content editor preview can switch tabs.

Desktop 1024-1439px:

- Fixed left nav.
- Main canvas.
- Right insight panel.

Wide desktop >=1440px:

- 12-column dashboard.
- Analytics and authoring side-by-side.
- Audit log with filters and detail drawer.

## 4. Screen specs

### 4.1 Learner Home Dashboard

Goal:

- Show what to do next and why.

Components:

- Daily goal.
- Assigned path.
- Recommended lesson.
- Speaking minutes.
- Streak/XP.
- Weakness analysis.
- Review queue.

States:

- Loading: dashboard skeleton.
- Empty: onboarding/placement CTA.
- Error: retry and support message.
- Success: next action prominent.

Accessibility:

- Progress has text labels.
- Cards are keyboard reachable only when actionable.

### 4.2 Lesson Player

Goal:

- Complete a lesson with connected vocab, grammar, listening, speaking, reading, writing, quiz.

Components:

- Lesson outline.
- Block renderer.
- Inline AI hint.
- Progress rail.
- Notes/mistakes panel.

Responsive:

- Mobile: one block at a time.
- Desktop: lesson canvas + right insights.

### 4.3 Speaking Session

Goal:

- Practice a scenario with realtime AI and targeted correction.

Components:

- Scenario context.
- Mic state.
- VU meter.
- Partial transcript.
- AI voice transcript.
- Try again button.
- Network status.
- Text fallback.

States:

- Mic permission pending/denied.
- Connecting.
- Listening.
- Thinking.
- Speaking.
- Weak network.
- Session saved.

### 4.4 AI Tutor Chat

Goal:

- Get level-appropriate guidance within lesson/course scope.

Components:

- Persona selector.
- Chat thread.
- Source notes.
- Suggested prompts.
- Scope indicator.

Rules:

- Does not give answer too early in practice mode.
- Tenant Knowledge Agent shows source scope.

### 4.5 Pronunciation Report

Goal:

- Understand top mistakes and next drills.

Components:

- Fluency score.
- Pronunciation score.
- Grammar score.
- Vocabulary score.
- Relevance score.
- Top repeated mistakes.
- Drill recommendations.
- Replay and compare sample.

### 4.6 Flashcard Review

Goal:

- Review weak terms with SRS.

Components:

- Card.
- Audio.
- Romanization/furigana/pinyin where applicable.
- Remember/again controls.
- Due queue.

### 4.7 Writing Correction

Goal:

- Improve user writing without replacing user effort.

Components:

- Prompt.
- Editor.
- Correction diff.
- Explanation by level.
- Natural expression suggestion.

### 4.8 Admin Analytics

Goal:

- Show adoption, completion, speaking outcomes by tenant/cohort/group.

Components:

- Tenant filter.
- Cohort selector.
- Assignment completion.
- Speaking minutes.
- Rubric score delta.
- Export.

### 4.9 Content Studio

Goal:

- Author, validate, review, publish, and roll back content.

Components:

- Editor.
- Source panel.
- Validation panel.
- Version history.
- Preview.
- Review workflow.

### 4.10 Tenant Agent Manager

Goal:

- Configure tenant/site-specific agents safely.

Components:

- Agent list.
- Scope editor.
- Tool allow-list.
- Prompt version.
- Policy version.
- Eval status.
- Audit history.

### 4.11 Source Registry

Goal:

- Track source license, allowed usage, lineage, risk.

Components:

- Source table.
- Risk badge.
- License details.
- Allowed usage.
- Review dates.
- Import history.

### 4.12 Audit Log

Goal:

- Investigate sensitive admin/security actions.

Components:

- Filters.
- Timeline/table.
- Before/after drawer.
- Actor/resource metadata.
- Export gated by step-up MFA.

## 5. Speaking weak-network UX

If network is weak:

- Show clear status.
- Reduce visual motion.
- Lower bitrate.
- Keep transcript.
- Offer text fallback.
- Preserve session state.
- Let user retry last turn.

## 6. Accessibility checklist per screen

- Keyboard path is complete.
- Focus state visible.
- Screen reader labels for icon controls.
- Captions/transcripts for audio.
- Error text is explicit.
- Motion respects `prefers-reduced-motion`.
- Hit areas are at least 44x44px.
- No color-only signals.

## 7. UX Done Criteria

- Learner, enterprise, and content IA are represented.
- Required enterprise screens have goals, components, states and responsive behavior.
- Speaking loop is explicit and resilient.
- Accessibility and CJK/i18n constraints are included.
