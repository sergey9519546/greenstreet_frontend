# Company / Project Context

## Mission
Non-QM wholesale DSCR engine. Direct-to-broker, two-sided trust platform. Goal: $5B by 2028.

## What we build
- **Deterministic DSCR engine** (TypeScript `src/engine/`, Python lib): no LLM math, golden-vector tested.
- **Greenstreet portal** (`greenstreet_frontend/`): React 19 + Vite + Express, port 3000. Tools: DSCR Analyzer, Sensitivity, Optimizer, State PPP.
- **Marketing site** (`MarketingSite.tsx`): Webflow export, being re-skinned from generic compliance template → DSCR positioning.

## Stack
- Frontend: React 19, Vite, Tailwind, Firebase Auth + Firestore
- Server: Express, `tsx server.ts` (no hot-reload — restart on server changes)
- Engine: pure TS, deterministic. LLM only for `/api/narrate` (explanation, never numbers).
- Knowledge graph: graphify → graphify-out/

## Key facts (marketing, sourced from ANALYSIS/)
- 2025 securitized DSCR loans: weighted-avg DSCR 1.10x
- 63.04% had no lease at origination (priced on projected rent)
- 3.82% 30-day delinquent at issuance
- 89.44% property-focused (Verus S&P 2025)
- 50 states of prepay/usury/ARM rules encoded

## Run / verify
- Preview: `preview_start` name `greenstreet-portal`, port 3000
- Server name in `.claude/launch.json`: `greenstreet-portal`
- Restart server after editing `server.ts`

## Reference files
- ANALYSIS/MASTER_ANALYSIS.md, GOLDEN_VECTORS.md, TOPICAL_INDEX.md
- CLAUDE.md (project) = graphify instructions
