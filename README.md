# Greenstreet DSCR Engine

Active full-stack product repo for the Greenstreet Finance DSCR / Non-QM deal engine.

## What This Repo Contains

- React 19 + Vite frontend
- Express/Firebase-compatible server entrypoints
- Deterministic DSCR engine modules in `src/engine`
- Marketing/product pages, calculators, lender logic, and QA artifacts

The project root outside this folder is the research corpus, data lake, legacy reference code, and generated artifact area. Do not treat root-level research files as part of the app source tree.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run start
```

## Environment

Copy `.env.example` or `.env.production.example` and fill in local values. Real `.env` files are ignored and should not be committed.

## Operational Lead Delivery

The public loan-request flow acknowledges a submission only after it has been
stored in Firestore and delivered to an authenticated staff/CRM webhook.
Configure `LEAD_NOTIFICATION_WEBHOOK_URL` and
`LEAD_NOTIFICATION_WEBHOOK_TOKEN` as deployment secrets. The receiver gets a
`lead.created.v1` JSON event plus an `Idempotency-Key` header containing the
submission UUID.

For Firebase Functions, register the two required secrets before deployment:

```bash
firebase functions:secrets:set LEAD_NOTIFICATION_WEBHOOK_URL
firebase functions:secrets:set LEAD_NOTIFICATION_WEBHOOK_TOKEN
```

`GET /health` returns HTTP 503 with
`leadIntake: "notification_unconfigured"` until the delivery destination is
available. It returns HTTP 200 with `leadIntake: "ready"` after configuration.

## Important Boundaries

- `greenstreet_frontend/` is the active product repo.
- `../DSCR_SOVEREIGN_OS/` is a legacy/reference repo, not code to promote directly.
- `../DSCR_Datasets/` is the raw dataset lake.
- `../00_engine/data/` is derived/rebuildable engine data and testbed output.
