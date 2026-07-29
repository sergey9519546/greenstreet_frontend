# Source-evidence guard validation

**Validator:** independent implementation review
**Revalidated:** 2026-07-28
**Scope:** `src/governance/sourceEvidence.ts`, `src/governance/sourceEvidence.test.ts`, and `docs/program/SOURCE_EVIDENCE_RELEASE_GUARD_DESIGN.md`

## Historical verdict: PASS — for the earlier isolated first implementation slice only

This record is superseded for the current implementation by [IMPLEMENTATION_CHANGE_REVIEW.md](IMPLEMENTATION_CHANGE_REVIEW.md) and [SOURCE_EVIDENCE_ADVERSARIAL_REVIEW.md](SOURCE_EVIDENCE_ADVERSARIAL_REVIEW.md). Those later reviews cover the hardened normalizer, hostile-input checks, and current test count.

The prior conflict-resolution failure is fixed. The evaluator now denies unresolved conflicts regardless of record order, accepts only an explicit applicable successor, preserves default deny, and reports review age for an allowed decision. It remains a pure, unused module, so this PASS does **not** authorize a calculator, lead, authentication, routing, Firestore, SEO, pricing, legal, tax, or customer-experience change.

## Goal checked

Validate that the first implementation slice is a deterministic, default-deny source-evidence evaluator with fixtures only, no product-surface attachment, explicit conflict/supersession handling, and no ability to weaken current holds.

## Commands and independent checks

| Check | Result | Evidence |
| --- | --- | --- |
| Targeted unit test | PASS | `npm exec vitest run src/governance/sourceEvidence.test.ts` passed: 1 file, 10 tests. |
| Type/lint gate | PASS | `npm run lint` (`tsc --noEmit`) passed. |
| Patch whitespace/integrity | PASS | `git diff --check` passed after this validation record was updated. |
| Product-surface import scan | PASS | `rg` found no `sourceEvidence` use in `src` outside its own unit test. |
| Existing behavior isolation | PASS | The module has no product imports or callers; calculator, lead, auth, routing, Firestore, public claims, and reliability holds remain unchanged. |

## Tested invariants

| Invariant | Result | Exact result |
| --- | --- | --- |
| Default deny for absent evidence | PASS | Empty records return `allowed: false`, `reasons: ["missing"]`, and no evidence IDs. |
| Approved/current/in-scope/hash-matched evidence permits | PASS | The durable unit fixture permits and reports the expected `reviewAgeDays: 13`. |
| Status, date, scope, assertion, hash, and malformed-data failures deny | PASS | The 10-test suite covers all non-approved statuses, expiry/future-effective dates, scope/assertion/hash mismatches, malformed owner/date, and inclusive expiry. |
| Unresolved conflict denies in either order | PASS | Independent AB and BA runs each returned `allowed: false` and `reasons: ["conflicting-approved-records"]`. |
| Explicit supersession is order-independent | PASS | A current approved successor listing its predecessor in `supersedes` permitted only the successor in both AB and BA orderings. |
| Older expected fingerprint cannot revive a predecessor | PASS | After supersession, the predecessor fingerprint returned `hash-mismatch` rather than an allowed result. |
| Review-age behavior | PASS | A successor reviewed on 2026-07-20 reported 8 days as of 2026-07-28; two active same-fingerprint records reported the oldest review age (13); a future review date denied as `invalid-record`. |
| Determinism | PASS | Durable test compares repeated evaluations; the module reads no ambient clock, file, or network state. |

## Conflict-resolution reproduction

For two approved, current, CA/DSCR records for the same assertion with different artifact hashes, both record orders now deny with `conflicting-approved-records`. When the newer applicable record explicitly lists the older record in `supersedes`, both orders allow only that successor; supplying the older expected hash still denies.

`evidenceIds` intentionally preserves the caller's record order in a denied conflict. The release decision (`allowed` and `reasons`) is order-independent, which is the required safety property. Normalize IDs in a future adapter only if an external audit consumer requires byte-identical ordering.

## Integration constraints that remain in force

- Keep `src/governance/sourceEvidence.ts` unimported by calculator, qualification, lead, authentication, route, SEO, and hold surfaces until the next separately reviewed slice is complete.
- `toolReliabilityHolds` remains the authority for the under-review experience. A future adapter may only strengthen a hold after proving that all 14 current holds remain held.
- A passing evaluator result is not a pricing, eligibility, legal, tax, lender, or customer-facing approval. Human approval references and immutable controlled artifacts remain external release prerequisites.
- Any first attachment must be feature-flagged default-off, independently regression-tested, and reversible according to the release-guard design.

## Required next gated work

1. Independently validate the hold-registry adapter, including a snapshot proving every current hold remains held.
2. Decide where immutable evidence and human approvals are controlled, then add only approved fixtures/metadata for the first non-public integration.
3. Before enabling any guarded surface, collect the specified golden, lead-flow, route, browser/API, preview, rollback, and human-approval evidence.
