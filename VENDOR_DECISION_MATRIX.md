# Polyglot AI Academy - Vendor Decision Matrix

## 1. Vendor strategy

The platform must avoid hard-coding a single provider into product logic. Vendors are selected behind abstraction layers with cost, latency, quality, compliance, region, and enterprise support as explicit criteria.

Provider categories:

- LLM.
- STT.
- TTS.
- Pronunciation scoring.
- Realtime media/SFU.
- Hosting.
- Database.
- Redis/queue.
- Object storage.
- Observability.
- Email.
- Payment.

## 2. Selection criteria

Weighted criteria:

| Criterion                    | Weight | Notes                                  |
| ---------------------------- | -----: | -------------------------------------- |
| Quality for target languages |     20 | EN/ZH/JA/KO support, CJK quality       |
| Realtime latency             |     15 | Streaming STT/TTS/LLM path             |
| Enterprise security          |     15 | SOC2/ISO evidence, SSO, access control |
| Data handling and residency  |     15 | Region, retention, training opt-out    |
| Cost predictability          |     10 | Volume pricing, controls               |
| API maturity                 |     10 | Streaming, errors, SDK stability       |
| Observability                |      5 | Request IDs, usage, logs               |
| Portability                  |      5 | Ease of provider switching             |
| Support/SLA                  |      5 | Enterprise support quality             |

## 3. Realtime provider matrix

| Provider   | Strength                                                         | Risk                                     | Default decision                        |
| ---------- | ---------------------------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| LiveKit    | Managed/self-host, SFU, room tokens, flexible media architecture | Needs media architecture ownership       | Default candidate                       |
| Agora      | Mature global realtime infra                                     | Vendor lock-in and pricing complexity    | Pilot if speed/global media is priority |
| Daily      | Simple API and fast prototyping                                  | Less control for deep enterprise media   | Prototype or fallback candidate         |
| Custom SFU | Maximum control                                                  | High complexity and staffing requirement | Not for MVP/V1 unless media team exists |

Decision:

- Start with LiveKit abstraction.
- Keep provider interface narrow: room, token, participant, media events, recording hooks, QoS metrics.

## 4. LLM provider matrix

Evaluation areas:

- Language teaching quality.
- Structured output reliability.
- Streaming latency.
- Tool/function calling safety.
- Enterprise data controls.
- Region/residency options.
- Cost per successful tutor turn.
- Grounded answer performance.

Required abstraction:

- `generateText`.
- `streamText`.
- `generateStructured`.
- moderation/safety adapter if provider-native.
- cost metadata.
- model/version metadata.

Pilot checklist:

- 500 grounded tutor Q/A.
- 200 prompt injection tests.
- 100 lesson QA examples.
- 100 tenant document Q/A.
- Latency and cost benchmark.
- Safety refusal test.

## 5. STT provider matrix

Evaluation areas:

- Streaming support.
- Partial transcript latency.
- EN/ZH/JA/KO accuracy.
- Accent/noise/device robustness.
- Word timestamps.
- Confidence scores.
- Custom vocabulary/glossary.
- Data retention controls.

Pilot checklist:

- 1000-2000 utterances per language where feasible.
- Accent/noise/device matrix.
- Tenant glossary terms.
- Code-switching samples.
- Weak network simulation.

## 6. TTS provider matrix

Evaluation areas:

- Streaming first byte latency.
- Naturalness.
- Voice variety by language.
- Enterprise rights and data handling.
- Pronunciation control.
- Cost per minute.

Pilot checklist:

- Scenario response samples.
- Long/short reply latency.
- Learner preference test.
- CJK pronunciation quality review.
- Fallback voice behavior.

## 7. Pronunciation provider matrix

Evaluation areas:

- Phoneme scoring.
- Word/sentence scoring.
- Stress/intonation.
- Chinese tones.
- Japanese mora/pitch support.
- Korean batchim/liaison support.
- Confidence and explainability.
- Alignment output.

Pilot checklist:

- Gold pronunciation set by language.
- Expert review agreement.
- False positive/negative rate.
- Actionability of feedback.
- Latency in realtime and async mode.

## 8. Hosting and data plane matrix

Frontend:

- Vercel is strong for Next.js preview/prod workflow.
- Must verify enterprise headers, logging, region, and data controls.

Backend:

- Render/Fly/Railway for early speed.
- AWS/GCP/Azure for enterprise data residency, private networking, and compliance controls.

Database:

- Managed PostgreSQL with pgvector for MVP.
- Dedicated vector database optional for scale.

Object storage:

- S3-compatible storage.
- Signed URLs.
- Region control.
- Lifecycle retention rules.

Redis/queue:

- Managed Redis.
- BullMQ for jobs.
- Tenant-aware queue metadata.

## 9. Observability vendor matrix

Default:

- Sentry for application errors.
- OpenTelemetry for traces.
- Prometheus/Grafana/Loki for metrics/logs where self-managed stack is viable.
- Tempo/Jaeger optional for trace storage.

Selection criteria:

- Tenant-level tagging.
- PII redaction.
- Alert routing.
- Cost.
- Retention.
- Export.

## 10. Vendor risk controls

Required:

- Subprocessor registry.
- DPA where needed.
- Data retention settings.
- Training opt-out where applicable.
- Regional processing settings.
- Incident notification terms.
- API key rotation plan.
- Provider outage fallback.
- Usage/cost caps.

## 11. Vendor Decision Done Criteria

- Provider choices sit behind abstraction layers.
- Pilot checklists exist for LLM/STT/TTS/pronunciation/realtime.
- Selection criteria include quality, latency, security, residency, cost, and support.
- Vendor risk controls map to compliance and enterprise procurement needs.
