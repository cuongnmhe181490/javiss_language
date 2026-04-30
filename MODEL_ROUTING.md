# Model Routing

See `MODEL_ROUTER.md` for the current PR-007 hardening contract, provider registry, fallback behavior, and acceptance gates. This file preserves the original pilot notes for historical context.

## Current Pilot

`apps/api/src/ai-model-router.ts` currently routes tutor replies to:

- provider: `mock`
- model: `mock-tutor-v1`
- capability: `tutor_reply`

Prompt-injection refusals use a synthetic route:

- provider: `policy`
- model: `policy-refusal`

This keeps local and CI behavior deterministic while establishing the contract for production routing.

## Routing Inputs

The router is designed to receive:

- `tenantId`
- active agent
- approved prompt version
- requested capability

Future routing may add tenant feature flags, data residency, model allow-list, cost budget, latency SLO, and provider health.

## Enterprise Rules

- Do not route outside a tenant's allowed provider/model policy.
- Do not route to a model without an approved prompt and output schema.
- Do not route sensitive tenant knowledge to a provider disallowed by data residency.
- Do not silently fall back across providers without audit metadata.
- Keep raw prompts and customer data out of logs and span attributes.

## Future Provider Matrix

The production matrix should evaluate:

- latency p95 and error rate
- cost per successful turn
- structured output reliability
- data residency and DPA terms
- tenant allow-list support
- model eval pass rate
- jailbreak and prompt-injection resilience
