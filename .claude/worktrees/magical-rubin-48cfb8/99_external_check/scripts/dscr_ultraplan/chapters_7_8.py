"""Chapters 7-8 content: Function 5 (Distribution) + Function 6 (Risk Discipline)."""

from build_body import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem,
    BODY, BODY_LEFT, BULLET, H2, H3, CALLOUT_TITLE, CALLOUT_BODY, SMALL, QUOTE,
    callout_box, metric_strip, std_table, bullets, hr, make_heading, chapter_opener,
    ACCENT, ACCENT_2, HEADER_FILL, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED,
    SEM_SUCCESS, SEM_WARNING, SEM_ERROR, SEM_INFO,
    SANS_BOLD, SANS_FONT, BODY_BOLD, BODY_ITALIC, MONO_FONT,
)
from reportlab.platypus import PageBreak


def chapter_7():
    """Chapter 7 — Function 5: Distribution (Repeatable Referral Channels)."""
    s = chapter_opener(7, "Function 5 — Distribution: Repeatable Referral Channels",
        "Elite standard: 60%+ of revenue from repeat referral channels, not random leads. The shop has named channels with economics, not a marketing budget with hopes.")

    s.append(Paragraph("Elite Standard", H2))
    s.append(Paragraph(
        "The elite DSCR shop does not buy leads; it cultivates channels. A channel is a repeatable source of files with a known unit economics: cost per submitted file, cost per closed file, average revenue per closed file, repeat interval (time from one closed loan to the next from the same source), and channel lifetime value. The elite shop tracks at least five active channels — agent referrals, repeat investors, wholesalers, CPA / financial advisor referrals, and loan officer syndicate — and no single channel accounts for more than 40% of revenue (concentration risk). Sixty percent of revenue comes from channels that produced a closed loan in the prior 12 months; the remaining 40% comes from new channel development, which is the pipeline that becomes next year's repeat channels.",
        BODY))

    s.append(Paragraph(
        "Channel discipline is what separates a sustainable DSCR shop from a broker that lives or dies by the next Zillow lead. The shop that has repeat channels can plan staffing, can negotiate better lender terms (because the lender knows the shop's pipeline is predictable), and can survive a marketing-budget cut or a Google Ads suspension. The shop without repeat channels is one algorithm change away from extinction. The platform's job is to make channel cultivation mechanical: every channel has a portal, every file is attributed to a channel at intake, and channel economics are computed automatically so the operator can see which channels are paying off and which are wasting time.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(metric_strip([
        (">60%", "Revenue from repeat channels"),
        ("<180d", "Repeat-deal interval"),
        ("5+", "Active channels"),
        ("<40%", "Single-channel concentration"),
    ]))

    s.append(Spacer(0, 10))
    s.append(Paragraph("Current Gap", H2))
    s.append(Paragraph(
        "Today the platform has no distribution layer. Files arrive by phone, email, and word-of-mouth; there is no intake portal, no channel attribution, and no channel economics tracking. The operator cannot answer the question 'which of my referral sources produced closed loans last quarter?' with any confidence, because the data was never captured. There is no investor CRM, so the shop does not know when a repeat investor's equity buildup crosses the threshold that triggers a cash-out refinance opportunity. There is no agent referral portal, so agents who could be sending repeat business have no easy way to submit files and track their referrals' progress. The shop is operating as a transaction processor, not as a channel cultivator.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Required Upgrades", H2))

    s.append(Paragraph("1. Agent Referral Portal", H3))
    s.append(Paragraph(
        "Real estate agents who work with investors are the highest-quality file source in DSCR lending — they have a relationship with the borrower, they understand the transaction, and they have a financial incentive (their buyer's offer is stronger with a DSCR pre-approval in hand). The agent referral portal lets an agent submit a file in under 5 minutes (property address, borrower name, transaction basics), receive an instant pre-flight verdict (red/amber/green), and track the file's progress through underwriting to closing. The portal also shows the agent their referral history — files submitted, files closed, commission earned (if the shop pays referral fees), and average turn time. Agents who refer repeatedly become 'preferred partners' with priority underwriting and a direct line to a senior operator.",
        BODY))

    s.append(Paragraph("2. Wholesaler Intake API", H3))
    s.append(Paragraph(
        "Wholesalers move volume but produce highly variable file quality — a single wholesaler may submit 30 files a month, of which 5 are fundable. The wholesaler intake API receives files programmatically (JSON payload with property and borrower basics), runs the pre-flight gate automatically, and returns a verdict to the wholesaler within 90 seconds. Files that fail the pre-flight gate are auto-rejected with a reason code, so the wholesaler does not waste the operator's time on unfundable files. Files that pass the pre-flight gate are queued for operator review, with the wholesaler's submission history visible (this wholesaler's pass rate over the last 90 days is 22%, so the operator knows what to expect). The API has rate limits per wholesaler and a quality floor — wholesalers whose closed-loan rate falls below 5% over a rolling 90-day window have their API access suspended.",
        BODY))

    s.append(Paragraph("3. Repeat Investor Dashboard", H3))
    s.append(Paragraph(
        "The repeat investor dashboard is the platform's principal retention tool. Every investor who has closed a loan with the shop is tracked in the investor CRM, which monitors their portfolio (property count, total debt, total equity, weighted-average DSCR, weighted-average rate) and triggers a 'next-deal opportunity' alert when: (a) equity buildup crosses 25% (cash-out refinance opportunity); (b) a balloon or rate-reset is approaching within 12 months (refinance opportunity); (c) the investor's portfolio DSCR has improved such that they now qualify for better terms (re-quote opportunity); (d) the investor has not closed a loan in 18 months but their portfolio suggests they are active (re-engagement opportunity). The alert goes to the operator, who calls the investor with a specific opportunity, not a generic check-in.",
        BODY))

    s.append(Paragraph("4. Loan Officer Syndicate (Correspondent Channels)", H3))
    s.append(Paragraph(
        "Loan officers at banks and credit unions who cannot do DSCR loans themselves (their institution does not offer the product) are a high-quality referral source — they have a relationship with the borrower and a financial incentive to refer (revenue share or co-marketing). The syndicate program enrolls these LOs as correspondents, gives them a co-branded portal (the LO submits the file under their name, the shop does the underwriting, the LO gets a revenue share on close), and tracks each correspondent's volume, quality, and revenue. Top correspondents graduate to 'senior correspondent' status with a higher revenue share and priority underwriting. The syndicate program is the principal channel for scaling beyond the founder's personal network.",
        BODY))

    s.append(Paragraph("5. CPA / Financial Advisor Referral Program", H3))
    s.append(Paragraph(
        "CPAs and financial advisors who serve high-income clients (physicians, attorneys, business owners) are an under-tapped referral source for DSCR loans — their clients often want to diversify into real estate but do not have a relationship with a DSCR lender. The referral program enrolls CPAs and advisors, gives them a one-page pitch deck (the tax-aligned DSCR pitch: 'your client can use DSCR financing to acquire rental property without W2 income qualification, and the interest is deductible against the rental income'), and tracks referrals through closing. The program is intentionally low-friction (CPAs do not want to learn underwriting) — the CPA's role is to make the introduction, and the shop takes it from there. Revenue share is paid only on closed loans.",
        BODY))

    s.append(Paragraph("6. Channel Attribution and Economics Tracking", H3))
    s.append(Paragraph(
        "Every file at intake is attributed to a channel (agent referral, repeat investor, wholesaler, correspondent, CPA, inbound). The attribution is recorded at the moment of intake, not retroactively. Channel economics are computed monthly: cost per submitted file (channel-specific costs — referral fees, marketing spend, API costs), cost per closed file, average revenue per closed file, gross margin per closed file, repeat interval (median time from one closed loan to the next from the same channel), and channel lifetime value. The economics are shown in a dashboard that lets the operator see at a glance which channels are profitable, which are break-even, and which are losing money. Channels that are losing money for two consecutive quarters are placed on probation; channels that are highly profitable get additional investment.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Channel Economics Framework", H2))
    s.append(std_table(
        headers=["Channel", "Cost per file", "Cost per close", "Avg revenue", "Repeat interval", "Target mix"],
        rows=[
            ["Agent referrals",          "$80",   "$800",   "$7,500",  "120 days", "25%"],
            ["Repeat investors",         "$50",   "$200",   "$8,200",  "180 days", "20%"],
            ["Wholesalers",              "$30",   "$450",   "$6,800",  "90 days",  "15%"],
            ["Correspondent LOs",        "$20",   "$150",   "$7,000",  "150 days", "15%"],
            ["CPA / advisors",           "$40",   "$300",   "$9,500",  "365 days", "10%"],
            ["Inbound (website / SEO)",  "$120",  "$1,800", "$7,200",  "270 days", "10%"],
            ["New channel development",  "n/a",   "n/a",    "n/a",     "n/a",      "5%"],
        ],
        col_weights=[0.22, 0.13, 0.14, 0.15, 0.18, 0.18],
        header_align=['L', 'C', 'C', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("New Code Modules", H2))
    s.append(std_table(
        headers=["Module", "Purpose", "Est. LoC"],
        rows=[
            ["agentPortal.ts",            "Agent-facing submission + status portal",       "~2,200"],
            ["wholesalerIntake.ts",       "JSON API + pre-flight auto-reject + quality floor", "~1,400"],
            ["investorCRM.ts",            "Investor portfolio tracking + next-deal triggers","~1,800"],
            ["correspondentSyndicate.ts", "LO enrollment, co-branded portal, revenue share","~1,600"],
            ["cpaAdvisorProgram.ts",      "CPA enrollment, pitch deck, referral tracking", "~720"],
            ["channelAttribution.ts",     "Channel tagging at intake + monthly economics", "~960"],
            ["channelDashboard.ts",       "Channel P&L dashboard for operator",            "~1,100"],
        ],
        col_weights=[0.28, 0.60, 0.12],
        header_align=['L', 'L', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Key Performance Indicators", H2))
    s.append(std_table(
        headers=["KPI", "Baseline", "90-day", "365-day"],
        rows=[
            ["% revenue from repeat channels",      "~25%",  "40%",    ">60%"],
            ["Active channels (>1 close/quarter)",  "2",     "4",      "5+"],
            ["Single-channel concentration",        "~70%",  "<55%",   "<40%"],
            ["Repeat-deal interval (median)",       "unmeasured", "240d", "<180d"],
            ["Cost per closed file (blended)",      "unmeasured","$750",  "<$500"],
            ["Channel-attributed files (vs random)","~30%",  "70%",    "100%"],
        ],
        col_weights=[0.42, 0.19, 0.19, 0.20],
        header_align=['L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Risks and Mitigations", H2))
    s.append(Paragraph(
        "The principal risk is channel concentration — a single agent or wholesaler who produces 40% of revenue has leverage that can be used to demand better terms or to defect to a competitor. Mitigation: the platform flags any channel that crosses 30% concentration and triggers active development of alternative channels; no channel is allowed to exceed 40% without explicit operator acknowledgement and a diversification plan. A secondary risk is referral fee compliance — RESPA prohibits kickbacks for referrals on owner-occupied loans, and while DSCR is generally investment-property (not RESPA-covered), some states have broader prohibitions and some structures (revenue share on a loan that the shop underwrites but does not fund) can be characterized as fee splitting. Mitigation: all referral arrangements are reviewed by counsel before implementation, revenue share is paid only on closed loans as a consulting fee (not a referral fee), and the program is structured to comply with the most restrictive state's law. A tertiary risk is wholesaler file quality — wholesalers often submit files with inflated rent comps or hidden title issues that pass the pre-flight gate but fail in underwriting. Mitigation: the wholesaler quality floor (5% closed-loan rate over 90 days) auto-suspends low-quality wholesalers, and the pre-flight gate is tuned to be more aggressive on wholesaler-submitted files (lower confidence threshold for rent comps, mandatory title pull before verdict).",
        BODY))

    s.append(PageBreak())
    return s


def chapter_8():
    """Chapter 8 — Function 6: Risk Discipline (Decline Bad Files Early)."""
    s = chapter_opener(8, "Function 6 — Risk Discipline: Decline Bad Files Early",
        "Elite standard: hard decline gates + soft warning gates, all logged, with ECOA-compliant adverse action. False-decline below 5%, and every declined file feeds the pattern library so the next bad file is caught faster.")

    s.append(Paragraph("Elite Standard", H2))
    s.append(Paragraph(
        "Risk discipline is the function most operators skip, because declining a file feels like leaving money on the table. The elite operator understands the opposite: every bad file that enters the pipeline consumes underwriter time, creates borrower ill-will when it inevitably declines late, exposes the shop to fair-lending scrutiny if the decline pattern is not defensible, and displaces a good file that could have been worked instead. The elite shop declines bad files at intake, not at underwriting — the pre-flight gate (Function 1) catches the obvious reds, and the decline gate (this function) catches the subtler ones. The false-decline rate (files declined that would have closed) is below 5%, and every decline produces a regulator-ready adverse action notice.",
        BODY))

    s.append(Paragraph(
        "Risk discipline is also a feedback loop. Every decline is tagged with a reason code, and the reason codes are mined quarterly for patterns: 'we declined 14 condotels last quarter, all for the same lender-ineligibility reason — we should add this to the pre-flight gate so future condotels are declined at intake, not after underwriting time is spent.' This pattern library is the platform's institutional memory — it is what makes the shop smarter over time, not just bigger. A shop without a pattern library makes the same mistakes repeatedly; a shop with one becomes more efficient every quarter.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(metric_strip([
        ("<5%", "False-decline rate"),
        (">4 hrs", "Time saved per declined file"),
        ("100%", "Adverse action compliance"),
        (">60%", "Declines at intake (not underwriting)"),
    ]))

    s.append(Spacer(0, 10))
    s.append(Paragraph("Current Gap", H2))
    s.append(Paragraph(
        "Today the platform has no automated decline gates — every decline is an operator judgment, applied late in the workflow after underwriting time has been spent. There is no adverse action letter generator, which means declines are communicated verbally or by email without the regulatory disclosure that ECOA and Reg B require for credit applications. There is no pattern library, so the same bad file shapes recur quarter after quarter. The false-decline rate is unmeasured but, based on operator feedback, likely significant — operators decline files that would have closed because they are uncertain about a lender's effective minimum (Function 2 should fix this, but only if the decline-pattern learner is built).",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Required Upgrades", H2))

    s.append(Paragraph("1. Auto-Decline Rules (Hard Gates)", H3))
    s.append(Paragraph(
        "The hard decline gates are non-negotiable auto-declines that fire at intake, before any underwriting time is spent. A file that hits any hard gate is declined with a reason code and an adverse action notice; the operator cannot override a hard gate without senior approval and a logged exception. The hard gates are: (a) PITIA greater than qualifying rent (Track A DSCR below 1.00 at any lender in the matrix, with no rent comp upside); (b) flood zone AE or VE without proof of HOI; (c) HOA STR ban when the file's income strategy is STR; (d) prohibited state (Minnesota for entity prepay); (e) prohibited state-lender combination (e.g., Washington ARM for lenders with ARM product); (f) LLC structure mismatch (e.g., borrower is a trust but lender does not fund trusts); (g) FICO below the lowest lender floor in the matrix; (h) loan amount below the lowest lender minimum or above the highest lender maximum; (i) property type not in any lender's matrix (e.g., commercial mixed-use above 4 units).",
        BODY))

    s.append(Paragraph("2. Risk Scorecard with Stoplight UI", H3))
    s.append(Paragraph(
        "Files that pass the hard gates receive a risk scorecard with a stoplight verdict: red (auto-decline — already caught by hard gates, but the scorecard is the second line of defense), amber (manual review — the file has a borderline dimension that requires operator judgment), green (proceed). The scorecard considers: DSCR margin (how close to the lender minimum), FICO margin (how close to the lender floor), LTV margin (how close to the lender cap), reserve adequacy (months of PITIA in reserves), property type complexity (SFR is green, condotel is amber, mixed-use is red without specialist review), borrower complexity (single-member LLC is green, multi-member LLC with foreign nationals is amber, trust is red without attorney review). The scorecard is shown to the operator before the file proceeds to underwriting; an amber file requires a senior operator sign-off before it can be submitted to a lender.",
        BODY))

    s.append(Paragraph("3. Adverse Action Letter Generator", H3))
    s.append(Paragraph(
        "Every decline produces an ECOA / Reg B compliant adverse action notice within 30 days of the application date. The notice includes: the specific reason(s) for the decline (from a standardized reason code library — not vague language like 'did not meet guidelines'), the borrower's right to know the reasons (already provided), the borrower's right to a copy of any appraisal or valuation used (if applicable), the borrower's right to dispute the accuracy of information in a consumer report (if a credit report was used), and the contact information for the credit reporting agency (if applicable). The notice is generated automatically from the decline reason code, sent to the borrower electronically (with paper mail as an option), and logged with a tamper-evident timestamp. The compliance overlay exists to make every decline defensible.",
        BODY))

    s.append(Paragraph("4. 'Why We Declined' Pattern Library", H3))
    s.append(Paragraph(
        "Every decline is tagged with: reason code, file shape at intake, file shape at decline (if different — what did underwriting discover that intake missed?), lender that declined (if applicable), lender's stated reason (if different from the platform's reason), operator who declined, and a free-text operator note. The pattern library is mined quarterly for: (a) recurring decline patterns that should be promoted to hard gates (e.g., 'we declined 14 files last quarter for condotel ineligibility — promote this to a hard gate'); (b) recurring intake misses (e.g., '12 files that passed the pre-flight gate were declined for HOA STR ban that the HOA database did not have — refresh the HOA database'); (c) lender decline patterns (Function 2's decline-pattern learner); (d) operator-specific patterns (an operator who declines 30% of files for DSCR may be using an outdated lender minimum).",
        BODY))

    s.append(Paragraph("5. Lender-Side Decline Pattern Learning", H3))
    s.append(Paragraph(
        "This is the same capability described in Chapter 4 (Function 2), but it is restated here because it is also a risk-discipline capability. Every lender decline is tagged with the lender's stated reason and recorded against the lender's effective guideline matrix. Over time, the platform learns each lender's effective minimums — the actual DSCR, FICO, and LTV that result in approval, not the published minimums. This learning feeds back into the fit scorer (Function 2) and the hard decline gates (this function) — a lender with an effective DSCR minimum of 1.10 (despite a published 1.00) means that files with DSCR 1.00-1.10 to that lender are auto-flagged amber and routed to alternative lenders. This is the platform's institutional memory.",
        BODY))

    s.append(Paragraph("6. ECOA / Reg B Compliance Overlay", H3))
    s.append(Paragraph(
        "Beyond the adverse action notice, the platform maintains a fair-lending audit trail on every decline: the file's protected-class characteristics are NOT recorded (which would itself be a fair-lending violation if used in the decision), but the decline reason, the operator who declined, and the comparable files (files with similar shape that were approved) are logged. Quarterly, the platform runs a comparative file analysis: are declines disproportionately concentrated in any geographic area, property type, or loan amount band? If a disparity is detected, the platform flags it for compliance review — the disparity may be legitimate (e.g., a particular market has more HOA STR bans), but it must be explainable. This overlay is the platform's defense against a fair-lending examination.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Decline Reason Code Library (Subset)", H2))
    s.append(std_table(
        headers=["Code", "Reason", "Gate Type", "Adverse Action Required"],
        rows=[
            ["DSCR-001", "Track A DSCR below 1.00 at all lenders",                "Hard",   "Yes"],
            ["FLOOD-001","Flood zone AE/VE without HOI",                            "Hard",   "Yes"],
            ["HOA-001",  "HOA prohibits STR (file income is STR)",                  "Hard",   "Yes"],
            ["STATE-001","State prohibits entity prepay (MN)",                      "Hard",   "Yes"],
            ["LENDER-001","State-lender combination prohibited (WA ARM)",           "Hard",   "Yes"],
            ["ENTITY-001","LLC structure not funded by any matrix lender",          "Hard",   "Yes"],
            ["FICO-001", "FICO below lowest matrix lender floor",                   "Hard",   "Yes (if credit pulled)"],
            ["LOAN-001", "Loan amount outside matrix lender range",                 "Hard",   "Yes"],
            ["PROPTYPE-001","Property type not in matrix (e.g., >4 units)",         "Hard",   "Yes"],
            ["DSCR-002", "DSCR within 0.05 of lender minimum (borderline)",        "Soft",   "Only if declined"],
            ["FICO-002", "FICO within 20 points of lender floor",                   "Soft",   "Only if declined"],
            ["LTV-001",  "LTV within 2% of lender cap",                             "Soft",   "Only if declined"],
            ["RESERVE-001","Reserves below 6 months PITIA",                         "Soft",   "Only if declined"],
            ["PROPTYPE-002","Condotel — specialist lender required",                "Soft",   "Only if declined"],
            ["ENTITY-002","Multi-member LLC — attorney review required",            "Soft",   "Only if declined"],
        ],
        col_weights=[0.14, 0.42, 0.14, 0.30],
        header_align=['C', 'L', 'C', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("New Code Modules", H2))
    s.append(std_table(
        headers=["Module", "Purpose", "Est. LoC"],
        rows=[
            ["declineGate.ts",            "Hard gate evaluation + reason code assignment", "~620"],
            ["riskScorecard.ts",          "Stoplight computation + senior sign-off routing","~540"],
            ["adverseActionEngine.ts",    "ECOA/Reg B notice generation + e-delivery",    "~880"],
            ["declinePatternLearner.ts",  "Quarterly pattern mining + hard-gate promotion","~720"],
            ["reasonCodeLibrary.ts",      "Standardized reason code definitions (~60 codes)","~440"],
            ["fairLendingAudit.ts",       "Comparative file analysis + disparity flagging", "~680"],
            ["exceptionOverride.ts",      "Senior approval workflow for hard-gate overrides","~360"],
        ],
        col_weights=[0.28, 0.60, 0.12],
        header_align=['L', 'L', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Key Performance Indicators", H2))
    s.append(std_table(
        headers=["KPI", "Baseline", "90-day", "365-day"],
        rows=[
            ["False-decline rate",                       "unmeasured", "12%",   "<5%"],
            ["% declines at intake (not underwriting)",  "~10%",       "35%",   ">60%"],
            ["Time saved per declined file",             "0 hrs",      "2 hrs", ">4 hrs"],
            ["Adverse action compliance (notices issued)","partial",  "90%",   "100%"],
            ["Pattern library promotions (per quarter)", "0",          "3",     "8+"],
            ["Fair-lending audit pass rate",             "n/a",        "100%",  "100%"],
        ],
        col_weights=[0.42, 0.19, 0.19, 0.20],
        header_align=['L', 'C', 'C', 'C'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Risks and Mitigations", H2))
    s.append(Paragraph(
        "The principal risk is false-decline — a hard gate that declines a file which would have closed. False-declines are the most expensive error the platform can make, because they cost revenue directly and damage borrower trust. Mitigation: every hard gate has an override path with senior approval and audit logging; the false-decline rate is tracked monthly and any gate that exceeds 2% false-decline is recalibrated; the gate's threshold is initially conservative (decline only when the file is clearly unfundable) and tightens over time as the pattern library confirms the gate's accuracy. A secondary risk is fair-lending exposure from the comparative file analysis itself — if the analysis reveals a disparity and the shop does not act on it, the analysis becomes evidence in a fair-lending claim. Mitigation: the analysis is conducted under attorney-client privilege where possible, and any detected disparity triggers a documented investigation and remediation plan. A tertiary risk is decline-pattern library overfitting — a pattern observed in a small sample (e.g., 5 declines) may not generalize. Mitigation: pattern library promotions require a minimum sample size (10 instances) and a documented rationale; promotions are reviewed quarterly and can be reversed if subsequent data contradicts the pattern.",
        BODY))

    s.append(PageBreak())
    return s
