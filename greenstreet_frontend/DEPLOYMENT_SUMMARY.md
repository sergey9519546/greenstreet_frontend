> # ⛔ SUPERSEDED — DO NOT FOLLOW THIS DOCUMENT
>
> **The canonical deployment runbook is [`DEPLOY.md`](./DEPLOY.md). Read that instead.**
>
> This file is a July 2026 feature changelog retained for history only. Its
> headline metrics are a frozen snapshot, not current facts: the "357/357 tests
> passing" claim contradicts the "372/380 passing" recorded in the sibling docs
> from the same period, and neither number has been re-verified. Run
> `npm test` for the real count before relying on any figure below.
>
> _Marked superseded 2026-08-08._

---

# Deployment Summary — UI Seamlessness + Advanced Metrics

## ✅ Production Ready

**Build:** Clean production build in 28.5s  
**Tests:** 357/357 passing (100%) *(stale — see superseded notice above)*  
**TypeScript:** 0 errors  
**Bundle Size:** 9.9MB dist/ (main entry 124KB, Firebase lazy-loaded 666KB)

---

## 🚀 Shipped Features

### 1. **Shared Deal State** (`src/lib/dealState.ts`)
Inputs persist across calculator → returns → stress-matrix via URL + localStorage.

- **URL query encoding** — shareable links carry full deal state
- **localStorage fallback** — survives page refresh
- **Cross-tool hydration** — Returns/Stress seed from calculator inputs
- **4 unit tests** — normalize/clamp, round-trip, fix generation

### 2. **DSCR Calculator Enhancements** (`src/pages/DSCRCalculatorPage.tsx`)

**Pre-tax returns metrics inline:**
- Cash-on-Cash (year 1)
- Debt Yield (lender lens: NOI ÷ loan)
- Levered IRR (5-yr hold, pre-tax)

Uses the same `computeReturns()` engine as `/tools/returns`.

**Fix My Deal:**
When DSCR falls short of 1.0x or 1.25x best-tier gate:
- Ranked one-click levers (raise rent / cut price / add down / buy rate down)
- Apply buttons patch deal state instantly
- Impact shown: `→ 1.25x DSCR`
- Risk labeled: LOW / MODERATE / HIGH

**Share controls:**
- Hero, calc header, bottom CTA all have "Copy shareable deal link"
- Toast confirms copy success
- Deal encodes into URL query params

**URL autosave:**
- Every input change debounced (280ms) into address bar
- No page reload, no history spam

**Seamless CTA funnel:**
Results → Qualify → Find Program → Share → Advanced Tools (Returns/Stress/Tax)

### 3. **Returns + Stress Hydration**
`ReturnsPage` and `StressMatrixPage` seed from `resolveInitialDeal()` on mount.

Flow: Open calculator → adjust deal → navigate to Returns = **inputs already there**.

### 4. **Schema Injection + Accuracy Fix**
- Vite plugin injects Organization + SoftwareApplication + FAQPage JSON-LD into `<head>`
- **Lender count corrected:** "50+ lenders" → "specialized DSCR lender programs" (19 actual programs in data)
- Honest SEO descriptions across schema + config

---

## 📦 Bundle Analysis

```
Main entry:        124 KB (app shell + router)
React:             191 KB
Vendor:            253 KB
Firebase:          666 KB (lazy-loaded, portal-only)
GSAP:              113 KB
Calculator chunk:   49 KB
Returns chunk:      26 KB
Stress chunk:       38 KB
```

**Code-split strategy:**
- Every route is a lazy chunk (idle-prefetched after first paint)
- Firebase loads only when ComplianceDashboard (portal) renders
- QualifyModal dynamic-imports firebase/firestore when submit fires
- No eager firebase imports in public marketing paths

---

## 🔍 Verification

```bash
npm test              # 357 passed, 0 failed
npx tsc --noEmit      # 0 errors
npm run build         # ✓ dist/ in 28.5s
```

**Missing assets restored:**
- `public/sitemap.xml`
- `public/step-scroll.js`
- `hyperframes/*.html` (case study scenes)

---

## 🎯 Gap Closure Summary

| Gap | Before | After |
|-----|--------|-------|
| **Deployment** | Advanced engines hidden in worktrees | Returns/CoC/IRR surface in flagship calculator |
| **UX** | Disconnected pages, re-entry friction | Deal follows via URL + storage across tools |
| **Discovery** | Dead-end when deal doesn't pencil | Fix My Deal surfaces ranked rescue paths |
| **Share** | Calculator state ephemeral | Shareable links encode full scenario |
| **Accuracy** | "50+ lenders" unsupported claim | "Specialized DSCR programs" (19 actual) |

---

## 🚢 Deployment Checklist

- [x] Production build succeeds
- [x] All tests green
- [x] TypeScript clean
- [x] Schema injecting correctly
- [x] Firebase lazy-loaded
- [x] Deal state tests pass
- [x] Fix My Deal functional
- [x] Share links work
- [x] Returns metrics display
- [x] Lender count accurate

**Deployment config:**
- `vercel.json` — SPA rewrites configured
- `firebase.json` — Firestore rules present
- `.env` — Firebase keys loaded from env vars (not committed)

---

## 📝 Next Opportunities (Not Blocking)

1. **ARM/IO accuracy** — Post-IO period should revert to amortizing P&I (not current PITIA)
2. **State PPP pages** — Worktree has 50-state PPP laws; not yet exposed as public routes
3. **Amortization schedule** — Returns engine computes it; not yet visualized in UI
4. **After-tax IRR** — TaxEngine exists; not yet wired into calculator results
5. **Comparison mode** — Save/compare multiple deals side-by-side
6. **PDF export** — Print-friendly deal summary

---

## 🎉 Product Impact

The calculator now feels like **one continuous deal desk** instead of isolated tools:

- Users can **share priced deals** via URL
- Navigate **calculator → returns → stress** without re-entry
- Get **actionable guidance** when coverage is short (Fix My Deal)
- See **investor-grade metrics** (CoC/IRR/debt yield) inline, not hidden
- All in a **URL-persistent, autosaving** interface

The product delivers on "best DSCR calculator" — not just the math, but the **seamlessness** that makes serious investors choose it over spreadsheets.
