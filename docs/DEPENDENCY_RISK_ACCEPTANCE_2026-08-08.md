# Dependency risk acceptance — 2026-08-08

## Decision

Temporarily accept `GHSA-w5hq-g745-h8pq` as a low practical exposure until
Firebase Admin or Google Cloud Storage publishes a supported dependency update.
Do not use `npm audit fix --force` or unsupported transitive overrides.

## Evidence

- `npm audit` reports seven moderate findings and no high or critical findings.
- All seven findings propagate from one optional dependency chain:
  `firebase-functions@7.3.2` → `firebase-admin@14.2.0` →
  `@google-cloud/storage@7.21.0` → `uuid@9.0.1`.
- `npm audit --omit=optional` reports zero vulnerabilities.
- The application imports Firebase Admin App, Auth, and Firestore modules; it
  does not import the optional Storage module.
- The installed affected consumers call UUID v4 without caller-provided output
  buffers. The advisory describes the vulnerable bounds behavior in UUID v3,
  v5, and v6 paths.
- `npm audit fix --dry-run` proposes no supported change. The force proposal is
  a multi-major Firebase downgrade, while direct transitive overrides would
  violate the dependency majors declared by Google Cloud Storage.

## Controls and review trigger

- Keep Firebase Admin, Firebase Functions, and Google Cloud Storage on supported
  published versions.
- Rerun both `npm audit` and `npm audit --omit=optional` whenever Firebase Admin
  or Google Cloud Storage changes its Storage dependency tree.
- Reassess immediately if application code begins importing Firebase Storage.
- Otherwise review this acceptance by 2026-09-08.

References:

- [GitHub advisory GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
- [Firebase Admin Node.js release notes](https://firebase.google.com/support/release-notes/admin/node)
