"""Chapters 5-6 content: Function 3 (Borrower Trust) + Function 4 (Capital Partner Trust)."""

from build_body import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem,
    BODY, BODY_LEFT, BULLET, H2, H3, CALLOUT_TITLE, CALLOUT_BODY, SMALL, QUOTE,
    callout_box, metric_strip, std_table, bullets, hr, make_heading, chapter_opener,
    ACCENT, ACCENT_2, HEADER_FILL, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED,
    SEM_SUCCESS, SEM_WARNING, SEM_ERROR, SEM_INFO,
    SANS_BOLD, SANS_FONT, BODY_BOLD, BODY_ITALIC, MONO_FONT,
)
from reportlab.platypus import PageBreak


def chapter_5():
    """Chapter 5 — Function 3: Borrower Trust (Quote Credibility)."""
    s = chapter_opener(5, "Function 3 — Borrower Trust: Quote Credibility",
        "Elite standard: investors believe your quote because you explain the constraints. Every quote is regulator-ready, backed by full disclosure, and the borrower can see exactly why this rate, this LTV, this term.")

    s.append(Paragraph("Elite Standard", H2))
    s.append(Paragraph(
        "Borrower trust is not a function of having the lowest rate; it is a function of being the most credible. The elite operator produces a quote that the borrower believes because the quote explains itself — the rate is decomposed into base rate, adjustment matrix, and DSCR bridge; the constraints are visualized so the borrower can see what limits the LTV, DSCR, and term; and the borrower can toggle scenarios ('what if rate drops 50bps', 'what if I put down 5% more') and see the answer update in real time. The quote packet is a PDF with provenance tags on every number, so the borrower — and their CPA, attorney, or partner — can audit the assumptions. When the borrower asks 'why is this rate 8.25% and not 7.5%?', the operator has a one-click answer.",
        BODY))

    s.append(Paragraph(
        "Trust is also a function of honesty about the constraints. The elite quote says 'this loan qualifies at 75% LTV, not 80%, because the DSCR at 80% is 0.96 and the lender minimum is 1.00. If you can document an additional $200/month in rent, the DSCR at 80% becomes 1.02 and we can re-quote at the higher LTV.' This honesty converts the quote from a take-it-or-leave-it offer into a collaborative problem-solving conversation, which is the foundation of repeat business. Borrowers do not return to operators who quote low and decline late; they return to operators who quote honest and close on time.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(metric_strip([
        (">70%", "Quote acceptance rate"),
        (">50", "Borrower NPS"),
        ("<2d", "Time-to-trust"),
        ("100%", "Quotes with provenance"),
    ]))

    s.append(Spacer(0, 10))
    s.append(Paragraph("Current Gap", H2))
    s.append(Paragraph(
        "Today the platform produces a rate, a payment, and a Track A / Track B verdict, but it does not explain itself. The borrower sees a number; they do not see why the number is what it is, what would change it, or what constraints limit it. The quote is delivered verbally or in a free-form email, with no provenance, no scenario toggles, and no audit trail. The result is that borrowers shop the quote — they take the number to a competitor and ask 'can you beat this?', because they have no reason to believe the number is the right number. This is the principal reason operators lose deals they should close: not because the quote is wrong, but because the quote is not credible.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Required Upgrades", H2))

    s.append(Paragraph("1. 'Why This Rate' Explainer", H3))
    s.append(Paragraph(
        "The explainer decomposes the quoted rate into three components: (a) the lender's base rate for the file shape (the rate before adjustments, looked up from the live pricing grid or modeled from the last-known grid); (b) the adjustment matrix (each adjustment that applies — LTV adjustment, FICO adjustment, DSCR adjustment, property type adjustment, occupancy adjustment, reserve adjustment — with the basis-point impact of each); (c) the DSCR bridge (gross rent to PITIA build-up, with each component of PITIA broken out). The output is a visual waterfall that starts at the base rate and ends at the quoted rate, with each adjustment as a labeled step. The borrower can see, in 30 seconds, exactly why 8.25% and not 7.5%.",
        BODY))

    s.append(Paragraph("2. Constraint Visualization", H3))
    s.append(Paragraph(
        "The constraint visualization shows what is binding the LTV, the DSCR, and the term. For LTV: 'Lender caps LTV at 80% for this property type; you requested 80%, so LTV is at the cap.' For DSCR: 'At 80% LTV, PITIA is $2,270/month; qualifying rent at $2,300 gives DSCR 1.01; lender minimum is 1.00, so DSCR is the binding constraint.' For term: 'Lender offers 30/25/20/15 year terms; 30-year produces the lowest PITIA and the highest DSCR, so 30-year is recommended.' The visualization also shows what would unbind each constraint — 'If you put down 5% more (75% LTV), PITIA drops to $2,130 and DSCR rises to 1.08, which moves the file from Conditional to Strong Fit Tier.'",
        BODY))

    s.append(Paragraph("3. Side-by-Side Lender Comparison with Reason Codes", H3))
    s.append(Paragraph(
        "The two-quote rule produces two lender quotes; the side-by-side comparison shows them next to each other with reason codes for the differences. Reason codes are short, specific, and operator-meaningful: 'RATE-001: Lender A has a 25bps pricing adjustment for 75% LTV that Lender B does not'; 'FICO-003: Lender A requires 680 FICO minimum, Lender B requires 700, your 705 FICO qualifies for both but is closer to Lender A's floor'; 'PPP-002: Lender A has a 5-year soft prepay, Lender B has a 3-year yield-maintenance, both are permissible in this state but Lender B's penalty is heavier if you sell in year 2.' The reason codes make the comparison legible — the borrower can see why the two quotes are different and choose on the merits.",
        BODY))

    s.append(Paragraph("4. 'What Would Change This' Scenario Toggles", H3))
    s.append(Paragraph(
        "The quote packet includes five interactive scenario toggles that recompute the quote in real time: (a) rate +/- 50bps; (b) DSCR +/- 0.10; (c) LTV +/- 5%; (d) term 30/25/20/15-year; (e) rent comp +/- $100/month. Each toggle shows the new PITIA, the new DSCR, the new fit tier, and whether the lender would still quote at the new file shape. The toggles let the borrower explore their own what-ifs without requiring operator time — they can see for themselves that 'yes, putting down 5% more gets us to 80% LTV at 7.75% instead of 75% LTV at 8.00%' without picking up the phone. This is the principal trust-builder: the platform lets the borrower audit the operator's reasoning.",
        BODY))

    s.append(Paragraph("5. PDF Quote Packet with Provenance Tags", H3))
    s.append(Paragraph(
        "The quote packet is a 4-6 page PDF that includes: (a) cover page with file summary, lender A vs lender B comparison, and quote expiration; (b) 'Why this rate' waterfall for each lender; (c) constraint visualization; (d) Track A and Track B verdicts with confidence scores; (e) scenario toggle results table; (f) assumptions appendix with provenance tags on every input ([VERIFIED-Primary], [VERIFIED-Secondary], [UNVERIFIED]) and a refresh date for each. The PDF is delivered to the borrower within 30 minutes of the verdict; it is the artifact that the borrower will show to their CPA, attorney, and partners, so it must be defensible. The provenance tags are non-negotiable: a quote without provenance is an opinion; a quote with provenance is an audit.",
        BODY))

    s.append(Paragraph("6. Audit Log of Every Assumption and Override", H3))
    s.append(Paragraph(
        "Every assumption (rent comp figure, insurance estimate, tax estimate, DSCR minimum, rate grid version) is logged with the source, the timestamp, and the operator who entered or approved it. Every override (operator manually adjusting the rent comp, operator overriding the auto-router's lender recommendation, operator overriding the pre-flight gate) is logged with the operator, the timestamp, and a free-text reason. The audit log serves three purposes: it makes the operator's reasoning reviewable, it makes the platform's recommendations improvable (patterns of override reveal where the platform is wrong), and it makes the file defensible in the event of a borrower complaint or a regulatory inquiry.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("New Code Modules", H2))
    s.append(std_table(
        headers=["Module", "Purpose", "Est. LoC"],
        rows=[
            ["quoteExplainer.ts",          "'Why this rate' waterfall + adjustment matrix", "~680"],
            ["rateAdjustmentEngine.ts",    "Base rate lookup + adjustment application",    "~540"],
            ["constraintVisualizer.ts",    "LTV/DSCR/term binding constraint surfacing",  "~470"],
            ["scenarioToggles.ts",         "5-toggle interactive what-if engine",          "~390"],
            ["pdfQuotePack.ts",            "6-page PDF generator with provenance tags",   "~1,100"],
            ["reasonCodes.ts",             "Standardized reason code library (~50 codes)", "~320"],
            ["auditLog.ts",                "Immutable log of every assumption and override","~430"],
            ["borrowerPortal.ts",          "Web UI for borrowers to view and toggle quotes","~1,800"],
        ],
        col_weights=[0.28, 0.60, 0.12],
        header_align=['L', 'L', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Quote Packet Layout (6 pages)", H2))
    s.append(std_table(
        headers=["Page", "Section", "Key Content"],
        rows=[
            ["1", "Cover + summary",       "File summary, lender A vs B side-by-side, quote expiration, contact"],
            ["2", "Why this rate",         "Waterfall chart: base rate -> adjustments -> final rate, per lender"],
            ["3", "Constraints",           "LTV / DSCR / term binding constraints, with 'what unbinds each'"],
            ["4", "Track A / Track B",     "Dual-track verdict, confidence score, deal-break curve"],
            ["5", "Scenarios",             "5-toggle what-if table, with new PITIA / DSCR / Fit Tier per toggle"],
            ["6", "Assumptions appendix",  "Every input with provenance tag, source, timestamp, refresh date"],
        ],
        col_weights=[0.06, 0.22, 0.72],
        header_align=['C', 'L', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Key Performance Indicators", H2))
    s.append(std_table(
        headers=["KPI", "Baseline", "90-day", "365-day"],
        rows=[
            ["Quote acceptance rate",                "~35%",  "55%",    ">70%"],
            ["Borrower NPS",                         "unmeasured", "30", ">50"],
            ["Time-to-trust (verdict to acceptance)","~7 days",     "4 days", "<2 days"],
            ["Quotes with full provenance tags",     "0%",    "60%",    "100%"],
            ["Operator overrides per quote",         "n/a",   "<3",     "<1.5"],
            ["Borrower-initiated scenario toggles",  "0",     "~3/quote", "~8/quote"],
        ],
        col_weights=[0.40, 0.20, 0.20, 0.20],
        header_align=['L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Risks and Mitigations", H2))
    s.append(Paragraph(
        "The principal risk is information overload — a 6-page quote packet with 50 reason codes can overwhelm a borrower who is not financially sophisticated. Mitigation: the quote packet is layered — the cover page is one-glance, the comparison is two-minute, the assumptions appendix is deep-dive, and the borrower portal surfaces only the layer the borrower wants. A secondary risk is competitive intelligence leakage — a quote packet that decomposes the rate too thoroughly may help competitors reverse-engineer the lender's adjustment matrix. Mitigation: the adjustment matrix is shown to the borrower but the lender's name in the matrix is anonymized in any exportable format ('Lender A adjustment: +25bps at 75% LTV' rather than 'Griffin adjustment'). A tertiary risk is false precision — showing a DSCR of 1.05 implies more accuracy than the underlying rent comp (which may have ±$75/month uncertainty) supports. Mitigation: the confidence score is shown alongside every number, and a low-confidence number is flagged with an explicit 'verify before relying' marker.",
        BODY))

    s.append(PageBreak())
    return s


def chapter_6():
    """Chapter 6 — Function 4: Capital Partner Trust (Clean Files, Zero Defects)."""
    s = chapter_opener(6, "Function 4 — Capital Partner Trust: Clean Files, Zero Defects",
        "Elite standard: capital partners trust your files because they are clean, complete, and low-defect. First-pass clean rate above 90%, defect rate below 2%, and every submission matches the target lender's exact stack — first time, every time.")

    s.append(Paragraph("Elite Standard", H2))
    s.append(Paragraph(
        "Capital partner trust is earned one file at a time, and lost one defect at a time. The elite operator sends files that the lender's underwriter can approve on first review — every required document is present, every number reconciles across documents (rent roll matches lease matches 1007 matches appraisal), every signature is in place, every compliance attestation is signed. The first-pass clean rate (the percentage of submitted files that the lender does not return for rework) exceeds 90%. The defect rate (defects per file, weighted by severity) is below 2%. The result is that the lender's underwriters move the operator's files to the top of the queue — they know that an operator's file is a 20-minute review, not a 2-hour treasure hunt.",
        BODY))

    s.append(Paragraph(
        "This trust translates directly into turn time and pricing. A lender that trusts the operator's files will close in 18-21 days instead of 30-45 days, because the underwriter does not need to chase documents. A lender that trusts the operator's files will quote 12-25bps tighter on rate, because the lender's cost of carry and rework cost is lower. A lender that trusts the operator's files will grant the operator an exception when the operator needs one — a borderline DSCR, a borderline LTV, a borderline property type — because the lender knows the operator has earned the benefit of the doubt. Trust is the operator's most valuable capital asset, and it is built or destroyed by file quality.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(metric_strip([
        (">90%", "First-pass clean rate"),
        ("<2%", "Defect rate per file"),
        ("-40%", "Turn time vs peer"),
        ("100%", "Stack-matched submissions"),
    ]))

    s.append(Spacer(0, 10))
    s.append(Paragraph("Current Gap", H2))
    s.append(Paragraph(
        "Today the platform has no file completeness engine, no document OCR, no defect scoring, and no submission package generator. The operator assembles the lender's required document stack manually (often from a checklist that is months out of date), emails the package to the lender, and waits for the lender's underwriter to identify the missing or inconsistent items. The first-pass clean rate is unmeasured but, based on operator feedback, likely below 50%. Defects are caught late — by the lender's underwriter, after the file has consumed underwriter time on both sides — which means each defect costs the operator credibility and the lender patience. There is no system that flags inconsistencies across documents before submission (rent roll shows $2,300/month, lease shows $2,150/month, 1007 shows $2,400/month — three documents, three numbers, no reconciliation).",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Required Upgrades", H2))

    s.append(Paragraph("1. Pre-Submission Checklist Engine", H3))
    s.append(Paragraph(
        "Every lender's required document stack is encoded as a structured checklist in the lender guideline JSON. The stack varies by lender and by file shape — Griffin at 80% LTV requires a different stack than Kiavi at 70% LTV, and a cash-out refinance requires a different stack than a purchase. The pre-submission checklist engine takes a file shape and a target lender and returns the exact stack required: 1003 (with which sections), 1007 (with which comparables), 1008, rent roll (with which fields), lease (with which exhibits), title commitment (with which exceptions cleared), appraisal (with which approaches required), HOI declarations page, flood cert (if applicable), entity documents (operating agreement, EIN, articles, certificate of good standing), and compliance attestations. The operator cannot submit the file until every checkbox is green.",
        BODY))

    s.append(Paragraph("2. Document OCR and Cross-Validation", H3))
    s.append(Paragraph(
        "Every uploaded document is OCR'd and the key fields are extracted into a structured file schema. The cross-validation engine then checks for consistency across documents: does the rent on the rent roll match the rent on the lease (within $25)? Does the property address on the title commitment match the address on the appraisal (exact match)? Does the borrower name on the 1003 match the name on the operating agreement (exact match, with entity suffix handling)? Does the loan amount on the 1003 match the loan amount on the lender's application (exact match)? Every inconsistency is flagged with a severity (critical / major / minor) and an operator action (reconcile / document explanation / re-pull). The engine catches 80% of defects before submission.",
        BODY))

    s.append(Paragraph("3. Defect Scoring (File Heat Score)", H3))
    s.append(Paragraph(
        "Every file gets a heat score from 0 to 100, computed as a weighted sum of: completeness (40% — every required document present), consistency (30% — cross-document reconciliation clean), freshness (15% — every document within its validity window), and compliance (15% — every attestation signed, every disclosure delivered). A score above 85 is green (submit); 70-85 is amber (review with senior operator before submit); below 70 is red (do not submit — return to borrower for rework). The heat score is shown to the operator before submission, and the historical heat score is tracked per operator (an operator whose average heat score is 75 needs training; an operator whose average is 92 is a mentor).",
        BODY))

    s.append(Paragraph("4. Submission Package Generator", H3))
    s.append(Paragraph(
        "Once the heat score is green, the submission package generator produces the package in the exact format the target lender expects — bookmarks named to the lender's convention, files in the lender's preferred order, naming convention enforced, PDFs merged or separated as the lender requires, and a cover sheet with the file summary and lender-specific submission routing. The package is uploaded to the lender's portal (or emailed to the lender's submission address) directly from the platform, with a delivery confirmation logged. The generator eliminates the 30-60 minutes of manual packaging that currently precedes every submission.",
        BODY))

    s.append(Paragraph("5. Reconciliation Engine (Title vs Appraisal vs Survey)", H3))
    s.append(Paragraph(
        "The reconciliation engine specifically catches the high-cost mismatches that cause closing delays: title exception that the appraisal did not flag (encroachment, easement), survey discrepancy with the legal description on title, appraisal value that does not support the loan amount (LTV recompute), property condition on appraisal that contradicts the inspection report. These mismatches are the principal cause of closing-table surprises, and catching them pre-submission reduces closing delays by an estimated 40%. The engine produces a reconciliation report that goes into the file as an internal document, not as part of the lender submission.",
        BODY))

    s.append(Paragraph("6. Compliance Attestations", H3))
    s.append(Paragraph(
        "Every file carries a compliance attestation checklist: ECOA / Reg B notice delivered, fair-lending disclosure delivered, state-specific disclosure delivered (e.g., Texas 12-day letter, Minnesota private mortgage banker disclosure), NMLS identifier on every communication, borrower's right to receive appraisal copy delivered. The checklist is jurisdiction-aware (the compliance requirements differ by state and by property type) and lender-aware (some lenders require additional attestations). Attestations are signed electronically and logged with a tamper-evident timestamp. The compliance overlay exists to make every file defensible in the event of a borrower complaint or a regulatory audit.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Defect Taxonomy", H2))
    s.append(std_table(
        headers=["Severity", "Defect Class", "Example", "Cost if Caught Late"],
        rows=[
            ["Critical", "Identity mismatch",       "Borrower name on 1003 vs operating agreement", "Closing delay 5-10 days"],
            ["Critical", "Title defect",            "Unreleased lien on title commitment",          "Closing delay 7-21 days"],
            ["Critical", "Value shortfall",         "Appraisal comes in $15K under contract",       "Re-trade or collapse"],
            ["Major",    "Rent inconsistency",      "Rent roll $2,300 vs lease $2,150 (DSCR impact)","Re-underwrite, 3-5 day delay"],
            ["Major",    "Missing entity doc",      "Certificate of good standing not in file",    "1-3 day delay"],
            ["Major",    "Insurance coverage gap",  "HOI dwelling limit below loan amount",        "2-5 day delay"],
            ["Minor",    "Stale document",          "Bank statements >60 days old",                "1-2 day delay"],
            ["Minor",    "Missing signature",       "Borrower unsigned on page 4 of 1003",         "1 day delay"],
            ["Minor",    "Wrong format",            "Lender wants PDF, file submitted as JPEG",    "Same-day rework"],
        ],
        col_weights=[0.10, 0.22, 0.36, 0.32],
        header_align=['C', 'L', 'L', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("New Code Modules", H2))
    s.append(std_table(
        headers=["Module", "Purpose", "Est. LoC"],
        rows=[
            ["fileCompletenessEngine.ts",  "Per-lender stack checklist + green-light gate", "~1,200"],
            ["documentOcr.ts",             "OCR pipeline (Tesseract / cloud OCR), field extraction", "~1,800"],
            ["documentReconciler.ts",      "Cross-document consistency check, severity classifier", "~960"],
            ["defectScorer.ts",            "Heat score computation, per-operator tracking", "~430"],
            ["submissionPackGenerator.ts", "Per-lender format compliance + upload / email", "~1,100"],
            ["titleAppraisalReconciler.ts","Title / appraisal / survey reconciliation",    "~680"],
            ["complianceAttestations.ts",  "Jurisdiction-aware attestation checklist + e-sign","~840"],
            ["lenderStackProfiles.ts",     "Structured per-lender stack JSON (25+ entries)","~1,400"],
        ],
        col_weights=[0.28, 0.60, 0.12],
        header_align=['L', 'L', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Key Performance Indicators", H2))
    s.append(std_table(
        headers=["KPI", "Baseline", "90-day", "365-day"],
        rows=[
            ["First-pass clean rate",            "~50%",  "75%",    ">90%"],
            ["Defect rate per file (weighted)",  "unmeasured", "5%", "<2%"],
            ["Median turn time (submission to clear)", "30-45 days", "25 days", "18-21 days"],
            ["Files requiring lender rework",    "~50%",  "25%",    "<10%"],
            ["Critical defects caught pre-submission", "0%", "60%", ">90%"],
            ["Average file heat score",          "n/a",   "78",     ">88"],
        ],
        col_weights=[0.42, 0.19, 0.19, 0.20],
        header_align=['L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Risks and Mitigations", H2))
    s.append(Paragraph(
        "The principal risk is OCR accuracy. OCR is reliable on clean scanned PDFs but degrades on photographs, fax-quality scans, and documents with handwriting. Mitigation: the OCR pipeline uses confidence scoring on every extracted field, and low-confidence extractions are routed to manual verification; the operator never sees a 'clean' heat score that is actually based on an OCR error. A secondary risk is checklist drift — lender stack requirements change over time, and a stale checklist produces confident wrong submissions. Mitigation: the checklist JSON carries a verification date and is updated on the same weekly cadence as the lender guideline diff engine; a lender whose checklist has not been verified in 90 days produces a warning in the completeness engine. A tertiary risk is over-engineering — the completeness engine could become so strict that it slows the operator down without materially improving quality. Mitigation: the engine has an operator override path with audit logging, and override frequency is reviewed monthly; overrides above 10% on a particular checklist item trigger a checklist review (the checklist is probably wrong, not the operator).",
        BODY))

    s.append(PageBreak())
    return s
