# Source-evidence release-guard design

Status: design-only, 2026-07-28. This document does not authorize a pricing, program, legal, tax, eligibility, lender, or customer-experience change.

## Decision

Introduce one additive, internal `SourceEvidence` registry before any held tool, rate/program output, state-law summary, tax output, or model-based recommendation is released. Missing, expired, unapproved, out-of-scope, or internally inconsistent evidence must retain the current safe behavior: the existing hold, `needs review`, or educational-estimate state. A guard must never manufacture a positive decision.

## Scope and non-goals

In scope:

- Provenance and release status for governed inputs and claims.
- Deterministic validation of owner, source artifact, dates, scope, approval, and integrity fingerprint.
- Mapping existing holds to the evidence they require.
- Testable default-deny release decisions and a rollback path.

Out of scope:

- Determining a rate, eligibility, legal conclusion, tax treatment, or lender match.
- Changing calculator arithmetic, the lead flow, authentication, Firestore rules, public claims, SEO metadata, or current reliability holds.
- Treating a source URL, copied statute, model comment, or agent output as approval.

## Canonical record

```ts
type EvidenceStatus = "draft" | "approved" | "superseded" | "expired" | "revoked";

interface SourceEvidence {
  id: string;                 // stable, opaque identifier
  subject: string;            // e.g. rate-inputs, TX-STR-rule, rate-quiz-release
  owner: string;              // accountable business function, not an agent
  sourceArtifact: string;     // controlled repository path, immutable URL, or archive ID
  sourceVersion: string;
  sha256: string;
  effectiveFrom: string;      // ISO date
  expiresOn: string;          // ISO date; required for every releasable input
  reviewedOn: string;
  approvedBy: string;         // accountable human role or approved identifier
  status: EvidenceStatus;
  jurisdictions: string[];    // explicit; no implicit nationwide expansion
  products: string[];         // explicit product/program scope
  assertions: string[];       // limited, reviewed propositions supported by source
  supersedes?: string[];     // omit if none; present values are non-empty unique IDs
  reviewTicket?: string;
}
```

`approved` alone is insufficient. The release date must lie within the effective window, the requested jurisdiction/product/assertion must be explicitly covered, and the artifact hash must match the controlled source. Human approvals are references to an existing approval system; the code must not create approvals.

## Deterministic release contract

```ts
type EvidenceCheck = {
  allowed: boolean;
  reasons: readonly (
    | "missing"
    | "not-approved"
    | "expired"
    | "not-yet-effective"
    | "scope-mismatch"
    | "hash-mismatch"
    | "assertion-not-covered"
    | "invalid-record"
    | "invalid-supersession"
    | "duplicate-record-id"
    | "duplicate-fingerprint"
    | "superseded-record"
    | "conflicting-approved-records"
  )[];
  evidenceIds: readonly string[];
  reviewAgeDays?: number; // returned only for an allowed check
};

function evaluateEvidence(/* subject, jurisdiction, product, assertion, asOf */): EvidenceCheck;
```

Rules:

1. Default deny: no matching record is `allowed: false`.
2. A date is supplied by the caller; no hidden clock-dependent behavior in tests.
3. A release requires one valid record for every declared dependency.
4. Invalid records produce machine-readable reasons only; no customer-facing legal, pricing, or underwriting explanation is synthesized from them.
5. Existing `toolReliabilityHolds` remains the authority that maps a denied check to the current under-review screen. The guard may strengthen a hold; it may not remove or weaken one.
6. Two current, approved, in-scope records with different artifact fingerprints deny as `conflicting-approved-records` unless one explicitly lists the other in `supersedes`. Supersession is monotonic: an explicitly superseded record cannot be revived by request order, an older expected fingerprint, an expired successor, or a successor that is outside the requested scope. Reinstatement requires a new reviewed record; this first slice has no reinstatement mechanism.
7. An allowed result reports the oldest review age among the records used, so release evidence can apply its own documented review-freshness policy.
8. Evaluators normalize untrusted runtime/deserialized values before evaluation. Inputs must be plain objects with own data properties; arrays must be dense, bounded, and free of custom own methods/properties. Invalid record/request shapes return a default-deny `invalid-record` result, never throw.
9. The controlled collection is atomic: any malformed item denies the whole evaluation. Record IDs and fingerprints are unique; duplicate identifiers/fingerprints deny. Supersession targets must be same-subject records, cannot self-reference or cycle, and cannot be unknown.
10. Only normalized records contribute IDs to audit output; IDs are canonicalized in stable order. The evaluator catches hostile accessors/proxies and returns `invalid-record` rather than propagating an exception.

