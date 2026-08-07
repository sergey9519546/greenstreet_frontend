"""Chapters 9-12 content: Cross-cutting, Roadmap, KPIs, Appendices."""

from build_body import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem,
    BODY, BODY_LEFT, BULLET, H2, H3, CALLOUT_TITLE, CALLOUT_BODY, SMALL, QUOTE,
    callout_box, metric_strip, std_table, bullets, hr, make_heading, chapter_opener,
    ACCENT, ACCENT_2, HEADER_FILL, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED,
    SEM_SUCCESS, SEM_WARNING, SEM_ERROR, SEM_INFO,
    SANS_BOLD, SANS_FONT, BODY_BOLD, BODY_ITALIC, MONO_FONT,
)
from reportlab.platypus import PageBreak


def chapter_9():
    """Chapter 9 — Cross-Cutting Capabilities."""
    s = chapter_opener(9, "Cross-Cutting Capabilities",
        "The Six Functions share infrastructure. This chapter covers the four cross-cutting capabilities that span multiple functions: the data and provenance pipeline, the regulatory engine, the command-center UI, and the infrastructure that holds it all up.")

    s.append(Paragraph(
        "Each of the Six Functions has its own module inventory, but four capabilities are shared across functions and must be designed as such. Building them per-function would produce duplication, inconsistency, and maintenance debt; building them as cross-cutting capabilities produces leverage — one investment, multiple functions served. The four are: (1) the data and provenance pipeline that feeds Function 1, 2, 3, and 6; (2) the regulatory engine that gates Function 1, 4, and 6; (3) the command-center UI that operators, borrowers, and capital partners use to interact with all six functions; (4) the infrastructure — audit trail, role-based access, backup, performance budgets — that every function depends on.",
        BODY))

    s.append(Paragraph("1. Data and Provenance Pipeline", H2))
    s.append(Paragraph(
        "Every input to the platform — a rent comp, an insurance estimate, a tax figure, a lender guideline, a flood zone determination, an HOA rule — carries a provenance tag: [VERIFIED-Primary] (from the source of record, e.g., a county assessor API for taxes), [VERIFIED-Secondary] (from a credible secondary source, e.g., RentCast for rent comps), or [UNVERIFIED] (operator-entered or from an untrusted source). The provenance tag determines the input's weight in the confidence score (Function 1) and the quote packet's audit trail (Function 3). Inputs without provenance are forbidden — the platform refuses to use them.",
        BODY))

    s.append(Paragraph(
        "The pipeline also manages data freshness. Every input carries a refresh cadence (county assessor data is annual, lender guidelines are weekly, rent comps are 30-day, flood zone determinations are 90-day). Inputs past their refresh cadence are flagged in the confidence score with a freshness penalty, and the operator is notified to re-pull. The pipeline also tracks stale-data alerts at the file level — if a file has been in the pipeline longer than 30 days, every input is re-checked for freshness before the file is submitted to a lender.",
        BODY))

    s.append(Paragraph(
        "The verifiable source registry is the master catalog of every data source the platform uses: API endpoint, authentication method, refresh cadence, cost per pull, monthly cost ceiling, known accuracy gaps, and the function(s) that consume the source. The registry is the platform's data governance — a source not in the registry cannot be used, and adding a source to the registry requires documentation of accuracy, cost, and refresh cadence. This is what prevents the platform from accumulating untraceable inputs that produce confident wrong answers.",
        BODY))

    s.append(Paragraph("2. Regulatory Engine (50-State)", H2))
    s.append(Paragraph(
        "The regulatory engine encodes the legal constraints that affect every file: prepayment penalty law by state, STR regulations by jurisdiction, usury and rate caps by state, NMLS licensing requirements by state, and disclosure requirements by state and property type. The engine is the platform's compliance nervous system — it gates the pre-flight check (Function 1), the file completeness engine (Function 4), and the decline gates (Function 6). Every file is run through the regulatory engine at intake, and any regulatory red flag triggers either a hard decline (Function 6) or an amber flag for compliance review.",
        BODY))

    s.append(Paragraph(
        "The prepayment penalty law sub-engine is the most complex component. It encodes the per-state rules: Minnesota prohibits entity prepay entirely; New Jersey prohibits prepay penalties for individual borrowers but permits them for entities; Illinois restricts prepay penalties to the first three years; Ohio permits a $116,356 (2026 indexed) penalty; Pennsylvania permits a $329,411 (2026 indexed) penalty; Mississippi uses the 5-4-3-2-1 step-down; Washington bans ARM products with prepay penalties entirely. Every loan quote is checked against the borrower's state and entity type, and the quote packet (Function 3) shows the applicable PPP rule with the citation. The 2026 indexed thresholds for Ohio and Pennsylvania are recomputed annually based on the published CPI adjustment.",
        BODY))

    s.append(Paragraph(
        "The STR regulation sub-engine is the second most complex component. It encodes STR legality by jurisdiction (city + county + HOA layer, where HOA rules can be more restrictive than the city). The four-tier verdict — CLEAR, RESTRICTED, UNCERTAIN, PROHIBITED — gates whether STR income can be used in the Track A qualification. RESTRICTED means STR income is usable but with a discount or a cap; UNCERTAIN means the file is held for manual verification; PROHIBITED means STR income is not usable and the file must qualify on long-term rent. The STR database is refreshed weekly via a scrape of city ordinances and a partnership with a STR regulation data provider; the HOA database is refreshed quarterly via a manual review of HOA documents on file.",
        BODY))

    s.append(Paragraph("3. UI / UX — The Command Center", H2))
    s.append(Paragraph(
        "The command center is the operator's daily workspace. It has four primary surfaces, each tuned to a primary user. <b>The operator dashboard (single-deal view)</b> is the ten-minute verdict workflow — pre-flight gate, rent comp aggregator, lender auto-router, Track A/B verdicts, quote packet generation, decline gate. The dashboard is keyboard-driven (operators do not want to mouse) and surfaces the confidence score and the binding constraint at the top, so the operator can decide in 30 seconds whether to proceed or to triage. <b>The portfolio dashboard</b> is for the operator managing multiple files — pipeline view by stage (intake, pre-flight, underwriting, submission, clear-to-close, closed), with color-coded file health and exception alerts. <b>The lender intel console</b> is for the operator who maintains the lender matrix — recent guideline changes, relationship tier movements, decline-pattern summaries, and a 'what changed this week' digest.",
        BODY))

    s.append(Paragraph(
        "<b>The channel economics dashboard</b> is for the operator who manages distribution — per-channel P&L, concentration alerts, repeat-deal trigger alerts from the investor CRM, and wholesaler quality floor breaches. <b>The borrower portal</b> is the borrower's view of the quote packet — the 6-page PDF with interactive scenario toggles, the file status tracker, and the document upload interface. <b>The capital partner portal</b> is the lender's view of the submitted file — the document stack with bookmarks, the file summary, the operator's contact info, and the audit trail of every assumption. Each portal is role-based and shows only the information the role is entitled to see.",
        BODY))

    s.append(Paragraph("4. Infrastructure and Operations", H2))
    s.append(Paragraph(
        "The platform runs on Next.js 16 with TypeScript, Tailwind 4, and shadcn-ui on the frontend, with API routes and Prisma for persistence. The infrastructure layer that supports it has four components. <b>Immutable audit trail</b>: every assumption, every override, every lender submission, every decline, every adverse action notice is written to an append-only log with a tamper-evident hash chain. The log is the platform's defense in any subsequent dispute — it can prove what was assumed, what was overridden, what was disclosed, and when. <b>Role-based access control</b>: operators see their own files; senior operators see all files in their team; compliance officers see the audit trail but not the file contents; capital partners see only the files submitted to them; borrowers see only their own files. Access is logged.",
        BODY))

    s.append(Paragraph(
        "<b>Backup and disaster recovery</b>: the database is backed up nightly with 30-day retention, the audit trail is replicated to a separate jurisdiction (for disaster recovery and for tamper-evidence — an attacker who compromises the primary cannot tamper with the replica without detection), and a documented runbook covers the principal failure modes (database loss, API outage at a critical data source, lender portal outage during submission). <b>Performance budgets</b>: the ten-minute verdict SLA (Function 1) is enforced as a per-step budget — pre-flight gate under 90 seconds, rent comp aggregator under 60 seconds, lender auto-router under 30 seconds, Track A/B computation under 30 seconds, quote packet generation under 60 seconds, with 30 seconds of operator judgment time reserved. A step that exceeds its budget triggers an alert and a performance investigation.",
        BODY))

    s.append(PageBreak())
    return s


