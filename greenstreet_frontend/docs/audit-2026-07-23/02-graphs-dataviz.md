# Ultimate Audit — Graphs & Data-Visualization (Report 02)

**Scope:** Greenstreet DSCR lending platform, `/home/user/greenstreet_frontend`
**Auditor focus:** the two "graph" systems the user asked to check.
**Date:** 2026-07-23 · Read-only audit (no repository files modified).

- **SYSTEM A** — the code-dependency graph in `graphify-out/` (graph.json, GRAPH_REPORT.md, 76 cache files).
- **SYSTEM B** — investor/borrower-facing data visualizations: the `hf-*` hyperframe animations and the in-app charts (Stress Matrix, Monte Carlo, Returns, Portfolio, State Laws map, Refi, DSCR calculator, Compliance Dashboard, design artifacts).

---

## HEADLINE: Do any charts show FAKE / hardcoded data?

**No in-app chart fabricates numbers from thin air.** Every interactive calculator (Stress Matrix, Monte Carlo, Returns, Refi, Portfolio, DSCR gauge) computes its displayed values via `useMemo` over the *real* engine functions (`computeStressMatrix`, `runMonteCarloRatePath`, `computeReturns`, `analyzeRefi`, `analyzePortfolio`) applied to live user inputs. The charts are genuine, not decorative mock-ups.

**However, three real data-integrity problems exist where hardcoded/divergent/stale data is presented as authoritative:**

1. **CRITICAL/HIGH — the 50-state legal "compliance map" (StateLawsPage) does NOT use the company's own 147 KB legal engine.** It is driven by a hand-maintained hardcoded table of **24 states**; the other **26 states are silently defaulted to green "PPP Allowed / No special residential restriction on record."** This includes states the engine itself flags as legally *ambiguous* (e.g., Michigan). This is fabricated-authoritative compliance data on a lending site — the single most serious finding in this report.
2. **MEDIUM — Monte Carlo / ARM pages default to a hardcoded market-rate snapshot dated 2026-06-17,** shown as the "current" SOFR/Treasury/Fed Funds five-plus weeks later, with no auto-refresh.
3. **MEDIUM — the flagship public DSCR calculator reimplements loan amortization inline (30-year term hardcoded)** instead of importing the audited engine, creating a silent divergence risk.

**Total findings: 13** (System A: 5 · System B: 8).

---

# SYSTEM A — Code-Dependency Graph (`graphify-out/`)

**What generated it:** A GraphRAG-style static code-structure extractor ("graphify"). `graph.json` is a NetworkX node-link document (`directed:false, multigraph, nodes, links, hyperedges`) — 367 nodes, 478 edges, 75 detected "communities." `GRAPH_REPORT.md` reports `Extraction: 100% EXTRACTED · 0% INFERRED` and `Token cost: 0 input · 0 output`, i.e., it is a deterministic AST/regex parse, **not** an LLM analysis. It was run on **2026-06-24** on a **Windows** machine.

### Top System A issues
- A-1 (Medium): a build/analysis artifact is committed to git.
- A-2 (Medium): the graph is stale — 17 current source files are missing from it.
- A-3 (Low–Medium): committed cache leaks full internal code structure + dev-OS paths.

---

