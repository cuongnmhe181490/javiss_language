# Polyglot AI Academy - Design System

## 1. Design thesis

Premium enterprise EdTech with calm Japanese minimalism, restrained liquid glass, high readability, and task-first SaaS density. The interface should feel trustworthy enough for enterprise procurement and warm enough for daily learner use.

Design priorities:

- Speaking outcome first.
- Enterprise adoption second.
- Trust and safety always visible through clarity, not fear.
- Content quality and analytics are operational surfaces, not decorative dashboards.

## 2. Accessibility baseline

Target:

- WCAG 2.2 AA.
- Minimum hit area: 44x44px.
- Visible focus ring.
- Keyboard navigation for all controls.
- Captions/transcripts for audio.
- Reduced motion support.
- Color is never the only status signal.
- Dialog, tabs, select/listbox follow expected keyboard maps.

## 3. Responsive breakpoints

| Breakpoint   | Width       | Product behavior                                              |
| ------------ | ----------- | ------------------------------------------------------------- |
| Mobile       | 360-767px   | Bottom nav 4 tabs, speaking full-screen, chat as bottom sheet |
| Tablet       | 768-1023px  | 30/70 split, transcript/feedback side panel can collapse      |
| Desktop      | 1024-1439px | Fixed left nav, main learning canvas, right insights panel    |
| Wide desktop | >=1440px    | 12-column dashboards, analytics and authoring side-by-side    |

Screens requiring designed responsive variants:

- Learner home dashboard.
- Lesson player.
- Speaking session.
- AI tutor chat.
- Pronunciation report.
- Admin analytics.
- Content Studio.
- Tenant Agent Manager.
- Source Registry.
- Audit Log.

## 4. Color tokens

Use multi-hue restraint, not a one-note palette.

| Token        | Light             | Dark           | Use                      |
| ------------ | ----------------- | -------------- | ------------------------ |
| `background` | warm paper        | deep ink       | app background           |
| `foreground` | ink               | warm white     | primary text             |
| `primary`    | enterprise indigo | mint-teal      | main action/focus        |
| `secondary`  | quiet cyan gray   | deep blue gray | secondary surfaces       |
| `accent`     | soft gold         | muted gold     | highlights, not main CTA |
| `success`    | jade              | jade           | success                  |
| `warning`    | amber             | amber          | warnings                 |
| `danger`     | red               | red            | destructive              |
| `border`     | cool gray         | white/12       | dividers                 |

Implementation:

- CSS variables live in `apps/web/src/app/globals.css`.
- Shared token constants live in `packages/design-tokens`.
- Tenant branding maps into safe token slots and must pass contrast checks.

## 5. Typography

Fonts:

- Geist Sans for UI.
- Geist Mono for codes, timestamps, IDs, metrics.
- CJK fallback stack must include system CJK fonts.

Scale:

| Token   | Size    | Use                     |
| ------- | ------- | ----------------------- |
| xs      | 12px    | captions, helper labels |
| sm      | 14px    | table cells, compact UI |
| base    | 16px    | body                    |
| lg      | 18px    | lead body               |
| xl      | 20px    | panel headings          |
| 2xl     | 24px    | section headings        |
| 3xl     | 30px    | app page heading        |
| 4xl-6xl | 36-60px | public hero only        |

Rules:

- Letter spacing is 0 for body and headings.
- Do not scale font size with viewport width.
- Compact panels use compact headings.
- Long CJK text uses larger line-height than Latin text.

## 6. Spacing, radius, shadow

Spacing:

- 4px base grid.
- Product UI density: 16/24px section rhythm.
- Marketing/public pages: 48/80px section rhythm.

Radius:

- Default: 8px.
- Compact controls: 6-8px.
- Do not use large rounded pills unless the control benefits from it.

Shadow:

- Soft and rare.
- Prefer borders, spacing, and elevation tokens.
- Glass panels use blur and subtle border, not heavy glow.

## 7. Component inventory

Core:

- Button.
- Input.
- Textarea.
- Select.
- Tabs.
- Modal/Dialog.
- Sheet.
- Toast/Sonner.
- Card.
- Table.
- Badge.
- Tooltip.
- Skeleton.
- Alert.
- Progress.

Product-specific:

- LessonCard.
- CourseCard.
- ChatBubble.
- VoiceWaveform.
- VuMeter.
- ProgressRing.
- SkillBadge.
- AiTutorAvatar.
- PronunciationScoreBar.
- TranscriptLine.
- FeedbackItem.
- AdminTable.
- DataQualityBadge.
- TenantSwitcher.
- AssignmentStatusBadge.
- AgentStatusBadge.
- SourceRiskBadge.
- AuditEventRow.

## 8. Component rules

Button:

- Use icon buttons for familiar tool actions.
- Text buttons only for clear commands.
- All icon-only buttons require tooltip/aria-label.

Input:

- Label is always visible.
- Error state includes text, not only color.
- IME input must not submit prematurely for CJK.

Card:

- Use for repeated items, dialogs, or framed tools.
- Avoid nested cards.
- Do not turn every page section into a card.

ChatBubble:

- Distinguish learner, AI, system, and safety messages.
- Long AI replies are chunked.
- Show source note when grounded.

VoiceWaveform/VuMeter:

- Stable dimensions.
- Reduced motion mode uses static bars and text status.
- Must not shift layout while recording.

AdminTable:

- Sticky header where useful.
- Row actions via dropdown.
- Status badges have text + icon.
- Export action is permission-gated.

DataQualityBadge:

- Shows score band and reason.
- Color plus text label.
- Links to validation history for admins.

## 9. CJK and i18n rules

Support:

- ICU message formatting.
- Pluralization.
- Date/time/number formatting by locale.
- IME composition for Chinese/Japanese/Korean.
- Font fallback for Han/Kana/Hangul.
- CJK line-height and wrapping rules.
- Furigana for Japanese.
- Pinyin for Chinese.
- Optional romanization for Korean/Japanese/Chinese.

Transcript stored as:

- raw text.
- normalized text.
- romanization.
- language tag.
- grammar tag.
- level tag.
- TTS voice profile.

## 10. States

Every core screen must define:

- Loading skeleton.
- Empty state.
- Error state.
- Success state.
- Permission denied state.
- Offline/weak-network state for speaking.

Enterprise-specific states:

- Tenant feature disabled.
- SSO required.
- SCIM sync pending.
- Content waiting for review.
- Data export pending.
- Data residency unavailable for selected feature.

## 11. Design System Done Criteria

- Tokens cover color, type, spacing, radius, shadow, glass.
- Components cover learner, speaking, admin, content and data workflows.
- Responsive rules are specific by breakpoint.
- Accessibility and CJK/i18n rules are explicit.
- Tenant branding is constrained by contrast and token safety.
