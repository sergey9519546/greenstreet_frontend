# Source-evidence adversarial review

**Reviewer:** independent hostile-input review
**Date:** 2026-07-28
**Scope:** src/governance/sourceEvidence.ts and its unit test only. Source, tests, and configuration were not changed for this review.

## Current verdict: PASS — hardened isolated evaluator

The hardened evaluator passes the full original hostile-input matrix. All SE-ADV-01 through SE-ADV-10 reproductions now return a deterministic denial, canonical safe output, or the intended approved result; accessor and Proxy cases do not throw. No new default-deny bypass was found in the supported plain-data input model.

The module remains isolated and has no current product-surface caller, so this revalidation introduced **no regression in an existing calculator, lead, authentication, routing, or public flow**. This PASS supersedes the previous evaluator-quality no-go; it does **not** authorize a product attachment. Any future adapter still needs its own hold-preservation snapshot, feature-default-off behavior, full journey regression evidence, human approval, and rollback proof.

## Hardened revalidation evidence

| Check | Result | Exact evidence |
| --- | --- | --- |
| Original SE-ADV-01 through SE-ADV-10 matrix | PASS | 28 throwaway harness assertions passed. It covered replaced collection/scope methods, malformed/null siblings, inherited fields, throwing Proxy/getter values, duplicate ID/fingerprint data, sparse arrays, output type/order, year zero, polluted prototypes, date boundaries, and supersession topology. |
| Durable targeted test | PASS | `npm exec vitest run src/governance/sourceEvidence.test.ts`: 1 file, 16 tests passed. |
| Type/lint gate | PASS | `npm run lint` (`tsc --noEmit`) passed. |
| Patch whitespace/integrity | PASS | `git diff --check` passed; a direct trailing-whitespace scan of this untracked report also passed. |

## Revalidated adversarial matrix

| ID | Current result | Status |
| --- | --- | --- |
| SE-ADV-01 | Replaced Array `filter`, `every`, and `includes` become `invalid-record`; the evaluator reads only own dense descriptors and does not call instance methods. | PASS |
| SE-ADV-02 | A null or malformed sibling rejects the whole controlled collection before any record can allow. | PASS |
| SE-ADV-03 | Inherited record/request fields are rejected; normalized fields must be own data descriptors on a plain object. | PASS |
| SE-ADV-04 | Throwing Proxy and getter cases return `invalid-record` without throwing. | PASS |
| SE-ADV-05 | Duplicate IDs, including approved/revoked duplicates, return `duplicate-record-id`. | PASS |
| SE-ADV-06 | Sparse scope arrays return `invalid-record`. | PASS |
| SE-ADV-07 | Invalid IDs return `invalid-record` with an empty `evidenceIds` array. | PASS |
| SE-ADV-08 | Duplicate SHA-256 values return `duplicate-fingerprint` before evaluation. | PASS |
| SE-ADV-09 | Normalized records sort by ID, so reversed input returns identical canonical IDs and denial reasons. | PASS |
| SE-ADV-10 | Year `0000` is rejected; valid boundaries remain inclusive and UTC-calendar based. | PASS |

## Residual constraints and safe limitations

- The evaluator validates shape and produces a deterministic decision; it cannot authenticate a caller or make a runtime registry itself trustworthy. Controlled artifacts, human approval references, and an independently reviewed adapter remain required.
- Duplicate fingerprints are rejected **across the whole collection**, even for different subjects. That is safely fail-closed, but the registry owner must decide whether one canonical record should carry all assertions supported by a shared artifact before integrating a multi-subject registry.
- A hostile party able to replace JavaScript intrinsics in the same execution realm has arbitrary code execution beyond this module's security boundary. The tested contract is hostile values and throwing descriptors/Proxies, not a compromised runtime.

## Historical first-review method

- Read the implementation and all 12 durable unit tests.
- Ran a throwaway tsx harness against the exported evaluator. It wrote no project files.
- Used valid baseline evidence, then varied runtime shape, Array/prototype behavior, supersession topology, duplicate identity/fingerprint data, and calendar boundaries.
- Treated the module's own release-guard design as the contract: invalid runtime values must default-deny, never throw, and cannot weaken an existing hold.

