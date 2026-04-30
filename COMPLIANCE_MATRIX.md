# Polyglot AI Academy - Compliance Matrix

## 1. Positioning

This matrix is an engineering and product readiness plan, not legal advice or a certification claim. Formal compliance requires counsel review, contract review, operational evidence, and in some cases external audit.

Target posture:

- GDPR-style privacy baseline.
- PDPA readiness for Singapore-style requirements.
- PIPA readiness for Korea-style requirements.
- APPI readiness for Japan-style requirements.
- OWASP ASVS 5.0.0-aligned application security planning.
- OWASP LLM Top 10-aligned AI threat planning.
- NIST SSDF secure software development practices.
- NIST AI RMF risk management vocabulary.
- WCAG 2.2 AA accessibility target.

## 2. Sensitive data classes

| Data class           | Examples                                | Risk        | Controls                                                |
| -------------------- | --------------------------------------- | ----------- | ------------------------------------------------------- |
| Identity             | name, email, SSO identifiers            | Medium      | minimization, encryption, access control                |
| Learning profile     | goals, level, language, interests       | Medium      | user access/delete, tenant policy                       |
| Transcript           | raw/normalized transcript, romanization | High        | encryption, retention, access audit                     |
| Audio                | speaking session recordings             | High        | signed URLs, short retention, optional training consent |
| Tenant documents     | handbook, policy, internal glossary     | High        | quarantine, malware scan, tenant RAG isolation          |
| Enterprise glossary  | internal terms, support phrases         | Medium/High | tenant scope, versioning, review                        |
| Analytics            | cohort performance, manager reports     | Medium      | aggregation, role-based access                          |
| Payment/subscription | provider IDs, invoices                  | Medium      | provider-managed where possible                         |
| Prompt/AI logs       | prompts, retrieved snippets, outputs    | Medium/High | redaction, minimization, policy logging                 |

## 3. GDPR-style baseline

| Principle                          | Product requirement                                            | Evidence artifact                    |
| ---------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| Lawfulness, fairness, transparency | Privacy policy, AI disclosure, consent notices                 | Policy pages, consent logs           |
| Purpose limitation                 | Separate product processing, AI improvement, marketing consent | Consent model                        |
| Data minimization                  | Do not collect raw audio longer than needed                    | Retention config                     |
| Accuracy                           | User can correct profile; content errors can be reported       | Profile edit, content issue workflow |
| Storage limitation                 | Tenant/user retention policies                                 | Retention jobs, deletion logs        |
| Integrity/confidentiality          | Encryption, RBAC, audit logs, redaction                        | Security controls                    |
| Accountability                     | DPA, DPIA, RoPA, audit evidence                                | Compliance folder                    |

Data subject rights:

- Access.
- Correction.
- Deletion.
- Export/portability where practical.
- Consent withdrawal.
- Objection/restriction where applicable.

## 4. PDPA/PIPA/APPI readiness

| Area                   | GDPR-style                              | Singapore PDPA readiness                   | Korea PIPA readiness                       | Japan APPI readiness                         |
| ---------------------- | --------------------------------------- | ------------------------------------------ | ------------------------------------------ | -------------------------------------------- |
| Notice                 | Privacy policy and just-in-time notices | Clear collection/use/disclosure notices    | Clear processing purpose and retention     | Clear purpose of use                         |
| Consent                | Granular consent                        | Consent or deemed consent where applicable | Strong consent records for sensitive cases | Consent where required                       |
| Access/deletion        | User rights workflow                    | Access/correction workflow                 | Data subject rights workflow               | Disclosure/correction/suspension workflow    |
| Cross-border transfer  | Transfer matrix                         | Overseas transfer assessment               | Cross-border transfer safeguards           | Third-party/cross-border disclosure controls |
| Retention              | Configurable retention                  | Retain only as needed                      | Retention and destruction plan             | Retention/purpose limitation                 |
| Breach                 | Incident response                       | Breach assessment/notification workflow    | Breach notification workflow               | Breach reporting workflow                    |
| Processor/subprocessor | DPA and subprocessors                   | Vendor governance                          | Outsourcing/vendor controls                | Entrustee/supplier controls                  |

## 5. Data residency matrix

Tenant-level fields:

- `data_residency`.
- storage region.
- processing region.
- AI provider allowed regions.
- subprocessor allowlist.
- export region restrictions.
- backup region.

Initial regions:

| Region | Intended use                   | MVP status  | V1 target                                  |
| ------ | ------------------------------ | ----------- | ------------------------------------------ |
| US     | North America/global customers | Config only | Enforced storage/processing where deployed |
| EU     | GDPR-sensitive customers       | Config only | EU storage and subprocessors               |
| APAC   | Singapore/SEA customers        | Config only | APAC storage option                        |
| JP     | Japan customers                | Config only | Japan storage option if needed             |
| KR     | Korea customers                | Config only | Korea storage option if needed             |

Rule:

- Do not promise hard residency until storage, processing, backup, provider routing, logs, and support access are all enforceable and tested.

## 6. Consent policy

Consent categories:

- Required product processing.
- Optional AI improvement/training.
- Optional marketing/testimonial.
- Optional analytics/cookies where non-essential.
- Tenant admin consent for uploaded internal documents.

Requirements:

- Consent is versioned.
- Consent can be withdrawn.
- Withdrawal affects future processing.
- Audio training consent is separate from product use.
- Under-18 mode requires age-sensitive guardrails and tenant/school policy.

## 7. Retention policy

| Data                 | Default retention                 | Tenant override | Deletion support                 |
| -------------------- | --------------------------------- | --------------- | -------------------------------- |
| Identity/profile     | Account lifetime                  | Yes             | Yes                              |
| Progress/mistakes    | Account lifetime                  | Yes             | Yes                              |
| Transcript           | Account lifetime or tenant policy | Yes             | Yes                              |
| Audio                | 7-30 days default                 | Yes             | Yes                              |
| Pronunciation scores | Account lifetime                  | Yes             | Yes                              |
| Tenant documents     | Tenant policy                     | Yes             | Yes, including chunks/embeddings |
| Audit logs           | Compliance retention              | Limited         | Restricted                       |
| Aggregated analytics | Longer                            | Yes             | Pseudonymous where possible      |

## 8. DPA checklist

Must include:

- Parties and roles.
- Processing purpose.
- Data categories.
- Data subject categories.
- Subprocessors.
- Security measures.
- Breach notification process.
- Assistance with rights requests.
- Return/deletion at termination.
- International transfer mechanism.
- Audit and evidence rights.

## 9. DPIA checklist

Required for:

- Large-scale audio/transcript processing.
- Enterprise tenant document RAG.
- Under-18/school deployments.
- Sensitive workforce analytics.
- New AI provider or model with changed data handling.

Questions:

- What data is collected?
- Why is it necessary?
- Who can access it?
- How long is it retained?
- Is data used for AI training?
- What risks exist to learners/employees?
- How are cross-border transfers handled?
- What controls mitigate the risks?

## 10. RoPA checklist

Record:

- Processing activity.
- Purpose.
- Data categories.
- Data subjects.
- Legal basis/consent category.
- Recipients/subprocessors.
- Transfer countries.
- Retention period.
- Security controls.
- Owner.

## 11. Security and AI standards mapping

| Standard         | How it is used                                                        |
| ---------------- | --------------------------------------------------------------------- |
| OWASP ASVS 5.0.0 | App security checklist and release gates                              |
| OWASP Top 10     | Web app risk framing                                                  |
| OWASP LLM Top 10 | Prompt injection, sensitive disclosure, supply chain, agent/tool risk |
| NIST SSDF        | Secure software lifecycle and supply-chain practices                  |
| NIST AI RMF      | AI risk framing: governance, mapping, measurement, management         |
| WCAG 2.2 AA      | Accessibility acceptance criteria                                     |

## 12. Reference links

- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Top 10 for LLM Applications: https://genai.owasp.org/llm-top-10/
- NIST SSDF SP 800-218: https://csrc.nist.gov/publications/detail/sp/800-218/final
- NIST AI RMF 1.0: https://www.nist.gov/itl/ai-risk-management-framework
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- EU GDPR portal: https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en
- Singapore PDPC/PDPA: https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act
- Japan Personal Information Protection Commission: https://www.ppc.go.jp/en/
- Korea Personal Information Protection Commission: https://www.pipc.go.kr/

## 13. Compliance Matrix Done Criteria

- Sensitive data classes are identified.
- Consent, retention, DPA, DPIA and RoPA checklists exist.
- Data residency is modeled without over-claiming enforcement.
- GDPR-style, PDPA, PIPA and APPI readiness are mapped.
- Security/AI/accessibility standards are linked to engineering controls.