## Initial attachment order

| Order | Surface | Initial guard behavior | Human owner required |
| --- | --- | --- | --- |
| 1 | Existing held-tool registry | Associate each listed release prerequisite with a subject ID; no UI change. | Product/release owner |
| 2 | Public rate/program display paths | Evidence absence preserves educational estimate and blocks promotion to current pricing/eligibility. | Pricing and underwriting owner |
| 3 | State-law and PPP outputs | Missing counsel-reviewed dated authority preserves current hold. | Mortgage/state counsel |
| 4 | Tax/return/ARM/STR/probabilistic outputs | Missing subject evidence preserves hold/educational state. | Tax professional and model owner |
| 5 | Authenticated workspace releases | Production access remains off unless environment/auth/persistence evidence is valid. | Security and platform owners |

## Test-first implementation slices

1. Add pure registry types and an evaluator with fixtures only. No import by a product surface. Test absent, draft, expired, future-effective, scope mismatch, hash mismatch, valid, deterministic `asOf`, malformed/inherited/accessor input, duplicate identity/fingerprint, and supersession topology cases.
2. Add an adapter from the existing hold registry to subject IDs. Snapshot the 14 current holds first; assert every hold remains held after the adapter lands.
3. Attach the evaluator to one already-held, non-public route in a feature-flagged, default-off path. Test both guard outcomes and rollback by removing one import.
4. Only after approval, connect a governed output one dependency at a time and run its existing golden tests, lead-flow smoke test, route test, and browser trace.

Each slice requires a failing-first test, independent regression review, and a reversible commit. The currently unavailable TDD/model-validation skill chain must be verified before any financial or decision-support behavior is changed.

## Evidence-quality checks

| Check | Failure severity | Automated assertion |
| --- | --- | --- |
| Required fields and ISO dates | Critical | Reject missing/invalid owner, source, hash, date, scope, approver, status, inherited field, accessor, or non-plain object. |
| Effective window | Critical | Reject `asOf` outside `effectiveFrom` through `expiresOn`. |
| Approval/status | Critical | Accept only `approved`; reject draft, superseded, expired, revoked. |
| Scope | Critical | Reject an undeclared jurisdiction, product, or assertion. |
| Hash integrity | High | Reject mismatch against controlled artifact fingerprint. |
| Duplicate/conflict | Critical | Reject duplicate IDs/fingerprints, invalid/cyclic/unknown supersession, and conflicting approved records for the same assertion/scope unless explicit precedence resolves it. |
| Freshness/review cadence | High | Reject expiry; report review age to release evidence. |

## Release evidence and rollback

Before a guarded surface changes from its current state, retain:

- Baseline test output and homepage contract hash.
- Evidence fixture and immutable source-artifact reference.
- Human approval reference, effective/expiry dates, and owner.
- Unit tests for the denied and permitted branches.
- Independent browser/API regression evidence for affected journeys.
- Preview URL, release identifier, exact rollback commit/artifact, and rollback smoke result.

If any check fails, revert only the guard integration commit or set the scoped feature flag default off. Do not edit rate/policy/model constants to compensate.

## Open decisions

1. Where the immutable evidence artifacts and approvals live (GitHub issue/PR, controlled document system, or another approved system).
2. Which human role names/identifiers are acceptable in repository metadata.
3. The first held surface to integrate after an independent validator is named.
4. Whether the current static identity/funding metadata is corrected in a separate, counsel-approved claim-remediation release.