## Historical first-review findings — resolved by the hardened revision

| ID | Severity | Finding | Reproduced result | Why it is a release-gate failure |
| --- | --- | --- | --- | --- |
| SE-ADV-01 | Critical | The evaluator trusts instance filter, every, and includes methods from attacker-controlled Arrays. | An empty Array with filter replaced to return valid evidence returned allowed: true. Empty scope arrays with every/includes replaced to return true also returned allowed: true. | Array.isArray does not make the Array's methods trustworthy. This permits a record with no real jurisdiction/product/assertion coverage to satisfy scope checks, or an empty collection to invent evidence. See source lines 93–95, 163–165, and 212–218. |
| SE-ADV-02 | Critical | Invalid/null sibling records are ignored when a valid matching record exists, and accumulated invalid reasons are discarded by the early allow return. | [valid, null] and [valid, { subject: valid.subject, owner: "" }] both returned allowed: true. | A corrupt controlled registry can still release based on a selected valid-looking entry. This is not fail-closed for malformed runtime/deserialized data. See source lines 163–165, 181–185, and 225–245. |
| SE-ADV-03 | High | Prototype-inherited fields are accepted as evidence/request fields. | Object.create(validEvidence) and Object.create(validRequest) both returned allowed: true. | The validator does not require own data properties or a safe prototype. Prototype pollution can satisfy the schema without a controlled record/request. See source lines 101–124 and 128–138. |
| SE-ADV-04 | High | Getters and Proxies can throw from the evaluator rather than returning a denial. | A Proxy whose get trap throws during subject lookup threw trap; an id getter threw id trap. | The documented boundary promises a default-deny result, never an exception. An exception at a release adapter can become fail-open if its caller catches it incorrectly, or can break an existing flow. See source lines 163–165 and 181–252. |
| SE-ADV-05 | High | Duplicate IDs are not rejected; a revoked duplicate does not prevent a matching approved duplicate from allowing. | Two id: "id-1" records, one approved and one revoked, returned allowed: true with only the approved ID. Identical ID/same-hash duplicates returned an allowed result with evidenceIds: ["id-1", "id-1"]. | A stable evidence ID cannot safely represent one revocable/reviewed artifact if contradictory versions coexist. A revocation can be bypassed through the duplicate approved row. |

### Historical minimal reproductions

The following harness captured the first revision's failures. The current outcomes are the PASS results in the revalidated matrix above; these snippets are retained for audit traceability.

    // SE-ADV-01a: no actual records, but a replaced Array method manufactures one.
    const records = [] as SourceEvidence[];
    Object.defineProperty(records, "filter", { value: () => [evidence()] });
    evaluateEvidence(records, request).allowed; // true (should be false)

    // SE-ADV-01b: no actual scope values, but replaced Array methods approve them.
    const hostileScope: string[] = [];
    Object.defineProperties(hostileScope, {
      every: { value: () => true },
      includes: { value: () => true },
    });
    evaluateEvidence([
      evidence({
        jurisdictions: hostileScope,
        products: hostileScope,
        assertions: hostileScope,
      }),
    ], request).allowed; // true (should be false)

    // SE-ADV-02: a corrupt collection is accepted if one sibling looks valid.
    evaluateEvidence([evidence(), null as unknown as SourceEvidence], request).allowed; // true
    evaluateEvidence([evidence(), evidence({ id: "bad", owner: "" })], request).allowed; // true

    // SE-ADV-03: inherited, not controlled own fields are accepted.
    evaluateEvidence([Object.create(evidence())], request).allowed; // true
    evaluateEvidence([evidence()], Object.create(request)).allowed; // true

    // SE-ADV-04: the documented never-throw boundary throws.
    const throwing = new Proxy({}, { get() { throw new Error("trap"); } });
    evaluateEvidence([throwing as SourceEvidence], request); // throws Error("trap")

    // SE-ADV-05: revocation is bypassed through a duplicate identifier.
    evaluateEvidence([
      evidence({ id: "id-1" }),
      evidence({ id: "id-1", status: "revoked", sourceArtifact: "revoked.pdf" }),
    ], request).allowed; // true

