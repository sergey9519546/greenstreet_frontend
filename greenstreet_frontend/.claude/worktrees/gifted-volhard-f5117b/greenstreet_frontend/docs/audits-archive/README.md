# Audit archive — RESOLVED / historical

> **These reports are historical (2026-06-23/24, engine v11.1) and are kept for the
> record only. As of 2026-06-28 every concrete item in them is fixed or was a
> false alarm.** Do not re-action them blind — re-verify against current code first.
> They previously caused a phantom "Tax Engine always returns 0" chase; the bug was
> already fixed.

## Verified status (2026-06-28)

| Domain | Reports | Status | Evidence |
|---|---|---|---|
| Frontend UX | `QA_FIXPLAN.md`, `QA_REPORT_DEFINITIVE_2026-06-24.md`, `ULTRA_REVIEW_2026-06-24.md`, `DESIGN_LOGIC_AUDIT.md`, `DESIGN_QA_ULTRAPLAN.md` | ✅ done | ErrorBoundary present; mobile nav collapses (0px overflow, burger opens); slug re-render fixed (`key={pathname}`); routing round-trips (incl. deal-analyzer / portfolio-builders); compliance→DSCR rebrand; Tax-Engine `afterTaxIRR` TDZ bug fixed; Kiavi minDSCR 0.8→1.10; Insula/UWM removed; broken home img + external-CDN imgs gone |
| Engine math/data | `99_external_check/scripts/audit_final_1..10.md` (v11.1) | ✅ PASS | math 53/53, lenders, PPP (PA/MN HF 3437), rates, provenance 277/277, STR haircuts, tax (OBBBA), sensitivity. Frontend `src/engine` matches: `BASE_RATE_ANCHOR=6.125`, `PA_PPP_THRESHOLD_2026=329_411`, OBBBA logic |
| Backend security | `FULL_STACK_AUDIT.md` | ✅ done | `serverApp.ts`: CORS, `express-rate-limit`, `verifyFirebaseToken` auth, Zod `validateBody`, 100kb body limit, security headers (nosniff/DENY/HSTS/Referrer/Permissions), GDPR-aware request logging, `errorHandler`, `/health`, `SIGTERM` graceful shutdown. `firestore.rules` are restrictive (per-user ownership, immutable audit logs, validated lead writes, deny-all catch-all). 135 tests pass; build is lazy-chunked |

### The "🔴 critical" alarms were stale/false
Exposed API keys (key is server-side, 0 hits in 49 client bundles) · no auth · no input
validation · no rate limiting · no tests · no code-splitting · TDZ-zero Tax Engine ·
white-screen Blog/Portfolio · open Firestore DB — **all addressed since 2026-06-24.**

## What genuinely remains (not in code)
- **External devops:** CI/CD pipeline (GitHub Actions) + a monitoring service (e.g. Sentry); rate-limiter→Redis/Firestore store for true serverless scale.
- **Open content decisions:** lender set 11-vs-13; trust-band / fabricated home logos (see memory `project_home_fabricated_logos`).
