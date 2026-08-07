"""Chapters 1-2 content for DSCR GODMODE ULTRAPLAN."""

from build_body import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem,
    BODY, BODY_LEFT, BULLET, H2, H3, CALLOUT_TITLE, CALLOUT_BODY, SMALL, QUOTE,
    callout_box, metric_strip, std_table, bullets, hr, make_heading, chapter_opener,
    ACCENT, ACCENT_2, HEADER_FILL, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED,
    SEM_SUCCESS, SEM_WARNING, SEM_ERROR, SEM_INFO,
    SANS_BOLD, SANS_FONT, BODY_BOLD, BODY_ITALIC, MONO_FONT,
)


def chapter_1():
    """Chapter 1 — Executive Summary: The Six-Function Doctrine."""
    s = chapter_opener(1, "Executive Summary: The Six-Function Doctrine",
        "The DSCR lender that survives will not be the one with the flashiest ads. It will be the one with the best borrower filter, the best lender/investor relationships, the cleanest files, and the clearest niche.")

    s.append(Paragraph(
        "This document is the operating doctrine for transforming the DSCR Intelligence Platform from a capable underwriting tool into a category-defining lender intelligence system. The thesis is simple: the residential investment real estate finance market is undergoing a structural reset as of mid-2026, with interest rates holding in the 6.50% to 8.25% band for DSCR product, capital partners tightening guideline matrices, and regulatory scrutiny on prepayment penalties and STR-backed income reaching an all-time high. In this environment, the operators who win are not the ones with the largest marketing budgets; they are the ones who can, within ten minutes of receiving a file, tell the borrower the truth about whether the loan is fundable, name the lender who will fund it, and produce a clean submission that closes on the first pass.",
        BODY))

    s.append(Paragraph(
        "The platform's purpose is to make that ten-minute verdict mechanically reproducible. It does so by separating the lending question from the survival question — Track A asks whether the loan meets a lender or capital partner's qualification matrix; Track B asks whether the investor should do the deal at all once real-world losses, shocks, and liquidity risk are accounted for. The two tracks never mix. They are reported side-by-side so the operator, the borrower, and the capital partner each see the same truth from their own vantage point. This dual-track discipline is what separates a credible DSCR shop from a broker that quotes rate sheets and prays.",
        BODY))

    s.append(Paragraph(
        "Beyond the dual-track core, the platform must master six functions to reach elite operating status. Each function has an elite standard — a measurable performance bar that, when met, places the operator in the top decile of DSCR originators. The Six-Function Doctrine is the organizing principle of this Ultraplan: every upgrade, every code module, every operational change must trace back to one of the six functions, and any capability that does not serve at least one of them is a distraction to be deprioritized.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("The Six-Function Doctrine at a Glance", H2))

    s.append(std_table(
        headers=["#", "Function", "Elite Standard", "Platform Module"],
        rows=[
            ["01", "Scenario Accuracy", "GO / NO-GO verdict with confidence score in under 10 minutes", "engine.ts + preflightGate.ts + rentCompAggregator.ts"],
            ["02", "Guideline Intelligence", "25+ verified lenders with auto-fit scoring and two-quote rule", "lenders.ts + lenderGuidelines.ts + fitScorer.ts"],
            ["03", "Borrower Trust", "Every quote regulator-ready, backed by full constraint disclosure", "quoteExplainer.ts + pdfQuotePack.ts"],
            ["04", "Capital Partner Trust", "Zero-defect file standard, first-pass clean rate above 90%", "fileCompletenessEngine.ts + defectScorer.ts"],
            ["05", "Distribution", "60%+ of revenue from repeat referral channels, not random leads", "referralPortal.ts + channelAttribution.ts"],
            ["06", "Risk Discipline", "Hard decline gates + adverse-action compliance, false-decline below 5%", "declineGate.ts + adverseActionEngine.ts"],
        ],
        col_weights=[0.06, 0.20, 0.45, 0.29],
        header_align=['C', 'L', 'L', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("Why Doctrine, Not Features", H2))

    s.append(Paragraph(
        "A common failure mode in DSCR shops is to chase feature breadth — more lenders, more calculators, more dashboards — without ever raising the operator's decision quality. The result is a tool that produces more quotes but not more closings, because the underlying judgment is unchanged. The Six-Function Doctrine inverts this: each function is defined by an external outcome (a clean closing, a declined bad file, a repeat referral), not by an internal feature count. The platform's job is to make the operator's judgment mechanically reproducible across scenarios, lenders, and borrowers, so that the shop's hit rate, turn time, and unit economics improve quarter over quarter regardless of who is on the desk.",
        BODY))

    s.append(Paragraph(
        "This doctrinal framing has three consequences for how the Ultraplan is structured. First, every chapter that follows ties a specific function to a measurable standard, a set of upgrades, a code module inventory, and a KPI; chapters that do not advance at least one function are out of scope. Second, the implementation roadmap in Chapter 10 sequences the work so that foundational correctness (Track A/B engine, payment factor audit, golden test suite) precedes expansion (lender matrix to 25+, distribution portal) — building on a broken core produces more brokenness, not more capability. Third, the success metrics in Chapter 11 are leading indicators (time-to-verdict, first-pass clean rate, false-decline rate) rather than trailing revenue metrics, because leading indicators tell the operator whether the doctrine is being lived before the revenue confirms it.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(callout_box(
        "The Iron Rule of GODMODE",
        "Every feature request, lender addition, UI change, or operational modification must be traceable to exactly one of the Six Functions. If a change serves no function, it is rejected. If a change serves two functions, it is reframed as a cross-cutting capability and tracked in Chapter 9. Doctrine is what prevents the platform from becoming a feature graveyard.",
        color=ACCENT, bg=CARD_BG,
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("The Three Audiences of Every Quote", H2))

    s.append(Paragraph(
        "A DSCR quote is read by three audiences with different decision criteria, and the platform must speak legibly to all three simultaneously. The borrower cares whether the deal closes and at what cost of capital; they will judge the quote by its rate, fees, and whether the constraints feel fair and explained. The capital partner — a lender's underwriter, an investor's asset manager, or a credit committee — cares whether the file is clean, complete, and defensible; they will judge the quote by its defect rate, documentation stack, and audit trail. The operator (you) cares whether the ten minutes spent produced a verdict that holds up through closing; you will judge the quote by whether it moved the borrower forward without creating downstream liability. A quote that satisfies only one audience is a failure.",
        BODY))

    s.append(Paragraph(
        "This three-audience model is why Track A and Track B are reported side-by-side and never mixed. Track A speaks to the capital partner's qualification matrix (gross rent divided by PITIA, no vacancy leakage). Track B speaks to the borrower's survival probability (real losses, shocks, liquidity). The operator's role is to translate between the two — to tell the borrower 'yes, this loan qualifies at this lender, but here is what your real cash-on-cash return looks like once vacancy, management, and repair reserves are applied.' That translation is the core value the operator adds; the platform exists to make it mechanically reproducible.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Reading This Document", H2))

    s.append(Paragraph(
        "Chapter 2 is a candid diagnostic of where the platform stands today against each of the six functions, including the top five capability gaps that block GODMODE status. Chapters 3 through 8 are the function-by-function mastery plans — one chapter per function — each with the same internal structure: elite standard, current gap, required upgrades, new code modules, KPIs, and risks. Chapter 9 covers cross-cutting capabilities (provenance pipeline, regulatory engine, command-center UI, infrastructure) that span multiple functions. Chapter 10 is the 365-day phased roadmap with deliverables, exit criteria, and a risk register. Chapter 11 is the KPI framework. Chapter 12 is the appendix — lender registry, state PPP matrix, data source catalog, and code module inventory.",
        BODY))

    s.append(Paragraph(
        "The document is dense by design. It is intended to be read once cover-to-cover by the operator desk, then used as a reference document during execution. The chapter openers and callout boxes are designed to be scannable in under a minute each, so a reader who only has ten minutes can extract the doctrine, the diagnostic, and the roadmap headline without reading every paragraph.",
        BODY))

    s.append(PageBreak := __import__('reportlab').platypus.PageBreak())
    return s


def chapter_2():
    """Chapter 2 — Current State Diagnostic."""
    s = chapter_opener(2, "Current State Diagnostic",
        "You cannot fix what you have not measured. This chapter is the honest scorecard of where the platform stands today against each of the Six Functions, including the five most consequential capability gaps.")

    s.append(Paragraph(
        "The current platform (v7.0 build state) has a defensible core but large capability gaps in the upper-function layers. The Track A / Track B engine, the seven verified lenders, the provenance tag system, and the state PPP scaffolding together constitute a credible underwriting tool — roughly a 2.6 out of 5 average across the six functions. The platform is not yet a category-defining intelligence system; it is a competent calculator with the right architectural bones. The purpose of this diagnostic is to name, without euphemism, what works, what is broken, and what is missing entirely, so that the upgrade roadmap can target the highest-leverage gaps first.",
        BODY))

    s.append(Paragraph(
        "The diagnostic was conducted by scoring each function on a five-point maturity scale (1 = absent, 2 = scaffolded, 3 = functional, 4 = hardened, 5 = elite), then identifying the specific capabilities that would have to be added or fixed to move each function up by one full maturity point. The scores below are calibrated against external benchmarks — what a top-decile DSCR originator can actually do today, not what a vendor marketing page claims — and they reflect the platform's state as of the date on the cover.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("Maturity Matrix — Current vs Target State", H2))

    s.append(std_table(
        headers=["Function", "Current Score", "Target (12mo)", "Critical Gap"],
        rows=[
            ["01 Scenario Accuracy",      "2.5 / 5", "4.5 / 5", "No pre-flight gate; rent comps manual; no Monte Carlo overlay"],
            ["02 Guideline Intelligence", "2.0 / 5", "4.5 / 5", "Only 7 verified lenders; no guideline diff engine; no fit scoring"],
            ["03 Borrower Trust",         "2.5 / 5", "4.5 / 5", "No 'why this rate' explainer; no PDF quote packet with provenance"],
            ["04 Capital Partner Trust",  "1.5 / 5", "4.5 / 5", "No file completeness engine; no defect scoring; no reconciliation"],
            ["05 Distribution",           "1.0 / 5", "4.0 / 5", "No referral portal; no channel attribution; no investor CRM"],
            ["06 Risk Discipline",        "2.0 / 5", "4.5 / 5", "No auto-decline gates; no adverse-action engine; no pattern learning"],
            ["AVERAGE",                   "1.92 / 5", "4.42 / 5", "—"],
        ],
        col_weights=[0.27, 0.16, 0.17, 0.40],
        header_align=['L', 'C', 'C', 'L'],
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("What Works Today (Defend This)", H2))

    s.append(Paragraph(
        "The Track A / Track B engine is the platform's strongest asset. Track A correctly applies the lender-qualification formula — gross rent divided by PITIA, with no vacancy leakage — and correctly solves for the deal-break rate (the interest rate at which Track A DSCR equals the lender's minimum). Track B correctly applies real-world losses, shocks, and liquidity risk to produce a survival verdict. The two tracks are reported separately, which is the discipline most DSCR shops fail to maintain. The payment factor audit (8.25% maps to 0.0075127, not 0.007568; 7.00% maps to 0.006653) is correct, and the golden test suite locks these values in place so future refactors cannot silently break them.",
        BODY))

    s.append(Paragraph(
        "The seven verified lenders — Griffin at 75-85% LTV, Defy at 80%, Easy Street at 82%, Lima One at 76%, New Silver at 72%, Kiavi at 70%, and Deephaven at 65% — represent a credible starting matrix that covers the LTV spectrum from 65% to 85%. Each lender entry carries provenance tags indicating whether the guideline data is primary-sourced (from the lender's own published matrix), secondary-sourced (from a correspondent or trade publication), or unverified. The state PPP scaffolding correctly identifies the high-stakes jurisdictions (Minnesota prohibited, New Jersey individual prohibited, Illinois restricted, Ohio and Pennsylvania with indexed thresholds, Mississippi with the 5-4-3-2-1 step-down, Washington with an ARM ban that requires secondary verification). These are the right bones; what is missing is the muscle and nervous system layered on top of them.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(Paragraph("What Is Broken (Fix This First)", H2))

    s.append(Paragraph(
        "Three things are broken and must be fixed before any new capability is added. First, the state PPP engine is scaffolded but not operational — the Washington ARM ban is tagged UNVERIFIED, and the Ohio and Pennsylvania indexed thresholds need annual recalibration logic that does not exist yet. Second, the lender matrix lacks any diff engine, meaning that when a lender updates a guideline (raises their DSCR minimum from 1.00 to 1.10, tightens their FICO floor from 660 to 680, or exits a state), the platform has no way to detect the change and flag affected pipeline files. Third, the reserve engine produces a single point estimate rather than the three-scenario output (base / stress / severe) that capital partners actually want to see, and it lacks the geographic coverage overlay that would let a multi-property portfolio reserve be modeled correctly.",
        BODY))

    s.append(Spacer(0, 6))
    s.append(callout_box(
        "The Five Most Consequential Capability Gaps",
        "<b>Gap 1 — Pre-flight gate.</b> The platform cannot, in under two minutes, tell the operator whether a file is even worth underwriting (STR legality, zoning, HOA, flood, insurability, title red flags). <b>Gap 2 — Lender matrix depth.</b> Seven lenders is half the minimum needed to enforce the two-quote rule across the full file-shape spectrum. <b>Gap 3 — File completeness engine.</b> No automated check that the document stack matches the target lender's exact requirements, so first-pass clean rate is unmeasured and likely below 50%. <b>Gap 4 — Distribution layer.</b> The platform has no intake portal for repeat investors, agents, or wholesalers, meaning every lead is a random lead. <b>Gap 5 — Decline pattern learning.</b> No system captures why files are declined and feeds that back into lender fit scoring, so the same bad file shapes recur.",
        color=SEM_ERROR, bg=CARD_BG,
    ))

    s.append(Spacer(0, 8))
    s.append(Paragraph("What Is Missing Entirely (Build This)", H2))

    s.append(Paragraph(
        "Beyond what is broken, five capabilities are absent entirely and must be built from scratch. The first is the rent comp aggregator — there is no automated pull from RentCast, Rentometer, AirDNA, or MLS 1007, so rent figures are operator-entered and unverified. The second is the document OCR and reconciliation engine — there is no system that reads a rent roll, a lease, and a 1007 market rent opinion and flags inconsistencies before submission. The third is the adverse action letter generator — without it, the platform cannot produce ECOA / Reg B compliant decline notices, which is a compliance exposure. The fourth is the channel attribution system — without it, the shop cannot measure which referral channels produce closed loans versus wasted underwriting hours. The fifth is the Monte Carlo survivorship overlay — without it, Track B produces a single point estimate of investor survival probability, which understates tail risk.",
        BODY))

    s.append(Paragraph(
        "These five missing capabilities, together with the three broken capabilities and the five consequential gaps named in the callout above, define the work. The 365-day roadmap in Chapter 10 sequences this work into four phases: Phase 1 fixes the broken core and adds the pre-flight gate; Phase 2 expands the lender matrix and builds the file completeness engine; Phase 3 stands up the distribution layer and the risk discipline automation; Phase 4 completes the regulatory engine, adds the Monte Carlo overlay, and reaches full GODMODE operating status. The roadmap is intentionally aggressive — twelve months is the window before the market resets again, and the platform must be elite before that reset, not after.",
        BODY))

    s.append(PageBreak := __import__('reportlab').platypus.PageBreak())
    return s
