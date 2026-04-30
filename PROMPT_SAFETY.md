# Prompt Safety

## Current State

PR-005 stores versioned prompt metadata and adds a deterministic prompt-injection refusal scaffold. It does not run a real model provider yet.

Current safety controls:

- `PromptVersion` stores `promptText`, `inputSchema`, `outputSchema`, `safetyRules`, and `evalStatus`.
- Tutor chat requires the prompt version to be `approved`.
- Learner APIs never return `promptText`.
- Mock provider refuses common prompt extraction and policy bypass patterns.
- Refused assistant messages persist `safetyFlags.refused=true`.
- Prompt and policy versions are persisted per assistant message.

## Prompt Versioning

Each agent points to:

- `promptVersion`
- `policyVersion`

Each prompt version has:

- purpose
- input schema
- output schema
- safety rules
- eval status
- creator/approver fields

Production rule: do not publish a prompt version unless it has an output schema and has passed eval gates.

## Prompt-Injection Handling

Current mock detection covers patterns such as:

- ignore previous instructions
- reveal/show hidden prompt
- system prompt extraction
- jailbreak
- policy bypass

This is only a scaffold. A real provider integration must add:

- model-side safety instructions
- input classification
- output validation
- retrieval-source allow-list
- tenant data exfiltration tests
- structured refusal reasons

PR-007 moves this check into `evaluateTutorPolicy`, so prompt-injection refusals happen before provider execution. The mock provider still keeps its own defensive check as a fallback, but service code no longer relies on provider-only safety.

## Grounding Rules

Tutor Coach responses must:

- stay within the current lesson/course context when context is provided
- cite lesson or lesson block sources
- give concise hints instead of full answer dumps
- avoid claiming tenant policy or handbook facts unless a Tenant Knowledge Agent is explicitly used later

PR-007 enforces basic grounding in `validateTutorProviderOutput`: when lesson context is present, non-refusal tutor output must include a citation for the active lesson.

## What Not To Log Or Return

Never log or return:

- system prompts
- developer prompts
- provider API keys
- auth tokens
- full tenant documents
- raw sensitive transcripts
- raw audio
- learner private analytics beyond authorized scope

## Eval Gate Before Real Provider

Minimum gate before enabling a real provider:

- prompt extraction tests
- jailbreak tests
- fake citation tests
- off-scope answer tests
- unsafe content tests
- lesson-level grounding tests
- cost and latency budget checks
- schema violation checks
- tenant data isolation tests

## Remaining Work

- Add an AI eval runner.
- Add prompt admin workflow.
- Add provider-specific moderation.
- Add tenant-level AI budget enforcement.
- Add AI call traces with redacted attributes.
- Add prompt release approval state transitions.
