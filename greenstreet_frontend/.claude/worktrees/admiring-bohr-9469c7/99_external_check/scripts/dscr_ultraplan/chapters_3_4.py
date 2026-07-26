"""Chapters 3-4 content: Function 1 (Scenario Accuracy) + Function 2 (Guideline Intelligence)."""

from build_body import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem,
    BODY, BODY_LEFT, BULLET, H2, H3, CALLOUT_TITLE, CALLOUT_BODY, SMALL, QUOTE,
    callout_box, metric_strip, std_table, bullets, hr, make_heading, chapter_opener,
    ACCENT, ACCENT_2, HEADER_FILL, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED,
    SEM_SUCCESS, SEM_WARNING, SEM_ERROR, SEM_INFO,
    SANS_BOLD, SANS_FONT, BODY_BOLD, BODY_ITALIC, MONO_FONT,
)
from reportlab.platypus import PageBreak


def chapter_3():
    """Chapter 3 — Function 1: Scenario Accuracy (The 10-Minute Verdict)."""
    s = chapter_opener(3, "Function 1 — Scenario Accuracy: The 10-Minute Verdict",
        "Elite standard: from a property address, you can produce a GO / NO-GO verdict with a confidence score in under ten minutes. Anything slower is a loss of optionality; anything less confident is a guess.")

    s.append(Paragraph("Elite Standard", H2))
    s.append(Paragraph(
        "The elite operator can, in under ten minutes from receiving a property address and a basic borrower brief, produce a verdict with three components: a Track A DSCR range with lender-attribution (which two lenders will quote, at what rate band, with what fit tier); a Track B survival verdict (does the deal survive real-world losses, a one-shock event, and a liquidity squeeze); and a confidence score that calibrates how much weight to put on the verdict. The verdict must be wrong less than 5% of the time at the GO/NO-GO threshold, and the confidence score must be calibrated — meaning a 90% confidence verdict is actually correct 90% of the time, not 75% of the time. Calibration is harder than accuracy; an uncalibrated confident verdict is more dangerous than a calibrated uncertain one.",
        BODY))

    s.append(Paragraph(
        "Ten minutes is not an arbitrary target. It is the time within which a borrower on the phone will stay engaged, the time within which an agent referral will not lose patience, and the time within which a wholesaler's file can be triaged before it competes for the operator's attention with five other files. Beyond ten minutes, the operator has lost the moment of peak borrower trust; beyond twenty minutes, the file has typically been shopped to a competitor. The platform's job is to compress the ten-minute verdict into a reproducible workflow that any trained operator can execute, not just the founder.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(metric_strip([
        ("10 min", "Time-to-verdict SLA"),
        ("95%", "Verdicts under 10 min"),
        ("90%", "Confidence calibration"),
        ("5%", "False GO rate ceiling"),
    ]))

    s.append(Spacer(0, 10))
    s.append(Paragraph("Current Gap", H2))
    s.append(Paragraph(
        "Today the platform produces a verdict in roughly 25 to 45 minutes for a clean file, and significantly longer for a file with STR income, mixed-use zoning, or a non-standard entity structure. The bottlenecks are: (a) rent figures are operator-entered after manual lookup on RentCast, Rentometer, and AirDNA, with no automated aggregation or confidence weighting; (b) insurance and tax estimates require separate manual lookups that often consume five to ten minutes per file; (c) the pre-flight gate does not exist, so files enter the underwriting queue that should have been declined at intake (HOA STR ban, flood zone AE without HOI, prohibited state); (d) there is no Monte Carlo overlay, so Track B produces a single-point survival verdict that understates tail risk and forces the operator to manually stress-test.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Required Upgrades", H2))

    s.append(Paragraph("1. Instant Pre-flight Gate", H3))
    s.append(Paragraph(
        "The pre-flight gate is the single highest-leverage upgrade in the entire Ultraplan. It runs in under 90 seconds from a property address and produces a red / amber / green verdict on seven dimensions: STR legality (CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED), zoning classification, HOA STR restrictions, flood zone (with HOI implication), insurability (Carrier of last resort flagged), title red flags (recent transfer, liens, judgment), and property type eligibility (SFR / 2-4 / condo / mixed / commercial). Red on any dimension auto-declines the file before underwriting time is spent; amber routes to manual review with a specific reason code; green proceeds to full underwriting. The gate eliminates 20-30% of bad files at intake, which is the largest single productivity gain available.",
        BODY))

    s.append(Paragraph("2. Automated Rent Comp Aggregator", H3))
    s.append(Paragraph(
        "The rent comp aggregator pulls from four sources in parallel — RentCast (long-term market rent), Rentometer (long-term percentile range), AirDNA (STR projected revenue with 20% Track-A discount applied), and MLS 1007 (when an appraisal-style market rent opinion is available) — and produces a triangulated rent figure with a confidence weight. The lower-of rule (qualifying rent = minimum of lease rent and 1007 market rent) is enforced automatically. The three STR income worlds (long-term market rent, forecast STR, historical STR) are kept strictly separated and never mixed in the same calculation. This eliminates the single largest source of operator-entered error and saves 8-12 minutes per file.",
        BODY))

    s.append(Paragraph("3. Lender Matrix Auto-Router", H3))
    s.append(Paragraph(
        "Given the file shape (LTV requested, FICO, property type, state, loan amount, DSCR signal from the rent comp), the auto-router returns the two lenders most likely to quote (one flex lender, one rate-competitive lender, per the two-quote rule) and the rate band each will quote at. This is the operational manifestation of Function 2 (Guideline Intelligence) — the router depends on the lender matrix being complete and current. The router also surfaces the fit tier for each lender (Strong / Standard / Conditional / Unlikely / Does Not Meet) so the operator can immediately see whether to push for a quote or to triage.",
        BODY))

    s.append(Paragraph("4. Confidence-Weighted DSCR Range Output", H3))
    s.append(Paragraph(
        "Instead of producing a single point estimate of Track A DSCR, the platform produces a range with a confidence interval: e.g., 'Track A DSCR 1.05 to 1.12, 90% confidence, driven by rent comp uncertainty of ±$75/month.' The confidence score combines four components: source timeliness (40% weight), source quantity (25%), source quality (25%), and cross-source consistency (10%). A verdict with sub-70% confidence is flagged for manual verification before it is shared with the borrower. This is the calibration discipline that separates elite operators from confident-but-wrong ones.",
        BODY))

    s.append(Paragraph("5. Enhanced Deal-Break Rate Solver", H3))
    s.append(Paragraph(
        "The deal-break rate solver already exists and correctly identifies the interest rate at which Track A DSCR equals the lender's minimum (the flagship transaction solves to 7.67%). The enhancement is to produce a deal-break curve, not a single point — showing how the deal-break rate shifts as LTV moves from 70% to 80%, as the rent comp moves from -5% to +5%, and as the DSCR minimum moves from 1.00 to 1.20. The curve lets the operator see whether the deal is fragile (deal-break rate within 50bps of market) or robust (deal-break rate 200bps above market) before recommending a lender.",
        BODY))

    s.append(Paragraph("6. Monte Carlo Survivorship Overlay", H3))
    s.append(Paragraph(
        "Track B currently produces a single-point survival verdict. The Monte Carlo overlay runs 10,000 trials varying vacancy (5-15%), repair shocks (probability and severity distributions by property age and type), management fee inflation, interest rate reset risk (for ARM and IO loans), and exit liquidity (refinance probability as a function of equity buildup). The output is a survivorship probability at 12, 24, and 36 months — the probability that the investor can carry the property without injecting additional capital. A deal with 95% 12-month survival but 55% 36-month survival is fundamentally different from one with 90% / 88% / 85%, even though the 12-month numbers look similar; the overlay surfaces this distinction.",
        BODY))

    s.append(Paragraph("7. Tax and Insurance Estimator Integrations", H3))
    s.append(Paragraph(
        "Property tax estimates are pulled from county assessor APIs (where available) or modeled from assessed value plus millage rate; insurance estimates are pulled from a HOI estimation service (Hippo, The Zebra, or similar) with a carrier-of-last-resort flag for properties in windpool or wildfire zones. These integrations eliminate 5-10 minutes of manual lookup per file and dramatically reduce the variance in PITIA estimation that currently makes Track A DSCR noisy.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("New Code Modules", H2))
    s.append(std_table(
        headers=["Module", "Purpose", "Dependencies", "Est. LoC"],
        rows=[
            ["preflightGate.ts",          "7-dimension pre-flight gate, red/amber/green output", "zoningApi, floodApi, strLegalityDb, hoaDb", "~650"],
            ["rentCompAggregator.ts",     "4-source rent comp pull, triangulation, confidence", "RentCast, Rentometer, AirDNA, MLS 1007", "~820"],
            ["insuranceEstimator.ts",     "HOI estimate + carrier-of-last-resort flag",        "HOI estimation API, windpool/wildfire zones", "~430"],
            ["taxEstimator.ts",           "County assessor pull or millage model",              "County assessor APIs, millage db", "~380"],
            ["confidenceScorer.ts",       "4-component confidence score (time/qty/qual/consis)","Provenance tags on all inputs", "~290"],
            ["dealBreakCurve.ts",         "Deal-break rate curve across LTV/rent/DSCR sweep",  "engine.ts (existing)", "~340"],
            ["monteCarloSurvivorship.ts", "10,000-trial Track B survival overlay",             "engine.ts, reserveEngine.ts", "~720"],
        ],
        col_weights=[0.22, 0.34, 0.32, 0.12],
        header_align=['L', 'L', 'L', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Workflow Diagram — The 10-Minute Verdict", H2))
    s.append(Paragraph(
        "The compressed workflow is: <b>T+0:00</b> Operator enters address + borrower brief. <b>T+0:30</b> Pre-flight gate returns red/amber/green on 7 dimensions. <b>T+1:30</b> If green: rent comp aggregator returns triangulated rent with confidence score. <b>T+3:00</b> Tax and insurance estimators return PITIA components. <b>T+4:00</b> Track A DSCR range computed; lender auto-router returns two fit-tier lenders with rate bands. <b>T+5:30</b> Track B survival verdict with Monte Carlo overlay returns 12/24/36-month survivorship. <b>T+7:00</b> Deal-break curve computed; verdict and quote packet drafted. <b>T+9:30</b> Confidence score finalized; if ≥85% confidence, verdict delivered to borrower with PDF quote packet; if <85%, manual review flag and re-pull of weakest input. The workflow is designed to leave 30 seconds of operator judgment time at the end, which is the irreducible human component.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Key Performance Indicators", H2))
    s.append(std_table(
        headers=["KPI", "Baseline (today)", "90-day target", "365-day target"],
        rows=[
            ["Median time-to-verdict",            "25-45 min", "12 min",  "<10 min"],
            ["% verdicts under 10 min",           "~20%",      "60%",     "95%"],
            ["Confidence calibration (Brier)",    "n/a",       "0.18",    "<0.10"],
            ["False GO rate (deals that fail)",   "unmeasured","12%",     "<5%"],
            ["Pre-flight gate auto-decline rate", "0%",        "20%",     "28%"],
            ["Rent comp manual override rate",    "100%",      "40%",     "<15%"],
        ],
        col_weights=[0.34, 0.22, 0.22, 0.22],
        header_align=['L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Risks and Mitigations", H2))
    s.append(Paragraph(
        "The principal risk is data-source reliability. RentCast and Rentometer have known accuracy gaps in secondary and tertiary markets, and AirDNA STR projections degrade quickly in markets with thin short-term rental inventory. Mitigation: the confidence score must surface low-confidence verdicts for manual verification, and the rent comp aggregator must always display the spread between sources so the operator can spot disagreement. A secondary risk is API rate limits and cost — RentCast and AirDNA both charge per-pull, and an uncontrolled aggregator could run up significant monthly cost. Mitigation: aggressive caching (rent comps for a given address are valid for 30 days), bulk-pull batching for portfolio scenarios, and a monthly cost ceiling that throttles pulls when hit. A tertiary risk is false-decline from the pre-flight gate — a property flagged PROHIBITED for STR when it is in fact legal under a recent ordinance change. Mitigation: the STR legality database must have a weekly refresh cadence and an operator-override path with audit logging.",
        BODY))

    s.append(PageBreak())
    return s


def chapter_4():
    """Chapter 4 — Function 2: Guideline Intelligence (Lender Fit)."""
    s = chapter_opener(4, "Function 2 — Guideline Intelligence: Lender Fit",
        "Elite standard: a real-time guideline database covering 25+ verified lenders, with fit scoring that auto-maps each file to the right two lenders and a diff engine that surfaces every guideline change before it kills a pipeline file.")

    s.append(Paragraph("Elite Standard", H2))
    s.append(Paragraph(
        "The elite operator knows which lender fits which file before they pick up the phone. The platform's job is to make this knowledge mechanical: given a file shape, return the two lenders most likely to quote (one flex lender for borderline files, one rate-competitive lender for clean files), with a Fit Tier (Strong / Standard / Conditional / Unlikely / Does Not Meet) for each, a rate band that the lender is currently quoting for that file shape, and a list of any guideline changes in the last 30 days that affect the file. The two-quote rule is non-negotiable: every quoted file goes out with two lender options so the borrower sees real competition, not a single take-it-or-leave-it offer.",
        BODY))

    s.append(Paragraph(
        "Beyond the per-file fit, the elite operator maintains a lender relationship tier system that tracks which lenders actually close the files sent to them (A-tier relationships close >70% of submitted files; B-tier 40-70%; C-tier <40%). This relationship data feeds back into the fit scoring — a lender may have guidelines that fit a file perfectly but a relationship tier that says they will not close it, in which case the platform recommends the next-best lender with a stronger relationship. This is the difference between a fit score that says 'this loan meets the guideline' and one that says 'this loan will close.'",
        BODY))

    s.append(Spacer(0, 6))
    s.append(metric_strip([
        ("25+", "Verified lenders"),
        ("100%", "Two-quote compliance"),
        (">85%", "Fit accuracy (will-close)"),
        ("<7d", "Guideline diff latency"),
    ]))

    s.append(Spacer(0, 10))
    s.append(Paragraph("Current Gap", H2))
    s.append(Paragraph(
        "The current lender matrix has seven verified lenders — Griffin, Defy, Easy Street, Lima One, New Silver, Kiavi, and Deephaven. This is roughly half the minimum needed to enforce the two-quote rule across the full file-shape spectrum. Seven lenders can cover either the LTV spectrum (65-85%) or the FICO spectrum (660-760) adequately, but not both, and there is no coverage for niche file shapes (condotels, non-warrantable condos, mixed-use, log homes, foreign national borrowers). Beyond depth, the matrix has three structural deficits: there is no guideline diff engine (when a lender updates a guideline, no one knows until a file gets declined); there is no fit scoring (the operator eyeballs which lender to send to); and there is no relationship tier tracking (the platform does not know which lenders actually close the files sent to them).",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Required Upgrades", H2))

    s.append(Paragraph("1. Expand Lender Matrix to 25+ Verified Lenders", H3))
    s.append(Paragraph(
        "The target lender matrix covers the full file-shape spectrum with at least three lenders in each LTV band (65-70%, 70-75%, 75-80%, 80-85%) and at least two in each property type category (SFR, 2-4 unit, condo, condotel, mixed-use, manufactured). The expansion prioritizes lenders that fill current matrix gaps — Visio Lending (75-80% LTV, strong on 2-4 unit), LendingOne (70-80% LTV, strong on condotels), RCN Capital (65-75% LTV, strong on mixed-use), Anchor Loans (70-80% LTV, strong on fix-and-flip bridge), Lima One expanded programs (75% LTV on STR), Velocity Mortgage (65-80% LTV, strong on manufactured), and others. Every lender entry carries provenance tags and a verification date; entries older than 90 days are flagged for re-verification.",
        BODY))

    s.append(Paragraph("2. Guideline Diff Engine", H3))
    s.append(Paragraph(
        "The guideline diff engine monitors each lender's published guideline matrix on a weekly cadence and surfaces any change within 7 days of publication. A change is classified as material (DSCR minimum, LTV cap, FICO floor, state exclusion added, program exit) or cosmetic (formatting, contact info, marketing copy). Material changes trigger a pipeline impact analysis: every file in the pipeline that was routed to that lender is flagged, the operator is notified, and an alternative lender is recommended if the file no longer fits. This eliminates the silent killer of DSCR pipelines — the lender that tightens a guideline mid-pipeline and declines a file that would have closed three weeks earlier.",
        BODY))

    s.append(Paragraph("3. Fit Tier Auto-Mapping", H3))
    s.append(Paragraph(
        "Given a file shape, the fit scorer returns a Fit Tier for each lender in the matrix: <b>Strong</b> (file meets every guideline with margin), <b>Standard</b> (file meets every guideline), <b>Conditional</b> (file meets guidelines but with a borderline dimension — DSCR within 0.05, FICO within 20 points, LTV within 2%), <b>Unlikely</b> (file misses one guideline), <b>Does Not Meet</b> (file misses multiple guidelines). The auto-router then enforces the two-quote rule: pick one Strong or Standard lender (rate-competitive) and one Conditional or Unlikely lender (flex), and present both to the borrower with the fit tier visible so the borrower understands the relative confidence of each quote.",
        BODY))

    s.append(Paragraph("4. Two-Quote Rule Enforcement", H3))
    s.append(Paragraph(
        "The two-quote rule is a hard platform constraint: no quote leaves the system with only one lender attached. The rule exists because a single-lender quote is not a quote, it is a take-it-or-leave-it offer, and borrowers correctly distrust such offers. The enforcement is simple: the quote packet generator refuses to render a PDF with fewer than two lender sections. The operator can override the rule (for example, when only one lender in the matrix fits a niche file shape) but the override is logged and reviewed monthly. Repeated overrides trigger a matrix gap analysis — if the same niche keeps producing single-lender quotes, a lender must be added to the matrix to fill the gap.",
        BODY))

    s.append(Paragraph("5. Lender Relationship Tier Tracker", H3))
    s.append(Paragraph(
        "Every submitted file carries an outcome tag (closed / declined / withdrawn / approved-but-not-funded) and the outcome is recorded against the submitting lender. The relationship tier is computed quarterly: A-tier (closes >70% of submitted files), B-tier (40-70%), C-tier (<40%). The fit scorer weights Fit Tier by Relationship Tier — a lender with a Strong Fit Tier but a C-tier relationship is demoted in the auto-router recommendation, because a perfect guideline match with a lender that will not close is worth less than a Standard match with an A-tier relationship. This is the platform's feedback loop for reality.",
        BODY))

    s.append(Paragraph("6. Live Pricing Grid Integration", H3))
    s.append(Paragraph(
        "Where lenders expose a live pricing grid (Optimal Blue, PPE, or lender-direct APIs), the platform pulls the current rate sheet for the file shape and returns the actual quote — not a modeled rate band. Live pricing is preferred over modeled pricing whenever available, and the quote packet notes whether the rate is live or modeled. For lenders without live pricing, the modeled rate band uses the lender's last-known grid plus a market adjustment factor (a function of the 10-year Treasury and MBS spread) to estimate current pricing. Modeled quotes carry a disclaimer and a refresh cadence (24 hours).",
        BODY))

    s.append(Paragraph("7. Decline-Pattern Learning", H3))
    s.append(Paragraph(
        "Every lender decline is tagged with the lender's stated reason code (DSCR, FICO, LTV, property type, state, entity, reserves, etc.) and recorded in a decline-pattern database. The database is mined quarterly for patterns: 'Lender X declines 60% of files with DSCR 1.00-1.05 even though their published minimum is 1.00' or 'Lender Y declines 80% of condotels even though they are not on the exclusion list.' These patterns feed back into the fit scorer as adjustments — a lender's effective DSCR minimum may be 1.10 even though their published minimum is 1.00, and the fit scorer uses the effective number. This is how the platform learns what lenders actually do, not what they say they do.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Target Lender Expansion List (Year 1)", H2))
    s.append(std_table(
        headers=["Lender", "LTV Band", "Niche Strength", "Verification Status"],
        rows=[
            ["Visio Lending",       "75-80%",   "2-4 unit, STR",            "Target — Q2"],
            ["LendingOne",          "70-80%",   "Condotel, foreign national","Target — Q2"],
            ["RCN Capital",         "65-75%",   "Mixed-use, bridge",        "Target — Q2"],
            ["Anchor Loans",        "70-80%",   "Fix-and-flip, bridge",     "Target — Q3"],
            ["Velocity Mortgage",   "65-80%",   "Manufactured, rural",      "Target — Q3"],
            ["Visions FCU (correspondent)", "75-80%", "Rate-competitive owner-occ adjacent", "Target — Q3"],
            ["Park Place Finance",  "70-80%",   "Cash-out, no-seasoning",   "Target — Q3"],
            ["Anchor Six Lending",  "70-80%",   "STR, condotels",           "Target — Q4"],
            ["Broadmark Realty",    "65-75%",   "Bridge, fix-flip",         "Target — Q4"],
            ["CoreVest Finance",    "70-80%",   "Portfolio, single-asset",  "Target — Q4"],
            ["Lima One STR program","75%",      "STR expanded",             "Verify — Q1"],
            ["Griffin expanded STR","75-80%",   "STR with historical income","Verify — Q1"],
            ["Marquee Funding",     "65-75%",   "CA specialty, jumbo",      "Target — Q4"],
            ["Pacwest Capital",     "70-80%",   "West Coast, jumbo DSCR",   "Target — Q4"],
            ["Grand Coast Financial","65-75%",  "Bridge, multifamily",      "Target — Q4"],
            ["Pinnacle DSCR",       "70-80%",   "Rate-competitive, SFR",    "Target — Q4"],
            ["Stratton Equities",   "70-80%",   "No-income, alternative",   "Target — Q4"],
            ["Centerpoint Lending", "70-80%",   "SFR, 2-4 unit",            "Target — Q4"],
        ],
        col_weights=[0.28, 0.14, 0.34, 0.24],
        header_align=['L', 'C', 'L', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("New Code Modules", H2))
    s.append(std_table(
        headers=["Module", "Purpose", "Est. LoC"],
        rows=[
            ["lenderGuidelines.ts",    "Structured guideline JSON per lender (25+ entries)", "~2,400"],
            ["guidelineDiff.ts",       "Weekly diff + material change classifier + pipeline impact", "~640"],
            ["fitScorer.ts",           "File shape -> Fit Tier per lender, with relationship tier adjustment", "~520"],
            ["pricingGridFeed.ts",     "Optimal Blue / PPE / lender-direct live pricing integration", "~880"],
            ["relationshipTracker.ts", "Outcome tagging, quarterly tier computation, history", "~430"],
            ["declinePatternLearner.ts","Reason-code mining, effective-minimum inference", "~570"],
            ["twoQuoteEnforcer.ts",    "Quote packet refuses to render with <2 lenders; override log", "~210"],
        ],
        col_weights=[0.28, 0.60, 0.12],
        header_align=['L', 'L', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Key Performance Indicators", H2))
    s.append(std_table(
        headers=["KPI", "Baseline", "90-day", "365-day"],
        rows=[
            ["Verified lenders in matrix",         "7",        "14",       "25+"],
            ["Two-quote rule compliance",          "~60%",     "95%",      "100%"],
            ["Fit accuracy (will-close prediction)", "unmeasured","70%",   ">85%"],
            ["Guideline diff detection latency",   "manual",   "<14 days", "<7 days"],
            ["A-tier relationships",               "0 tracked","5",        "12+"],
            ["Pipeline files lost to guideline change", "unmeasured", "<8%", "<3%"],
        ],
        col_weights=[0.40, 0.20, 0.20, 0.20],
        header_align=['L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Risks and Mitigations", H2))
    s.append(Paragraph(
        "The principal risk is guideline data accuracy. Lender matrices change frequently (some lenders update monthly, some quarterly, some ad hoc), and stale data is worse than no data because it produces confident wrong answers. Mitigation: every guideline entry carries a verification date and a re-verification cadence (90 days for stable lenders, 30 days for volatile ones), and entries past their re-verification date are flagged in the fit scorer with a confidence penalty. A secondary risk is relationship data integrity — the relationship tier is only as good as the outcome tagging, and operators may forget to tag outcomes. Mitigation: outcome tagging is a required field at file close-out, enforced by the workflow system; files without outcome tags appear on a daily exception report. A tertiary risk is overfitting — the decline-pattern learner may infer an effective minimum from a small sample (e.g., 3 declines out of 4 submissions) and over-penalize a lender. Mitigation: effective minimums require a minimum sample size (10 submissions) before they override the published minimum, and the inference is logged for operator review.",
        BODY))

    s.append(PageBreak())
    return s