### A-1 — MEDIUM — Generated build artifact committed to the repository
**EVIDENCE:** `git ls-files graphify-out/` → **78 tracked files** (`graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, and 76 `graphify-out/cache/*.json`). `.gitignore` (repo root) has **no** entry for `graphify-out/`. Directory size 712 KB.
**IMPACT:** A tool-generated analysis artifact is versioned as if it were source. It will drift from reality on every commit (see A-2), bloats the repo with 76 machine-named hash files, and produces noisy diffs. It is the graph analogue of committing `dist/` or `coverage/` (both of which *are* correctly git-ignored here).
**RECOMMENDATION:** Add `graphify-out/` to `.gitignore` and `git rm -r --cached graphify-out/`. If the report is wanted as documentation, keep only `GRAPH_REPORT.md` under `docs/` and regenerate on demand; never commit `cache/` or `graph.json`.

### A-2 — MEDIUM — Graph is stale; does not reflect current `src/`
**EVIDENCE:** `GRAPH_REPORT.md:1` is dated `2026-06-24`; last git commit touching `graphify-out/` = `19388bc 2026-06-24`. Since then `src/` advanced (e.g., commit `1278a62 2026-06-25`). Cross-checking node `source_file` values against disk: **0 graphed files are deleted, but 17 current source files are absent from the graph**, including entire new subsystems:
`src/routes/dscr.ts`, `src/routes/narrate.ts`, `src/routes/schemas.ts`, `src/middleware/{auth,error,validate}.ts`, `src/serverApp.ts`, `src/engineService.ts`, `src/engineWorker.ts`, `src/function.ts`, `src/engine/qualify.ts`, `src/engine/modes.test.ts`, `src/components/QualifyModal.tsx`, `src/components/QualifyWidget.tsx`, `src/design/artifacts.tsx`, `src/design/SiteShell.tsx`, `src/data/usMapPaths.ts`.
**IMPACT:** Any decision made from this graph (coupling, dead-code, god-nodes) is based on a June snapshot that omits the entire server/routes/middleware layer, the web worker, and the qualify engine. A committed-but-stale artifact is worse than none — it looks authoritative while being wrong.
**RECOMMENDATION:** Either delete it (per A-1) or add a CI step that regenerates it and fails if `git diff --exit-code graphify-out/` is dirty, so it can never silently rot.

### A-3 — LOW/MEDIUM — Cache leaks internal code structure and developer-OS paths
**EVIDENCE:** All node/edge `source_file` values use Windows separators, e.g. `graph.json` → `"source_file": "src\\App.tsx"`, `"scripts\\transparent_logos.py"`. Each `graphify-out/cache/<sha256>.json` embeds file names, function names and line numbers, e.g. `03bb4cb…json` → `{"nodes":[{"id":"test_urls_ps1","label":"test-urls.ps1",…"source_location":"L1"}]}`.
**IMPACT:** The 76 committed cache files publish a complete internal map of the codebase (every function name, file, and line) and reveal the author's Windows build environment. No credentials leak (`grep -riE 'api[_-]?key|secret|token|sk-|AKIA'` over `graphify-out/` = none), so this is disclosure-of-structure, not secrets — but it is unnecessary attack-surface intel to ship in a public web repo.
**RECOMMENDATION:** Stop committing `cache/` (covered by A-1). Regenerate cross-platform so paths are normalized if the graph is ever kept.

### A-4 — LOW — Report is mostly noise; garbage-in nodes reduce trust
**EVIDENCE:** `GRAPH_REPORT.md` lists **75 communities but ~40 of them have `Nodes (0)`** (e.g., Communities 20–24, 37–42, 45–74) and many singletons with `Cohesion: 1.0`. One "isolated node" is a **code comment parsed as a graph node**: `graph.json` node `transparent_logos_rationale_1`, `file_type: "rationale"`, label `"Carefully remove white background from logos. Method: border-connected flood fi…"` (from `scripts\transparent_logos.py`). "Surprising Connections: None detected."
**IMPACT:** The extractor turns Python comments into first-class nodes and emits dozens of empty communities, so the signal (real god-nodes) is buried in artifacts. A reader cannot easily distinguish a genuine finding from a parser hiccup.
**RECOMMENDATION:** If retained, filter comment/rationale pseudo-nodes and suppress empty communities before writing the report.

### A-5 — LOW/INFO — Legitimate findings inside the report that were never acted on
**EVIDENCE:** `GRAPH_REPORT.md:90-99` god-nodes: `solveDSCR() – 15 edges`, `estimateRate() – 12`, `scoreOneLender() – 11`, `mFixed() – 11`. `GRAPH_REPORT.md:107-108` flags **Community 0 with cohesion 0.14 (29 nodes)** and explicitly suggests splitting it.
**IMPACT:** Low on its own, but note the god-node list is genuinely useful and directly relevant to System B: `solveDSCR()` is the #1 most-connected abstraction (15 edges) — yet the public DSCR calculator bypasses it (see B-2). The graph's one real insight corroborates a real product bug.
**RECOMMENDATION:** Use the god-node ranking as a refactor/centralization checklist; verify each high-degree engine function is the *single* source of truth (it currently is not — see B-2).

---

# SYSTEM B — Investor-Facing Visualizations & Charts

**Two sub-systems:**
- **`hf-*` hyperframes** (13 top-level dirs) — 1920×1080 GSAP animation compositions (HeyGen "Hyperframes", schema `hyperframes.heygen.com`) that render to marketing MP4s. **Offline assets, not part of the deployed React app.**
- **In-app charts** — React calculator pages under `src/pages/` plus `src/design/artifacts.tsx` (DSCR gauge, balance scale, risk flame) and `src/components/ComplianceDashboard.tsx`.

### Top System B issues
- B-1 (HIGH): the 50-state compliance map is hardcoded, diverges from the legal engine, and defaults unknown states to "allowed."
- B-2 (MEDIUM/HIGH): the public DSCR calculator reimplements amortization instead of using the audited engine.
- B-3 (MEDIUM): a hardcoded, stale market snapshot is presented as current rates.

---

### B-1 — HIGH — State-law compliance map is hardcoded, diverges from the legal engine, and defaults unlisted states to "PPP Allowed"
**EVIDENCE:**
- `src/pages/StateLawsPage.tsx:19` `const SPECIAL: Record<…>` — a hand-entered table containing **only 24 states** (AK, AR, CA, FL, GA, IL, KS, ME, MD, MN, MS, NJ, NM, NY, ND, OH, OK, PA, RI, SC, TX, WA, WV, WI).
- `StateLawsPage.tsx:53-61` `resolve(code)`: `const sp = SPECIAL[code]; const tier = sp ? sp.tier : 0;` and `ppp: sp ? sp.ppp : "Business-purpose prepayment penalties generally permitted. No special residential restriction on record."` → **every state not in the 24 is painted tier 0 = green "PPP Allowed / Standard pricing."**
- `StateLawsPage.tsx` imports **only** `US_PATHS`/`US_VIEWBOX` from `../data/usMapPaths`. It does **not** import `getStateLaw`, `checkPPPLegal`, or anything from `src/engine/statePppLaws.ts` (grep for `statePppLaws|getStateLaw|checkPPP` in the page = 0 hits).
- The authoritative engine `src/engine/statePppLaws.ts` (147 KB) covers **43 states + DC** with statute citations and explicit risk flags. Proof of divergence for states the map defaults to green:
  - **Michigan** — `statePppLaws.ts:297,1614`: *"Michigan has no clear legal consensus… no legal consensus as of 2026 on whether PPPs are allowed, restricted, or banned. Lender-interpretation varies significantly."* The map shows **MI as green "PPP Allowed / No special residential restriction on record."**
  - **Colorado** — `statePppLaws.ts:418-425`: 3-2-1 declining cap + UCCC detail. Map shows generic green.
  - Missouri (`:647`), Louisiana (`:1098`) — engine has specific statutory analysis; map shows the generic default string.
**IMPACT:** This is the most serious integrity issue in the audit. On a lending-compliance product, the borrower/broker-facing 50-state map (a) **duplicates** rather than uses the company's own legal engine, guaranteeing drift, and (b) **fails open** — any state a human didn't hand-enter is presented as unambiguously "PPP Allowed," including a state the firm's own engine says is legally ambiguous. That is fabricated-authoritative legal guidance and a real compliance/liability exposure.
**RECOMMENDATION:** Drive `StateLawsPage` from `statePppLaws.ts` (the single source of truth). For any state without verified data, render an explicit "Not verified — confirm with counsel" state, never a default "Allowed." Add a test asserting every `ALL_CODES` entry resolves to engine-backed data.

### B-2 — MEDIUM/HIGH — Public DSCR calculator reimplements amortization inline instead of using the audited engine
**EVIDENCE:** `src/pages/DSCRCalculatorPage.tsx:12-15`:
```
const pf = (r: number) => { if (r === 0) return 0; const m = r / 12;
  return (m * Math.pow(1 + m, 360)) / (Math.pow(1 + m, 360) - 1); };
```
The term is **hardcoded to 360 months (30-yr)**; PITIA/DSCR are then computed locally (`:47-48` `const pitia = pAndI + tax/12 + ins/12 + hoa; const dscr = rent / pitia`). The page imports **nothing** from `src/engine/` (only `design/dc`, `theme`, `design/artifacts`). The audited engine already provides `calculatePI(loanAmount, annualRate, termMonths)` via `calculatePaymentFactor` (`src/engine/engine.ts:53-56`), `calculateIOPayment` (`:58-60`), and `solveDSCR` — the graph's #1 god-node.
**IMPACT:** The flagship, most-trafficked public tool computes DSCR with a parallel, un-audited implementation that (a) assumes 30-yr amortization only (wrong for 40-yr or interest-only DSCR products the platform supports), and (b) can silently diverge from every other surface (Stress Matrix, Returns, Compliance Dashboard) that *does* use the engine. A borrower could get one DSCR on the calculator and a different one in underwriting.
**RECOMMENDATION:** Replace the inline `pf`/PITIA math with `calculatePI`/`solveDSCR` from `src/engine`. Add a unit test asserting the page's output equals the engine's for a shared fixture.

### B-3 — MEDIUM — Hardcoded, stale market snapshot presented as "current" rates
**EVIDENCE:** `src/engine/armResetEngine.ts:34-45` `CURRENT_MARKET_SNAPSHOT` with `asOfDate: '2026-06-17'`, `treasury10Y: 4.47`, `sofr30Day: 3.59`, `freddieMac30YrFixed: 6.53`, `provenance: 'VERIFIED_PRIMARY'`. Re-exported by `monteCarloRatePath.ts:41` and used as the **default** market input (`:183`, `:241`). `MonteCarloPage.tsx:208` seeds `initialSofr` from `CURRENT_MARKET_SNAPSHOT.sofr30Day`.
**IMPACT:** As of the audit date (2026-07-23) these "current" Treasury/SOFR/Fed-Funds/Freddie figures are **~5 weeks old** and static — they never refresh. The Monte Carlo simulation and ARM reset ladder start from stale rates while labeling them the current market, which biases every projection shown to investors.
**RECOMMENDATION:** Fetch the snapshot from a live source (or a dated feed) and surface the `asOfDate` prominently in the UI with a staleness warning when it exceeds, e.g., 14 days. At minimum, display `asOfDate` on the Monte Carlo/ARM pages so users know the vintage.

### B-4 — MEDIUM — Misleading "50 states mapped" headline stat; inflated "clear to quote" count
**EVIDENCE:** `StateLawsPage.tsx:134` renders a hero stat **"50 / states mapped"**; `:135-136` compute "need restructure" = `counts[2]+counts[3]` and "clear to quote" = `counts[0]`, where `counts` is derived from `resolve()` over `ALL_CODES` (`:84`). Because 26 states fall through to the tier-0 default (B-1), `counts[0]` is padded by every unresearched state.
**IMPACT:** The marketing claim "50 states mapped" is true only in the sense that all 50 are *colored*; only 24 are actually researched. The "clear to quote" headline number is inflated by default-green states, overstating how many jurisdictions are truly cleared — a misleading metric on a compliance surface.
**RECOMMENDATION:** Change the stat to reflect verified coverage ("24 states with verified rules; 26 pending"), and exclude defaulted states from "clear to quote."

### B-5 — LOW/MEDIUM — `hf-*` hyperframes are orphaned generated assets committed into the app repo, with a copy-paste identity bug
**EVIDENCE:**
- 13 dirs (`hf-deal`…`hf-tax`), each an offline 1920×1080 GSAP composition (`hf-dscr/index.html:1` viewport `width=1920,height=1080`, loads `gsap` from `cdn.jsdelivr.net`). **Not referenced anywhere in the app**: grep for `hf-deal|hf-dscr|hyperframes` across `src/`, `index.html`, `vite.config.ts` = 0 hits. They render to MP4 (`hf-*/renders/` is git-ignored; `public/video` holds outputs).
- **Copy-paste identity bug:** *all 13* `hf-*/package.json` have `"name": "hf-statelaws"`. `meta.json` is also wrong for 8 of 13 — `hf-deal`, `hf-montecarlo`, `hf-returns`, `hf-step1`, `hf-step2`, `hf-step3`, `hf-tax` all report `id/name = "hf-statelaws"` instead of their own id.
- 104+ `hf-*` files are git-tracked, including 13 duplicated copies of the same two `.woff2` fonts.
**IMPACT:** Low functional risk (offline marketing assets), but they bloat the app repo, duplicate binaries, and the mislabeled `meta.json`/`package.json` mean `hyperframes` CLI commands (`render`, `publish`) would operate under the wrong project identity for most directories. From the app's perspective these are orphaned.
**RECOMMENDATION:** Move `hf-*` to a separate assets repo or a `marketing/` subtree excluded from the app build; fix each `meta.json`/`package.json` name to match its directory; de-duplicate fonts.

### B-6 — LOW — "Charts" are CSS bars / colored tables / stat tiles; Monte Carlo path data is never plotted
**EVIDENCE:** Across the chart pages, the only `<svg>` elements are icons (e.g., `MonteCarloPage.tsx:183` is a chevron) and the DSCR gauge; there are **no plotted `<polyline>/<polygon>/points=` series** (grep count = 0 for all of MonteCarlo/Returns/Stress/Refi/Portfolio). `MonteCarloPage.tsx:62` comment reads "DSCR distribution **bar chart**," but the render is CSS-height bars and numeric tiles (`:246-257`, `:584-590`). The Vasicek simulation produces full rate *paths over months*, yet the UI shows only P10/P50/P90 scalar tiles — the path/fan chart is not drawn. StressMatrix renders an HTML `<table>` heatmap from `result.cells` (`StressMatrixPage.tsx:739-752`) — legitimate, engine-driven, but not an SVG chart.
**IMPACT:** Cosmetic/expectation gap: the pages label simple tiles as "charts," and the richest computed output (Monte Carlo paths) is discarded visually. Not fake data, but under-delivered visualization and mildly overstated labels.
**RECOMMENDATION:** Either plot the Monte Carlo percentile fan (the data already exists in `result`) or rename the section from "distribution bar chart" to what it is (summary tiles).

### B-7 — LOW — Red/green risk encoding without a non-color channel in places (colorblind)
**EVIDENCE:** `StateLawsPage.tsx:49` `TIER_COLORS = {0: emerald, 1: lemon, 2:"#f97316", 3:"#ff6b6b"}`; `src/engine/stressMatrix.ts:390-406` risk zones map to `bg-red-700`/`text-red-400` … green; `artifacts.tsx:54-60` `dscrColor` green→red. StateLaws *does* also print `TIER_LABELS` text (`:157`, `:210`) and StressMatrix cells show the DSCR number, which mitigates it; the DSCR gauge relies on color + needle position.
**IMPACT:** Deuteranopia/protanopia users may not distinguish tier-0 (emerald) from tier-1 (lemon) or the green/amber/red risk cells by hue alone; mitigated where a text label or numeric value is co-located, weaker on the gauge.
**RECOMMENDATION:** Add a redundant non-color cue everywhere risk is shown by color (icon/pattern/explicit label), and verify palette contrast for the lemon-on-cream combinations.

### B-8 — LOW — Portfolio page ships a hardcoded seed portfolio not labeled as example data
**EVIDENCE:** `src/pages/PortfolioPage.tsx:30-35` `const SEED: RawProperty[]` = four fully-specified properties ("Austin TX" $425k, "Tampa FL" $520k, "Phoenix AZ" $390k, "Memphis TN" $640k) used as initial `useState(SEED)` (`:63`). Rows are editable, and `analyzePortfolio` runs on them (`:116-128`).
**IMPACT:** Low — the data is user-editable, so it is a demo seed, not a fabricated result. But on first load an investor sees a populated portfolio with concrete DSCR/aggregate outputs that could be mistaken for their own or for representative "real" data.
**RECOMMENDATION:** Label the seed rows as "Example portfolio — edit or clear," or start empty with a one-click "Load sample."

---

## Positive confirmations (what is NOT broken)
- **In-app calculators are engine-driven, not faked.** Stress Matrix (`StressMatrixPage.tsx:129` → `computeStressMatrix`, rendered at `:739-752`), Monte Carlo (`MonteCarloPage.tsx:225-228` → `runMonteCarloRatePath`, rendered `:246-257`), Returns (`computeReturns`), Refi (`analyzeRefi`), and Portfolio (`analyzePortfolio`) all compute from live inputs via `useMemo`. The `[3,5,7,10,12]`/`[1,2,3,4]` arrays in `ReturnsPage.tsx:301-302` are **axis definitions** (hold-years / growth-rates), not fabricated series.
- **The US map geometry is real,** attributed open-source SVG paths (`src/data/usMapPaths.ts:1-4`, 51 entries = 50 states + DC).
- **The DSCR gauge is value-driven** (`artifacts.tsx:64-75`, needle angle derived from `value`), not a static image.
- **No secrets leak** from System A (`grep` for keys/tokens over `graphify-out/` = none).

## Prioritized remediation
1. **B-1** — Drive StateLaws from `statePppLaws.ts`; never default-green unverified states. *(compliance-critical)*
2. **B-2** — Point the public DSCR calculator at `calculatePI`/`solveDSCR`. *(integrity)*
3. **B-4 / B-3** — Fix the "50 states mapped / clear to quote" stats; surface market-snapshot vintage. *(disclosure)*
4. **A-1 / A-2** — Git-ignore & stop committing `graphify-out/`, or gate it behind CI regeneration. *(hygiene)*
5. **B-5** — Extract `hf-*` from the app repo; fix the duplicated `name/id`. *(hygiene)*
6. **B-6 / B-7 / B-8** — Plot Monte Carlo paths, add non-color risk cues, label the portfolio seed. *(polish)*