def chapter_10():
    """Chapter 10 — Implementation Roadmap."""
    s = chapter_opener(10, "Implementation Roadmap — 4-Phase, 365-Day Plan",
        "Twelve months. Four phases. Phase 1 fixes the core. Phase 2 expands the matrix. Phase 3 builds distribution. Phase 4 completes the doctrine.")

    s.append(Paragraph(
        "The roadmap is sequenced so that each phase unlocks the next. Phase 1 (Days 0-30) fixes the broken core and adds the pre-flight gate — without a correct engine, every downstream investment amplifies the brokenness. Phase 2 (Days 31-90) expands the lender matrix and builds the file completeness engine — without lender depth and clean files, the distribution layer has nothing to distribute. Phase 3 (Days 91-180) builds the distribution layer and the risk discipline automation — without these, the shop cannot scale beyond the founder's personal network, and bad files continue to consume underwriter time. Phase 4 (Days 181-365) completes the regulatory engine, adds the Monte Carlo overlay, and reaches full GODMODE operating status. The phasing is aggressive but achievable with a focused team; it is also the minimum pace required to reach elite status before the next market reset.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Phase 1 — Core Engine Fixes and Pre-Flight Gate (Days 0-30)", H2))
    s.append(Paragraph(
        "<b>Deliverables:</b> (1) Track A / Track B engine correctness audit, with golden test suite locking the payment factor (8.25% → 0.0075127, 7.00% → 0.006653), Track A DSCR (1.05 at 7.00%, 0.96 at 8.25%), rent breakeven (4.9%), and deal-break rate (7.67% for the flagship transaction); (2) pre-flight gate MVP covering 4 of 7 dimensions (STR legality, zoning, flood, property type) with red/amber/green output; (3) rent comp aggregator MVP covering RentCast and Rentometer (AirDNA in Phase 2); (4) state PPP engine operational with annual indexing logic for OH and PA; (5) confidence score v1 with source timeliness and source quantity components.",
        BODY))
    s.append(Paragraph(
        "<b>Exit criteria:</b> golden test suite passes 100% on every commit; pre-flight gate catches 80% of files that should be auto-declined (validated against a 50-file retrospective sample); rent comp aggregator reduces manual rent lookup time from 8 minutes to 90 seconds; state PPP engine correctly identifies prohibited-state files with zero false-positives on the retrospective sample. <b>Dependencies:</b> RentCast and Rentometer API contracts signed; flood zone API selected and contracted; STR regulation database licensed. <b>Risk register:</b> API contract delay (mitigation: 2-week buffer; fallback to manual rent comp for first 30 days); STR database licensing cost overruns (mitigation: tiered pricing negotiation; start with top-50 MSAs only).",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Phase 2 — Lender Expansion and File Quality (Days 31-90)", H2))
    s.append(Paragraph(
        "<b>Deliverables:</b> (1) lender matrix expanded from 7 to 14 verified lenders (Visio, LendingOne, RCN, Anchor, Velocity, Park Place, plus Lima One STR and Griffin STR verification); (2) guideline diff engine operational with weekly cadence and pipeline impact analysis; (3) fit scorer v1 with Fit Tier mapping per lender; (4) two-quote rule enforced in quote packet generator; (5) file completeness engine MVP for top 5 lenders (Griffin, Kiavi, Lima One, Visio, LendingOne); (6) document OCR pipeline operational for 1003, 1007, rent roll, lease, title, and HOI; (7) defect scorer v1 with heat score; (8) submission package generator for top 5 lenders; (9) 'Why this rate' explainer MVP; (10) PDF quote packet v1 (4 pages).",
        BODY))
    s.append(Paragraph(
        "<b>Exit criteria:</b> 14 lenders verified and live in fit scorer; guideline diff catches 100% of material changes within 7 days; two-quote rule enforced on 100% of quotes; file completeness engine reduces first-pass defect rate by 50% on the top 5 lenders; defect heat score averages above 80 on submitted files; quote packet delivered within 30 minutes of verdict on 90% of files. <b>Dependencies:</b> Phase 1 exit criteria met; OCR pipeline vendor selected; lender portal API access for 5 priority lenders. <b>Risk register:</b> lender verification slower than expected (mitigation: parallel verification tracks, 2 lenders per operator-week); OCR accuracy below 90% (mitigation: confidence-scored extraction with manual verification fallback).",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Phase 3 — Distribution and Risk Discipline (Days 91-180)", H2))
    s.append(Paragraph(
        "<b>Deliverables:</b> (1) lender matrix expanded to 20 verified lenders; (2) relationship tracker operational with quarterly tier computation; (3) decline pattern learner operational with quarterly pattern mining; (4) agent referral portal MVP; (5) wholesaler intake API MVP with pre-flight auto-reject; (6) investor CRM MVP with next-deal triggers (equity buildup, balloon approaching, DSCR improvement); (7) channel attribution and economics dashboard; (8) hard decline gates operational for 9 reason codes; (9) risk scorecard with stoplight UI; (10) adverse action letter generator for 30 reason codes; (11) fair-lending audit overlay with quarterly comparative file analysis; (12) tax and insurance estimator integrations live.",
        BODY))
    s.append(Paragraph(
        "<b>Exit criteria:</b> 20 lenders verified; agent referral portal producing 5+ submitted files per week; investor CRM triggering 3+ next-deal opportunities per month; channel economics dashboard showing per-channel P&L for all active channels; hard decline gates catching 60% of declined files at intake (vs 10% baseline); adverse action compliance 100% on declined files. <b>Dependencies:</b> Phase 2 exit criteria met; channel partner agreements in place for top 3 agents and top 2 wholesalers; ECOA / Reg B compliance review of adverse action templates by counsel. <b>Risk register:</b> agent portal adoption slower than expected (mitigation: in-person onboarding for top 10 agents; referral fee pilot program); fair-lending analysis reveals a disparity (mitigation: pre-planned investigation protocol with counsel; documented remediation framework).",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Phase 4 — GODMODE: Regulatory Engine and Monte Carlo (Days 181-365)", H2))
    s.append(Paragraph(
        "<b>Deliverables:</b> (1) lender matrix at 25+ verified lenders; (2) regulatory engine complete (50-state PPP, STR regulations for top-100 MSAs, usury / rate caps, NMLS licensing, state-specific disclosures); (3) Monte Carlo survivorship overlay operational with 10,000-trial Track B output; (4) deal-break curve solver operational across LTV / rent / DSCR sweep; (5) live pricing grid integration for top 10 lenders (Optimal Blue / PPE / lender-direct); (6) correspondent syndicate program live with 5+ enrolled LOs; (7) CPA / advisor referral program live with 10+ enrolled advisors; (8) constraint visualizer with 'what unbinds this' interactive; (9) scenario toggles live in borrower portal; (10) full audit trail with role-based access; (11) command center UI v2 with operator / portfolio / lender / channel dashboards.",
        BODY))
    s.append(Paragraph(
        "<b>Exit criteria (GODMODE status):</b> 95% of verdicts under 10 minutes; 90% confidence calibration; fit accuracy above 85% (will-close prediction); first-pass clean rate above 90%; defect rate below 2%; 60%+ of revenue from repeat channels; false-decline below 5%; 100% adverse action compliance; full regulatory engine covering 50 states; Monte Carlo overlay on every Track B verdict; live pricing on top 10 lenders. <b>Dependencies:</b> Phase 3 exit criteria met; Optimal Blue or equivalent pricing API contracted; full-time compliance officer in seat; 4-person operator team trained on the platform. <b>Risk register:</b> regulatory engine scope creep (mitigation: ship 50-state PPP first, then STR for top-50 MSAs, then long-tail STR; do not block GODMODE status on long-tail regulatory coverage); Monte Carlo runtime exceeds budget (mitigation: pre-compute survivorship distributions per file shape, cache results).",
        BODY))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Roadmap Summary (Gantt-Style)", H2))
    s.append(std_table(
        headers=["Workstream", "Days 0-30", "Days 31-90", "Days 91-180", "Days 181-365"],
        rows=[
            ["Core engine correctness",     "■ P1",  "",        "",        ""],
            ["Pre-flight gate",             "■ P1",  "expand",  "expand",  "complete"],
            ["Rent comp aggregator",        "MVP P1","expand",  "AirDNA",  "complete"],
            ["Lender matrix",               "audit", "→ 14",    "→ 20",    "→ 25+"],
            ["Guideline diff engine",       "",      "■ P2",    "expand",  "complete"],
            ["Fit scorer + relationship",   "",      "■ P2",    "■ P3",    "complete"],
            ["File completeness engine",    "",      "■ P2",    "expand",  "complete"],
            ["OCR + reconciler",            "",      "■ P2",    "expand",  "complete"],
            ["Quote packet + explainer",    "",      "■ P2",    "expand",  "complete"],
            ["Agent / wholesaler portal",   "",      "",        "■ P3",    "expand"],
            ["Investor CRM",                "",      "",        "■ P3",    "expand"],
            ["Channel attribution",         "",      "",        "■ P3",    "complete"],
            ["Decline gates + adverse action","",    "",        "■ P3",    "complete"],
            ["Regulatory engine (50-state)", "PPP",  "PPP expand","PPP + STR top-50","complete 50-state"],
            ["Monte Carlo overlay",         "",      "",        "",        "■ P4"],
            ["Live pricing grid",           "",      "",        "pilot",   "top 10 lenders"],
        ],
        col_weights=[0.28, 0.16, 0.18, 0.18, 0.20],
        header_align=['L', 'C', 'C', 'C', 'C'],
    ))

    s.append(PageBreak())
    return s


def chapter_11():
    """Chapter 11 — Success Metrics and KPIs."""
    s = chapter_opener(11, "Success Metrics and KPIs",
        "What gets measured gets managed. The KPI framework maps each of the Six Functions to leading and lagging indicators, with target values and measurement cadence.")

    s.append(Paragraph(
        "The KPI framework is the platform's scorecard. It distinguishes leading indicators (which predict future performance — time-to-verdict, first-pass clean rate, false-decline rate) from lagging indicators (which confirm past performance — closed-loan volume, revenue, margin). Leading indicators are measured weekly and reviewed monthly; lagging indicators are measured monthly and reviewed quarterly. The framework is designed so that an operator can tell, from the leading indicators alone, whether the doctrine is being lived — without waiting for the revenue to confirm or deny it.",
        BODY))

    s.append(Paragraph(
        "The north-star metric is closed-loan velocity per operator per month — the number of closed loans a single operator can produce, normalized for file complexity. This metric captures all six functions: a high velocity means the operator is fast (Function 1), accurate (Function 2), trusted (Function 3), clean (Function 4), channeled (Function 5), and disciplined (Function 6). The target is 12 closed loans per operator per month at steady state (Phase 4), up from a baseline of 4-6 today. Every other KPI in the framework either contributes to or measures a component of this north-star.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Master KPI Dashboard", H2))
    s.append(std_table(
        headers=["Function", "KPI", "Type", "Cadence", "Target (365d)"],
        rows=[
            ["1 Scenario",       "Median time-to-verdict",                "Leading", "Weekly",  "<10 min"],
            ["1 Scenario",       "% verdicts under 10 min",                "Leading", "Weekly",  "95%"],
            ["1 Scenario",       "Confidence calibration (Brier score)",   "Leading", "Monthly", "<0.10"],
            ["1 Scenario",       "False GO rate",                           "Lagging", "Monthly", "<5%"],
            ["2 Guidelines",     "Verified lenders in matrix",              "Leading", "Monthly", "25+"],
            ["2 Guidelines",     "Two-quote compliance",                    "Leading", "Weekly",  "100%"],
            ["2 Guidelines",     "Fit accuracy (will-close prediction)",    "Lagging", "Quarterly",">85%"],
            ["2 Guidelines",     "Guideline diff latency",                  "Leading", "Weekly",  "<7 days"],
            ["3 Borrower Trust", "Quote acceptance rate",                   "Lagging", "Monthly", ">70%"],
            ["3 Borrower Trust", "Borrower NPS",                            "Lagging", "Quarterly",">50"],
            ["3 Borrower Trust", "Quotes with provenance tags",             "Leading", "Weekly",  "100%"],
            ["4 Partner Trust",  "First-pass clean rate",                   "Leading", "Weekly",  ">90%"],
            ["4 Partner Trust",  "Defect rate per file",                    "Leading", "Weekly",  "<2%"],
            ["4 Partner Trust",  "Median turn time (submit to clear)",      "Lagging", "Monthly", "18-21 days"],
            ["4 Partner Trust",  "Critical defects caught pre-submission",  "Leading", "Monthly", ">90%"],
            ["5 Distribution",   "% revenue from repeat channels",          "Lagging", "Monthly", ">60%"],
            ["5 Distribution",   "Active channels",                         "Leading", "Monthly", "5+"],
            ["5 Distribution",   "Single-channel concentration",            "Leading", "Monthly", "<40%"],
            ["5 Distribution",   "Repeat-deal interval (median)",           "Lagging", "Quarterly","<180 days"],
            ["6 Risk Discipline","False-decline rate",                      "Lagging", "Monthly", "<5%"],
            ["6 Risk Discipline","% declines at intake",                    "Leading", "Weekly",  ">60%"],
            ["6 Risk Discipline","Adverse action compliance",               "Leading", "Weekly",  "100%"],
            ["6 Risk Discipline","Fair-lending audit pass rate",            "Lagging", "Quarterly","100%"],
            ["NORTH STAR",       "Closed loans / operator / month",         "Lagging", "Monthly", "12"],
        ],
        col_weights=[0.16, 0.36, 0.12, 0.14, 0.22],
        header_align=['L', 'L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Calibration Discipline", H2))
    s.append(Paragraph(
        "Calibration is harder than accuracy, and it is the metric that most operators fail to track. An uncalibrated operator who is confident 90% of the time but correct 75% of the time is more dangerous than a calibrated operator who is confident 75% of the time and correct 75% of the time — the uncalibrated operator produces false certainty that leads to wasted underwriting time and damaged borrower trust. The platform tracks calibration via a Brier score on every confidence-weighted verdict: a verdict of '90% confident this file will close' that does close contributes 0.01 to the Brier score; a verdict that does not close contributes 0.81. The Brier score is averaged across all verdicts per operator per month; a Brier score below 0.10 is elite, 0.10-0.18 is acceptable, above 0.18 requires recalibration training.",
        BODY))

    s.append(Paragraph(
        "Calibration is also tracked at the platform level — the platform's confidence scores must themselves be calibrated. If the platform says '90% confidence' on a verdict and only 75% of those verdicts are correct, the platform's confidence model is mis-calibrated and must be retrained. The platform Brier score is computed monthly across all verdicts and is the principal measure of the platform's judgment quality. A platform Brier score below 0.10 is the GODMODE standard; above 0.15 is unacceptable.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Anti-KPIs (What Not to Measure)", H2))
    s.append(callout_box(
        "Metrics That Distract, Not Drive",
        "<b>Quote volume</b> — measuring the number of quotes sent rewards speed over accuracy and produces false-positive quotes that erode trust. <b>Lender count</b> — measuring the raw number of lenders in the matrix rewards breadth over depth; a matrix with 25 verified lenders and 5 A-tier relationships beats a matrix with 40 unverified lenders and 0 relationships. <b>Marketing impressions</b> — measuring ad reach rewards spend over channel fit; the doctrine is repeat channels, not random reach. <b>Underwriting hours</b> — measuring hours worked rewards effort over judgment; the doctrine is faster verdicts, not more hours. <b>Files in pipeline</b> — measuring pipeline size rewards intake over discipline; the doctrine is declining bad files at intake, not stockpiling them. Every KPI that is not in the master dashboard above is, by definition, a distraction.",
        color=SEM_WARNING, bg=CARD_BG,
    ))

    s.append(PageBreak())
    return s


def chapter_12():
    """Chapter 12 — Appendices."""
    s = chapter_opener(12, "Appendices",
        "Reference material: lender verification registry, state PPP matrix, data source catalog, and code module inventory.")

    s.append(Paragraph("Appendix A — Target Lender Verification Registry (Year 1)", H2))
    s.append(Paragraph(
        "The lender registry is the master list of every lender in the matrix, with verification status, key guideline parameters, and relationship tier. The registry is the source of truth for Function 2 (Guideline Intelligence) and Function 4 (Capital Partner Trust). Lenders marked VERIFIED have primary-sourced guideline data; those marked TARGET are slated for verification in the indicated quarter; those marked UNVERIFIED have secondary-sourced data and require primary verification before they can be used in the fit scorer.",
        BODY))
    s.append(std_table(
        headers=["Lender", "LTV", "DSCR min", "FICO min", "Max loan", "STR?", "Status"],
        rows=[
            ["Griffin",         "75-85%", "1.00", "660", "$3M", "Yes",  "VERIFIED"],
            ["Defy",            "80%",    "1.00", "660", "$2.5M","Yes",  "VERIFIED"],
            ["Easy Street",     "82%",    "1.00", "660", "$3M", "Yes",  "VERIFIED"],
            ["Lima One",        "76%",    "1.00", "660", "$2M", "Yes",  "VERIFIED"],
            ["New Silver",      "72%",    "1.00", "660", "$2M", "Yes",  "VERIFIED"],
            ["Kiavi",           "70%",    "1.00", "660", "$3M", "Yes",  "VERIFIED"],
            ["Deephaven",       "65%",    "1.00", "660", "$2M", "Yes",  "VERIFIED"],
            ["Visio Lending",   "75-80%", "1.00", "680", "$2M", "Yes",  "TARGET — Q2"],
            ["LendingOne",      "70-80%", "1.00", "660", "$2M", "Yes",  "TARGET — Q2"],
            ["RCN Capital",     "65-75%", "1.00", "660", "$5M", "Limited","TARGET — Q2"],
            ["Anchor Loans",    "70-80%", "n/a",  "660", "$5M", "No",   "TARGET — Q3"],
            ["Velocity Mortgage","65-80%","1.00", "660", "$1.5M","Yes",  "TARGET — Q3"],
            ["Park Place Finance","70-80%","1.00", "660", "$2M", "Yes",  "TARGET — Q3"],
            ["Anchor Six Lending","70-80%","1.00", "660", "$2M", "Yes",  "TARGET — Q4"],
            ["Broadmark Realty","65-75%", "n/a",  "660", "$5M", "No",   "TARGET — Q4"],
            ["CoreVest Finance","70-80%", "1.00", "680", "$50M","Yes",  "TARGET — Q4"],
            ["Marquee Funding", "65-75%", "1.00", "660", "$5M", "No",   "TARGET — Q4"],
            ["Pacwest Capital", "70-80%", "1.00", "660", "$5M", "Yes",  "TARGET — Q4"],
            ["Grand Coast Financial","65-75%","1.00","660","$5M","No",   "TARGET — Q4"],
            ["Pinnacle DSCR",   "70-80%", "1.00", "660", "$2M", "Yes",  "TARGET — Q4"],
            ["Stratton Equities","70-80%","1.00", "660", "$3M", "Limited","TARGET — Q4"],
            ["Centerpoint Lending","70-80%","1.00","660","$2M","Yes",    "TARGET — Q4"],
        ],
        col_weights=[0.22, 0.10, 0.10, 0.10, 0.12, 0.10, 0.26],
        header_align=['L', 'C', 'C', 'C', 'C', 'C', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Appendix B — State PPP Law Matrix (Selected Jurisdictions)", H2))
    s.append(Paragraph(
        "The state PPP matrix encodes the prepayment penalty law by state and borrower entity type. The matrix is the source of truth for Function 1 (pre-flight gate), Function 4 (compliance attestation), and Function 6 (decline gate). Entries marked VERIFIED have primary-sourced statutory citation; UNVERIFIED entries require confirmation before use in production. The 2026 indexed thresholds for Ohio and Pennsylvania are recomputed annually based on the published CPI adjustment; the values shown are for the 2026 calendar year.",
        BODY))
    s.append(std_table(
        headers=["State", "Entity Rule", "Penalty Structure", "2026 Cap", "Status"],
        rows=[
            ["Minnesota",     "Entity prohibited",        "No PPP for entity borrowers",                "n/a",         "VERIFIED"],
            ["New Jersey",    "Individual prohibited",    "PPP permitted for entities only",            "n/a",         "VERIFIED"],
            ["Illinois",      "Restricted (3-year)",      "PPP permitted in first 3 years only",        "n/a",         "VERIFIED"],
            ["Ohio",          "Permitted with cap",       "PPP permitted up to indexed threshold",      "$116,356",    "VERIFIED (2026 indexed)"],
            ["Pennsylvania",  "Permitted with cap",       "PPP permitted up to indexed threshold",      "$329,411",    "VERIFIED (2026 indexed)"],
            ["Mississippi",   "5-4-3-2-1 step-down",      "PPP declines 5%/4%/3%/2%/1% by year",        "n/a",         "VERIFIED"],
            ["Washington",    "ARM ban",                  "No PPP on ARM products",                     "n/a",         "UNVERIFIED — confirm"],
            ["California",    "Permitted (regulated)",    "PPP permitted with disclosure",              "n/a",         "VERIFIED"],
            ["Texas",         "Permitted (12-day letter)","PPP permitted with 12-day disclosure",       "n/a",         "VERIFIED"],
            ["Florida",       "Permitted",                "PPP permitted, market-standard",             "n/a",         "VERIFIED"],
            ["Arizona",       "Permitted",                "PPP permitted, market-standard",             "n/a",         "VERIFIED"],
            ["Georgia",       "Permitted",                "PPP permitted, market-standard",             "n/a",         "VERIFIED"],
            ["North Carolina","Permitted",                "PPP permitted, market-standard",             "n/a",         "VERIFIED"],
            ["Tennessee",     "Permitted",                "PPP permitted, market-standard",             "n/a",         "VERIFIED"],
            ["Colorado",      "Permitted (regulated)",    "PPP permitted with disclosure",              "n/a",         "VERIFIED"],
            ["Nevada",        "Permitted",                "PPP permitted, market-standard",             "n/a",         "VERIFIED"],
            ["Oregon",        "Restricted",               "PPP permitted with limits; verify",          "n/a",         "UNVERIFIED — confirm"],
            ["Massachusetts", "Restricted",               "PPP permitted with limits; verify",          "n/a",         "UNVERIFIED — confirm"],
        ],
        col_weights=[0.18, 0.20, 0.30, 0.14, 0.18],
        header_align=['L', 'L', 'L', 'C', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Appendix C — Data Source Catalog", H2))
    s.append(Paragraph(
        "The data source catalog is the verifiable source registry — the master list of every external data source the platform uses, with API endpoint, refresh cadence, cost per pull, monthly cost ceiling, known accuracy gaps, and the consuming function(s). Sources not in the catalog cannot be used in production; adding a source requires documentation of accuracy, cost, and refresh cadence, plus approval by the operator desk.",
        BODY))
    s.append(std_table(
        headers=["Source", "Used For", "Refresh", "Cost/Pull", "Functions"],
        rows=[
            ["RentCast API",          "Long-term market rent",            "30 days",   "$0.10",  "F1, F3"],
            ["Rentometer API",        "Long-term rent percentile range",  "30 days",   "$0.08",  "F1, F3"],
            ["AirDNA API",            "STR projected revenue",             "14 days",   "$0.50",  "F1, F3"],
            ["MLS 1007 (manual)",     "Market rent opinion",               "Appraisal", "n/a",    "F1, F3"],
            ["County assessor APIs",  "Property tax estimate",             "Annual",    "Free",   "F1, F3"],
            ["Millage database",      "Tax estimate fallback",             "Annual",    "Free",   "F1, F3"],
            ["FEMA flood service",    "Flood zone determination",          "90 days",   "Free",   "F1, F6"],
            ["HOI estimation service","Insurance estimate",               "30 days",   "$0.25",  "F1, F3"],
            ["STR regulation DB",     "STR legality (city/county)",        "Weekly",    "License","F1, F6"],
            ["HOA document DB",       "HOA STR restrictions",              "Quarterly", "Manual", "F1, F6"],
            ["Optimal Blue / PPE",    "Live lender pricing",               "Daily",     "License","F2, F3"],
            ["Lender portal APIs",    "Lender guideline + status",         "Weekly",    "Free",   "F2, F4"],
            ["Tesseract / cloud OCR", "Document extraction",               "Per upload","$0.01/pg","F4"],
            ["NMLS registry",         "Lender licensing verification",     "Monthly",   "Free",   "F4, F6"],
            ["State statute scrape",  "PPP / usury / disclosure",          "Quarterly", "Free",   "F6, F9"],
        ],
        col_weights=[0.22, 0.28, 0.14, 0.12, 0.24],
        header_align=['L', 'L', 'C', 'C', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Appendix D — Code Module Inventory", H2))
    s.append(Paragraph(
        "The code module inventory is the master list of every TypeScript module to be built or modified, with the function(s) it serves, current status, and dependencies. Modules marked EXIST need correctness audit; NEW modules are to be built; UPGRADE modules need functional expansion. Total estimated lines of code across all modules: approximately 38,000. Total estimated build effort: 4-5 engineer-quarters, sequenced across the 4-phase roadmap.",
        BODY))
    s.append(std_table(
        headers=["Module", "Function", "Status", "Est. LoC"],
        rows=[
            ["types.ts",                     "Core",      "EXIST — audit",  "~1,200"],
            ["engine.ts",                    "F1",        "EXIST — audit",  "~2,000"],
            ["lenders.ts",                   "F2",        "EXIST — expand", "~1,800"],
            ["reserveEngine.ts",             "F1",        "EXIST — expand", "~1,400"],
            ["sensitivity.ts",               "F1",        "EXIST — upgrade","~1,000"],
            ["loanOptimizer.ts",             "F1",        "EXIST — upgrade","~1,300"],
            ["strUnderwriting.ts",           "F1",        "EXIST — audit",  "~900"],
            ["preflightGate.ts",             "F1",        "NEW",            "~650"],
            ["rentCompAggregator.ts",        "F1",        "NEW",            "~820"],
            ["insuranceEstimator.ts",        "F1",        "NEW",            "~430"],
            ["taxEstimator.ts",              "F1",        "NEW",            "~380"],
            ["confidenceScorer.ts",          "F1",        "NEW",            "~290"],
            ["dealBreakCurve.ts",            "F1",        "NEW",            "~340"],
            ["monteCarloSurvivorship.ts",    "F1",        "NEW",            "~720"],
            ["lenderGuidelines.ts",          "F2",        "NEW",            "~2,400"],
            ["guidelineDiff.ts",             "F2",        "NEW",            "~640"],
            ["fitScorer.ts",                 "F2",        "NEW",            "~520"],
            ["pricingGridFeed.ts",           "F2",        "NEW",            "~880"],
            ["relationshipTracker.ts",       "F2",        "NEW",            "~430"],
            ["declinePatternLearner.ts",     "F2 / F6",   "NEW",            "~570"],
            ["twoQuoteEnforcer.ts",          "F2",        "NEW",            "~210"],
            ["quoteExplainer.ts",            "F3",        "NEW",            "~680"],
            ["rateAdjustmentEngine.ts",      "F3",        "NEW",            "~540"],
            ["constraintVisualizer.ts",      "F3",        "NEW",            "~470"],
            ["scenarioToggles.ts",           "F3",        "NEW",            "~390"],
            ["pdfQuotePack.ts",              "F3",        "NEW",            "~1,100"],
            ["reasonCodes.ts",               "F3",        "NEW",            "~320"],
            ["auditLog.ts",                  "F3 / Cross","NEW",            "~430"],
            ["borrowerPortal.ts",            "F3",        "NEW",            "~1,800"],
            ["fileCompletenessEngine.ts",    "F4",        "NEW",            "~1,200"],
            ["documentOcr.ts",               "F4",        "NEW",            "~1,800"],
            ["documentReconciler.ts",        "F4",        "NEW",            "~960"],
            ["defectScorer.ts",              "F4",        "NEW",            "~430"],
            ["submissionPackGenerator.ts",   "F4",        "NEW",            "~1,100"],
            ["titleAppraisalReconciler.ts",  "F4",        "NEW",            "~680"],
            ["complianceAttestations.ts",    "F4 / Cross","NEW",            "~840"],
            ["lenderStackProfiles.ts",       "F4",        "NEW",            "~1,400"],
            ["agentPortal.ts",               "F5",        "NEW",            "~2,200"],
            ["wholesalerIntake.ts",          "F5",        "NEW",            "~1,400"],
            ["investorCRM.ts",               "F5",        "NEW",            "~1,800"],
            ["correspondentSyndicate.ts",    "F5",        "NEW",            "~1,600"],
            ["cpaAdvisorProgram.ts",         "F5",        "NEW",            "~720"],
            ["channelAttribution.ts",        "F5",        "NEW",            "~960"],
            ["channelDashboard.ts",          "F5",        "NEW",            "~1,100"],
            ["declineGate.ts",               "F6",        "NEW",            "~620"],
            ["riskScorecard.ts",             "F6",        "NEW",            "~540"],
            ["adverseActionEngine.ts",       "F6",        "NEW",            "~880"],
            ["reasonCodeLibrary.ts",         "F6",        "NEW",            "~440"],
            ["fairLendingAudit.ts",          "F6 / Cross","NEW",            "~680"],
            ["exceptionOverride.ts",         "F6",        "NEW",            "~360"],
            ["regulatoryEngine.ts",          "Cross",     "NEW",            "~3,200"],
            ["statePppMatrix.ts",            "Cross",     "EXIST — expand", "~1,800"],
            ["strRegulationDb.ts",           "Cross",     "NEW",            "~2,400"],
            ["commandCenterUi.tsx",          "Cross",     "NEW",            "~4,500"],
        ],
        col_weights=[0.30, 0.16, 0.20, 0.14],
        header_align=['L', 'L', 'L', 'C'],
    ))

    s.append(Spacer(0, 10))
    s.append(callout_box(
        "End of ULTRAPLAN — Begin Execution",
        "The doctrine is set. The diagnostic is honest. The roadmap is sequenced. The KPIs are calibrated. The code modules are inventoried. What remains is execution — phase by phase, module by module, file by file. The platform will not become elite because of this document; it will become elite because the operator desk lives the doctrine every day, declines the bad files, sends the clean files, and tells the borrower the truth in ten minutes. Build the doctrine. Live the doctrine. Win the market.",
        color=ACCENT, bg=CARD_BG,
    ))

    return s