## Historical supplementary findings — resolved by the hardened revision

| ID | Severity | Finding | Result / consequence |
| --- | --- | --- | --- |
| SE-ADV-06 | Medium | Sparse arrays pass isStringArray because Array.prototype.every skips holes. | A sparse scope array is later denied by normal includes, so this did not itself allow. It is still classified as scope mismatch rather than invalid record. Require non-empty, dense arrays after safe normalization. |
| SE-ADV-07 | Medium | evidenceIds is derived from unvalidated candidates. | A matching malformed record with id: 7 returns evidenceIds: [7], violating the declared readonly string[] result type. Getter-backed IDs can throw here too. Return identifiers only from normalized records. |
| SE-ADV-08 | Medium | Fingerprint/identity uniqueness policy is incomplete. | Different IDs and artifacts claiming the same SHA-256 are allowed together, while different hashes correctly conflict. Same-hash duplicates may be legitimate, but the registry needs an explicit policy and a single canonical provenance record before release use. |
| SE-ADV-09 | Low | Audit output is input-order-dependent. | The allow/deny decision and reasons are stable for a normal set, but evidenceIds follows caller order (["b", "a"] vs ["a", "b"]). Sort/dedupe normalized IDs if byte-identical release evidence is required. |
| SE-ADV-10 | Low | Year 0000 is accepted as an ISO date. | It produced an allowed record and reviewAgeDays: 740190. Decide whether the controlled-data policy permits proleptic year zero; reject it if business records require 0001–9999. |

## Supersession, date, and normal-input results

These behaviors passed and should be retained when the boundary is hardened:

| Scenario | Result | Assessment |
| --- | --- | --- |
| Non-array records, null request, invalid calendar date, effective-after-expiry, or future reviewedOn as the only candidate | Denied | PASS for ordinary data values. |
| Valid current approved record at effectiveFrom or expiresOn boundary | Allowed | PASS; inclusive calendar boundaries are explicit and UTC-based. |
| Approved supersession chain A <- B <- C | Only leaf C allowed | PASS; predecessor cannot revive by input order. |
| Approved supersession cycle or self-supersession | Denied with invalid-supersession during normalization | PASS; conservative default-deny. |
| Draft successor | Predecessor remains allowed | PASS as a reasonable draft policy: unapproved work does not release or replace current evidence. Document this policy explicitly. |
| Revoked, expired, or out-of-scope non-draft successor | Predecessor remains suppressed; result denied | PASS; conservative and aligned with the monotonic-supersession design. |
| Two applicable approved records with different fingerprints | Denied with conflicting-approved-records independent of input order | PASS. |
| Exact same immutable plain inputs | Same result, with no ambient clock/file/network use | PASS. |

The original PASS rows did not mitigate SE-ADV-01 through SE-ADV-05. The hardened revision now normalizes the full collection before evaluation, which resolves those first-review findings.

## Hardened control mapping

The hardened revision implements the following controls; product attachment remains a separate gated change:

1. It rejects non-plain objects, inherited fields, accessors, throwing Proxies, sparse/empty scope arrays, and malformed values with a caught invalid-record result.
2. It snapshots only own descriptor values into frozen normalized data before evaluation and does not invoke caller-provided Array methods.
3. It rejects the entire controlled collection on malformed data, before any record can allow.
4. It rejects duplicate IDs/fingerprints plus self, unknown, cross-subject, duplicate-link, and cyclic supersession topology during normalization; monotonic non-revival behavior remains covered.
5. It returns IDs only from normalized records in canonical sort order.
6. The targeted durable suite now includes hostile-method, whole-collection, inherited-field, throwing-Proxy, duplicate-topology, sparse-array, and canonical-order coverage. Any future adapter must still run the full calculator/lead/auth/route/fidelity suite.

## Final validation commands

Run after the report is added:

    npm exec vitest run src/governance/sourceEvidence.test.ts
    npm run lint
    git diff --check

The commands validate that this report did not alter the hardened implementation. The targeted suite now contains 16 tests and the independent throwaway harness covered 28 assertions. The final diff check result is recorded after this documentation update.
