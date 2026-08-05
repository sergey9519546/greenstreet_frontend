# Dependency Security Baseline

**Status:** initial observation-only baseline, supplemented by the controlled dev-only lock resolution below. No production dependency, npm configuration, package script, GitHub setting, or deployment setting changed.

**Purpose:** record a reproducible production-dependency audit result before a named engineering and security owner decides whether any update is justified and can be tested without breaking the current application.

## Scope

This baseline is limited to the root application's installed **production** dependency graph. It intentionally excludes development dependencies by using npm's `--omit=dev` option. It does not audit the independent example/experiment folders that have their own `package.json` files, nor does it establish which dependencies are exercised by a particular deployment path.

The inspected root manifest is `greenstreet-dscr-engine@0.1.0`. It declares ten direct production dependencies: `@anthropic-ai/sdk`, `cors`, `dotenv`, `express`, `express-rate-limit`, `firebase-admin`, `firebase-functions`, `pino`, `pino-pretty`, and `zod`.

## Exact audit run

| Field | Recorded value |
| --- | --- |
| Date and recorded start (UTC) | 2026-07-28T12:09:44.1632582Z |
| Working tree | `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend_ultraplan` |
| Exact command | `npm audit --omit=dev --json` |
| Command result | The npm registry responded successfully. npm returned exit code `1`, which is expected when the audit reports vulnerabilities. |
| Node/npm used for the observation | Node `v25.2.1`; npm `11.7.0` |
| Repository-declared Node line | `22.x` |
| Dependency lock | Root `package-lock.json`, lockfile version `3` |

## Observed result

The audit metadata reported **8 vulnerabilities total**: **0 critical**, **0 high**, **8 moderate**, **0 low**, and **0 informational**. npm reported 213 production dependencies in the resolved graph (651 total dependencies across all categories).

The reported affected package records were `firebase-admin` (the direct production dependency) and seven transitive records: `@google-cloud/firestore`, `@google-cloud/storage`, `gaxios`, `google-gax`, `retry-request`, `teeny-request`, and `uuid`. The lockfile resolves `firebase-admin` to `13.10.0`; its manifest range is `^13.10.0`.

npm described `firebase-admin@14.2.0` as a potential fix path for the Firebase/Google dependency chain and marked it semver-major. That is an audit suggestion, not an approved change or compatibility conclusion. No `npm audit fix`, install, update, or lockfile regeneration was run.

## Reproducibility and interpretation

To repeat this exact scope against the then-current npm advisory service, use a clean checkout with the committed root `package-lock.json`, an installed dependency tree matching it, and the command shown above. Prefer the repository's declared Node `22.x` line for a release decision; this observation used Node 25 and therefore is not a substitute for the required CI/runtime check.

Audit findings depend on the registry's advisory database and can change without a source change. The command evaluates known package advisories in the resolved graph; it does not prove exploitability, reachability, configuration safety, transitive license suitability, secret handling, privacy compliance, CSP safety, secure deployment configuration, or release readiness.

## Required no-breakage posture

Do not remediate automatically. Before any dependency upgrade, removal, override, or package-manager change, a named dependency/security owner must:

1. confirm the affected runtime path and advisories in the target environment;
2. approve the intended version and compatibility risk, especially for the proposed major `firebase-admin` change;
3. make the smallest isolated change in a dedicated branch;
4. run the full application, server, homepage-fidelity, route, and deployment regression gates on the repository's supported Node version; and
5. retain a tested rollback path.

This baseline is not a complete security, privacy, legal, compliance, or release approval.

## Supplementary Node 22 compatibility finding

A later read-only audit under Node `v22.23.1` and npm `11.6.2` reproduced the production result: 8 moderate findings and no high or critical finding when development dependencies are omitted. A full-graph audit additionally reported a high-severity `postcss@8.5.15` advisory through Vite; that package is development-only. A later safe `8.5.x` release is a separately reviewable, low-risk lock-resolution candidate, but no dependency or lockfile change was made here.

There is no verified complete non-major production remediation for the Firebase/Google chain. npm suggests `firebase-admin@14.2.0`, which is a major update. `firebase-functions@7.2.5` excludes that Admin version in its peer range, while `firebase-functions@7.3.2` is a possible companion version within the declared Functions range. Do not use a forced audit recommendation that downgrades the project to `firebase-admin@10.3.0` and `firebase-functions@4.9.0`; that is a peer-resolution downgrade, not an evaluated remediation.

Most importantly, `firebase.json` currently pins Functions to `nodejs20`, while the proposed Admin 14 line requires Node 22 or later. Firebase documents that `firebase.json` takes precedence over the package engine and supports `nodejs22`; a Firebase runtime migration must therefore be separately approved, exercised in a non-production project, and have a rollback before the Admin upgrade is attempted. See [Firebase's runtime guidance](https://firebase.google.com/docs/functions/manage-functions). This remains a compatibility gate, not proof of advisory reachability or exploitability.

## Controlled dev-only PostCSS resolution

The narrow development-only resolution has now been applied to the root lockfile. It changes only `node_modules/postcss` from `8.5.15` to `8.5.24` and its required `node_modules/nanoid` from `3.3.15` to `3.3.16`; both entries remain marked `dev: true`. `package.json`, the Vite version/range, runtime source, production dependency set, and deployment configuration are unchanged. This was a manual, metadata-verified lock resolution because npm's targeted and dry-run remediation commands reported no transitive update; no broad `npm audit fix`, force flag, root PostCSS dependency, or override was used.

Against the exact lock SHA-256 `F823AFD0A419CC054452FA12AE00D71C70448E717E9894DDE2F84F1449C7017C`, clean `npm ci` under Node `v22.23.1` / npm `11.6.2`, `npm ls postcss nanoid --all`, lint, the 25-file / 217-test suite, homepage fidelity, build, artifact report, and diff check passed. `postcss` is absent from both current full and `--omit=dev` audit output, removing the former high-severity development advisory.

The npm advisory service is not stable enough to use its count as a regression signal here: repeated production-only audits against the same unchanged lock alternated between eight and nine moderate records, with only the inherited `firebase-functions` effect record appearing or disappearing. Neither report includes PostCSS or NanoID, and every Firebase/Google/UUID lock entry is unchanged from the initial baseline. Preserve the raw audit JSON, timestamp, npm version, and lock hash with any later release evidence.
