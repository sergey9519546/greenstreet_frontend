# Independent implementation change review

**Review date:** 2026-07-28
**Scope:** `.github/workflows/ci.yml`, `src/governance/sourceEvidence.ts`, and `src/governance/sourceEvidence.test.ts` only.

## Verdict

**This initial verdict is superseded by the 2026-07-28 re-review below.** It records the two original implementation blockers for traceability.

**No existing product behavior is currently wired to or changed by the new evidence evaluator.** The import scan found no use of `sourceEvidence` in `src` outside the evaluator and its unit test, so calculator, qualification, lead, authentication, routing, SEO, and existing hold behavior remain unaffected. The CI-only addition is structurally valid and preserves the Node 22 intent.

**BLOCKED for any attachment of `evaluateEvidence` to a release, hold, calculator, or other decision gate.** Two reproduced edge cases violate the evaluator's stated default-deny contract. They do not alter the current product because the module is unreferenced, but they must be corrected and independently retested before the module can govern a customer-facing or operational decision.

## Executable-change findings

### CI workflow: PASS

The only workflow change adds `npm run test:home-fidelity` after the existing full unit-test step and before the existing build step. It does not change dependencies, runtime setup, credentials, deployment behavior, or existing test commands.

- Workflow continues to use `actions/setup-node@v5` with `node-version: 22`.
- `package.json` declares `engines.node: "22.x"`.
- The added script is already defined as `node scripts/check-home-contract.mjs`; it is a deterministic local contract check and passed with hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9`.
- The evaluator uses ordinary TypeScript/JavaScript features supported by Node 22 (ES modules as bundled/tested, `Set`, `Array.prototype.includes`, optional chaining, and `Date`), with no apparent Node-25-only feature.

The local host has Node `v25.2.1` and no Node version manager/alternate Node 22 executable was available, so actual Node 22 execution remains a required CI confirmation rather than a locally completed check.

### Product-surface imports: PASS

`rg` found `sourceEvidence` references only in `src/governance/sourceEvidence.ts`, `src/governance/sourceEvidence.test.ts`, and planning documentation. No product module imports it. The production build also completed, which supports that the unreferenced module has no bundle or runtime impact today.

### Default-deny evaluator: FAIL for future use

The focused unit tests cover normal missing, approval, date, scope, assertion, hash, conflict, and simple supersession cases. They pass, but they do not cover the following reproduced failure modes:

1. **An expired successor resurrects its explicitly superseded predecessor.** `isSupersededByAnother` is evaluated only against records that are current and otherwise applicable. With an approved predecessor valid through `2026-09-01`, an approved successor that explicitly supersedes it but expired on `2026-07-20`, and an `asOf` date of `2026-07-28`, the evaluator returned:

   ```text
   {"allowed":true,"reasons":[],"evidenceIds":["predecessor"],"reviewAgeDays":27}
   ```

   This contradicts the in-code claim that a predecessor is not revived and can allow use of evidence that the registry has replaced. The guard should deny until a current explicitly approved successor is present, or the data model must make the predecessor's lifecycle unambiguous independently of the filtered applicability list.

2. **Malformed runtime scope data throws instead of returning an explicit denial.** `isUsableRecord` does not validate that `jurisdictions`, `products`, and `assertions` are arrays before calling `.includes`. A record with `jurisdictions: undefined` produced:

   ```text
   TypeError: Cannot read properties of undefined (reading 'includes')
   ```

   Because this module is intended to validate controlled artifacts rather than only compiler-created objects, malformed external/deserialized records must return `{ allowed: false, reasons: ["invalid-record"] }` without an exception. The same structural validation should cover the other arrays and `supersedes` before `.includes` is used.

## Regression evidence (run serially)

| Check | Result |
| --- | --- |
| `npm exec vitest run src/governance/sourceEvidence.test.ts` | PASS — 1 file, 10 tests |
| `npm test` | PASS — 16 files, 166 tests |
| `npm run test:home-fidelity` | PASS — contract hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9` |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — existing external-script and chunk-size warnings observed; no changed product module imports this evaluator |
| `git diff --check` | PASS — no whitespace errors |

## Required exit criteria

1. Make supersession monotonic: an explicitly superseded record must never become eligible again merely because its successor is expired, invalid, or out of scope, unless an approved review expressly reinstates it.
2. Add total runtime validation for all array-shaped fields and non-throwing handling for malformed records/requests; return an ordered denial with `invalid-record`.
3. Add focused regression tests for both reproduced cases, then rerun this review matrix under CI Node 22.
4. Keep the evaluator unimported by product paths until those tests pass and a separately reviewed integration defines the user-safe fallback state.

## Re-review verdict — PASS (2026-07-28)

