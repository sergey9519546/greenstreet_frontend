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

## Important Boundaries

- `greenstreet_frontend/` is the active product repo.
- `../DSCR_SOVEREIGN_OS/` is a legacy/reference repo, not code to promote directly.
- `../DSCR_Datasets/` is the raw dataset lake.
- `../00_engine/data/` is derived/rebuildable engine data and testbed output.
