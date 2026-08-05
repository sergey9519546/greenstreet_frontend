# GreenStreet Evidence Operating Model

**Status:** local operating decision, 2026-07-28. This document governs how this program records evidence while the repository remains publicly visible. It does not establish legal retention, privacy, underwriting, pricing, licensing, tax, or release policy.

## Decision

Use **GitHub Issues** as the work tracker and release-decision index. Use a separate, organization-controlled access-restricted record system as the authoritative store for non-public evidence. The specific restricted system and its access administrators have not yet been selected; until they are, do not capture or attach sensitive evidence.

The public repository is not an evidence vault. It may contain only non-sensitive, reproducible engineering artifacts such as deterministic test output, contract definitions, redacted manifests, and build-inventory observations.

## Why this is the safest current option

The configured GitHub repository is public. GitHub Issues provide an auditable work queue and cross-reference point, but they are unsuitable for borrower/contact data, credentials, raw platform exports, non-public pricing or program materials, privileged legal advice, security configurations, or unredacted screenshots/traces. Keeping the source material in a restricted system prevents the work tracker from becoming a data-leak channel while still allowing a release reviewer to trace a decision to an accountable owner.

## Required record shape

Every release-sensitive issue or decision record must identify the following without copying restricted contents into GitHub:

| Field | Required value |
| --- | --- |
| Subject | Stable evidence subject, affected route/API/claim, and decision requested. |
| Accountable owner | Named business, platform, security/privacy, legal, underwriting/pricing, model, or release owner. A role alone is not sufficient for approval. |
| Restricted record reference | Identifier and access-controlled location in the chosen organization system; no secrets, PII, or privileged content in the issue. |
| Source identity | Issuer, version or hash, effective date, expiry/review date, and scope. |
| Review result | Approved, denied, expired, superseded, or needs-review, with approver and date. |
| Implementation link | Exact commit/PR and test or preview evidence that consumes the decision. |
| Rollback and follow-up | Rollback owner/path, monitoring window, and next review date. |

An issue must remain blocked when any required field is absent, expired, contradictory, or outside its claimed scope. A generated summary is never evidence on its own.

## Data handling rules

Never place the following in source control, issue text, comments, CI logs, screenshots, HAR files, test fixtures, or build reports:

- borrower, applicant, lead, employee, or customer personal data;
- API keys, tokens, service-account material, environment values, cookies, session data, or private URLs;
- raw Firestore exports, production logs, unredacted network traces, or production analytics exports;
- non-public rate sheets, underwriting guidelines, counsel advice, contracts, or privileged correspondence; or
- screenshots that reveal any of the above.

Use synthetic inputs for tests. Redact browser and platform captures before any local or tracker reference. Preserve only the minimum metadata needed to reproduce a release decision.

## Ownership and escalation

| Evidence family | Accountable owner needed before a change can proceed |
| --- | --- |
| Pricing, eligibility, DSCR or underwriting logic | Pricing/underwriting owner plus independent model validator when model behavior changes. |
| Advertising, licensing, state-law, identity, disclosures | Authorized business owner and applicable mortgage counsel. |
| Privacy, analytics, lead data, session replay | Privacy/security owner. |
| Firebase, IAM, hosting, secrets, deployment rollback | Platform owner and security owner. |
| Accessibility, visual, performance, discovery | Engineering/release owner with the relevant specialist review. |

No agent may substitute for these accountable approvals. If a named person or a restricted record system is unavailable, preserve the existing disclosure, estimate, behavior, or hold and leave the issue blocked.

## Immediate workflow

1. Create or update a GitHub Issue only when external write authorization is provided.
2. Add the redacted record shape above and link the exact candidate commit.
3. Store source material only in the selected restricted system, then record its immutable identifier and review dates in the issue.
4. Run the relevant deterministic and preview gates; attach only non-sensitive results.
5. Obtain the named approvals before changing a held or regulated surface.
6. Record deployment, monitoring, and rollback evidence against the same issue after release authorization.

Until the organization selects the restricted system, assigns named owners, and authorizes external issue creation, this workflow is a local operating model only. The existing reliability holds and default-deny posture remain in force.