**PASS for the repaired, unintegrated evaluator.** The two implementation blockers above are resolved, focused adversarial checks return explicit denials without throwing, no product-surface imports were introduced, and the required regression matrix passed. This is an implementation re-review only: it is not business, licensing, pricing, legal, or release approval, and any future product-path integration still requires its own fallback-state review.

### Prior blocker 1: monotonic supersession — PASS

The repair constructs `supersededIds` from all usable non-draft records for the requested subject before it filters records by approval date, expiry, jurisdiction, product, or assertion. Therefore a successor remains authoritative for supersession even when it cannot itself allow the request.

Direct adversarial checks returned the following explicit denials:

```text
expired-successor     {"allowed":false,"reasons":["superseded-record","expired"],"evidenceIds":["predecessor","expired-successor"]}
out-of-scope-successor {"allowed":false,"reasons":["superseded-record","scope-mismatch"],"evidenceIds":["predecessor","out-of-scope-successor"]}
```

The targeted test suite also includes the expired-successor regression case.

### Prior blocker 2: nonthrowing malformed input handling — PASS

The repair now validates runtime record and request shapes before property access. Direct checks verified that undefined `jurisdictions`, `products`, and `assertions`; non-array `supersedes`; `null`/`undefined` requests; and undefined records all return `allowed: false` with `invalid-record` and do not throw. The optional `supersedes: undefined` remains valid by design; a malformed non-array value is denied.

### Re-review regression evidence (run serially)

| Check | Result |
| --- | --- |
| `npm exec vitest run src/governance/sourceEvidence.test.ts` | PASS — 1 file, 12 tests |
| Manual supersession/malformed-input adversarial checks | PASS — explicit denial, no exceptions |
| `npm test` | PASS — 16 files, 168 tests |
| `npm run test:home-fidelity` | PASS — contract hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9` |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — existing external-script and chunk-size warnings observed |
| `git diff --check` | PASS — no whitespace errors |

### Remaining Node 22 CI limitation

The workflow remains explicitly pinned to Node 22 and `package.json` requires `22.x`, but this host has Node `v25.2.1` only and no locally available Node 22 version manager/runtime. The repair uses no apparent Node-25-only feature; nevertheless, the required final runtime confirmation is a successful GitHub Actions run under its configured Node 22 environment.

## Current re-review verdict — PASS (normalization hardening, 2026-07-28)

**PASS for the current unintegrated implementation.** The second hardening rewrite preserves the prior explicit-deny behavior, adds deterministic input normalization, and introduces no product-surface import. It does not alter the calculator, qualification, lead, authentication, route, SEO, or existing hold paths. The CI change remains limited to running the existing homepage-fidelity contract after unit tests and before the build.

### Normalization and default-deny review: PASS

- Records and requests are accepted only from own, plain data properties with an allowlisted key set. Unknown keys, inherited fields, accessors, symbols, sparse arrays, replaced instance methods, malformed arrays, duplicate IDs/fingerprints, cross-subject/missing/self supersession targets, and cycles deny rather than being interpreted.
- The evaluator snapshots scalar/array data before evaluation, bounds collection and scope sizes, sorts normalized records deterministically, and catches hostile-shape exceptions at its public boundary with an `invalid-record` denial.
- Direct independent probes confirmed a canonical record allows, while an expired or out-of-scope successor keeps its predecessor denied with `superseded-record`; unknown keys and throwing accessors deny without an exception.
- The source scan again found no `sourceEvidence` reference elsewhere in `src`; the evaluator remains inert until a separately reviewed product integration exists.

### Compatibility observation (non-blocking while unintegrated)

The normalizer deliberately treats an explicit empty `supersedes: []` as invalid, whereas the TypeScript field remains typed as an optional array. This is conservative and preserves default-deny behavior, and no current code imports the evaluator. Before an external registry or product integration is introduced, document whether canonical no-predecessor data must omit the field (the current implementation) or whether an empty array should be accepted; do not silently assume those shapes are interchangeable.

### Current serial regression evidence

| Check | Result |
| --- | --- |
| `npm exec vitest run src/governance/sourceEvidence.test.ts` | PASS — 1 file, 16 tests |
| Independent normal-record/supersession/hostile-shape probes | PASS — deterministic allow or explicit denial; no exception |
| `npm test` | PASS — 16 files, 172 tests |
| `npm run test:home-fidelity` | PASS — contract hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9` |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — pre-existing external-script and chunk-size warnings observed |
| `git diff --check` | PASS — no whitespace errors |

### Remaining Node 22 CI limitation (unchanged)

This host remains on Node `v25.2.1`; the repository declares Node `22.x` and the workflow pins Node 22. No Node-25-only construct is apparent in the evaluator or CI change, but a successful GitHub Actions run is still the required final confirmation under the production-intent runtime.
