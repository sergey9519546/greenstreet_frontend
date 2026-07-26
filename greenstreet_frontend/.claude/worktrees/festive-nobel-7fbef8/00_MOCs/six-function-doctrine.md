---
type: research
status: drafted
confidence: 3
title: The Six-Function Doctrine
summary: "> The lender that survives will not be the one with the flashiest ads, but the one with the cleanest operator doctrine."
entities:
  - concept/arm
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - topic/condo
  - topic/non-qm
  - topic/str
tags:
  - topic/compliance
  - topic/default-rate
  - topic/insurance
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - type/audit
source: six-function-doctrine.md
vaulted_at: 2026-06-20
---
# The Six-Function Doctrine
### Operating framework for a category-defining DSCR lender — v1, June 2026

> The lender that survives will not be the one with the flashiest ads, but the one with the cleanest operator doctrine.

---

## The core thesis

DSCR has stopped being a side product and become the default tool for scaling a rental portfolio — it now accounts for somewhere around 28–29% of all non-QM origination volume, second only to bank-statement loans. That growth is exactly why the niche is commoditizing. Every shop offers the same core product: qualify on the property's rent, not the borrower's W-2. Rate spreads over conventional have compressed to roughly 0.75–2.0%, down hard from the 2023 peak, because non-QM lenders are now competing directly with each other on price.

When the product is identical and the spread is thin, differentiation can't come from the product. It comes from the operator. Two forces make this true right now:

- **Overlays have quietly tightened underneath flat headline guidelines.** A lender can advertise "620 minimum" while actually declining anything under 660–680 once property type or LTV is factored in. The headline guideline and the real guideline have diverged — which means an operator who only knows the headline is no longer giving an accurate verdict, even when quoting honestly.
- **The scam layer has scaled with the category.** "Zero-down DSCR" and "100% LTV DSCR" offers are structurally impossible at any legitimate lender — the secondary market that buys this paper requires LTV caps, warehouse lines require borrower equity, and the regulatory frame around non-QM requires demonstrable skin in the game. Every one of these offers is a bait-and-switch, a different product wearing a DSCR label, or outright fraud. Their existence means a *correct, conservative* verdict is no longer table stakes — it's a trust signal, because investors have learned to be suspicious of anyone who isn't giving them one.

This is why the doctrine below treats DSCR lending as a **two-sided trust business** rather than a sales funnel. There's a borrower side that needs a fast, accurate verdict it can act on, and a capital side — wholesale lenders, investors, warehouse facilities — that needs files that perform without exceptions. Everything else is plumbing between those two trust relationships.

The six functions split cleanly along that line:

| Layer | Functions | Role |
|---|---|---|
| **Knowledge engine** | 01 Scenario Accuracy, 02 Guideline Intelligence | Produces the verdict |
| **Trust outputs** | 03 Borrower Trust, 04 Capital Partner Trust | Sells the verdict to each side of the desk |
| **Multiplier** | 05 Distribution | Scales volume — but only amplifies what's already true |
| **Gate** | 06 Risk Discipline | Has license to interrupt any of the above five |

---

## 01 — Scenario Accuracy: the 10-minute verdict

**What it is.** The ability to take a raw scenario — address, rent, purchase price or payoff, credit score, entity type — and return a real, defensible yes / no / maybe-with-conditions in about ten minutes, not three days.

**Why it's existential.** Real estate investors shop DSCR loans the way they shop contractors: three to five quotes in parallel, same day. The first *credible* verdict — not the first verdict, the first one that survives contact with underwriting — wins the file. A wrong or over-optimistic verdict that gets corrected at underwriting is the single fastest way to lose an investor's trust permanently, because they will tell every other investor in their network exactly what happened.

**What "accurate" actually requires in 2026:**

- **The DSCR number is not one number.** The calculation itself varies by lender — residential programs generally use gross rent, commercial-style programs use net operating income, and even within residential, lenders differ on whether they take the lower of lease-or-appraisal-rent or default straight to the appraiser's 1007 market rent figure. A real verdict states *which* methodology applies to *this* lender, not a generic ratio.
- **The below-market-lease trap.** If a tenant is paying under market with no rental market analysis or appraisal-backed comp behind it, the lender defaults to the lease amount and the DSCR collapses. This has to be caught in the first ten minutes — flagging it after the appraisal is back is too late and reads as incompetence, not bad luck.
- **Eligibility kills before pricing matters.** Owner-occupied, second-home, non-turnkey/mid-rehab, and vacant-land scenarios are instant disqualifiers regardless of how good the DSCR looks on paper. DSCR product is investment-only and turnkey-only by design; a fixer-upper needs bridge financing first, then a DSCR refinance once it's leased and cash-flowing.
- **The real credit floor, not the marketing floor.** Sub-640 is effectively dead across the market. Many programs that headline 620 are actually requiring 660–680 once property type and LTV are layered in.
- **Reserve math stated in dollars, not a vague "you'll need reserves."** Six months of PITIA is the market baseline; some programs ask for nine. A real verdict says the number.

**Failure modes.** Quoting off a rate sheet without overlay-checking. Leading with a best-case DSCR floor (0.75) without confirming whether this file's specific risk layering — cash-out purpose, condo, short-term rental — pushes the real floor higher. Not catching the lease-vs-market-rent gap until it's someone else's problem.

**Build target.** A pre-quote kill-list that runs before any verbal verdict is given, plus a confidence tier (not a binary yes/no) — green, yellow, red — so the borrower knows the difference between "this closes" and "this closes if the appraisal cooperates."

---

## 02 — Guideline Intelligence: lender fit

**What it is.** A living map of what each lender or investor on the panel will *actually* do with a given scenario — the real overlay stack, not the one-pager.

**Why it's existential.** A loan's odds of closing improve substantially when the lender has access to multiple funding sources — private equity, securitization, insurance capital — instead of one investor with one rigid guideline set. Guideline Intelligence is what lets an operator route a deal to the source that will actually take it, instead of forcing it through the wrong door and absorbing a late decline.

**What to actually track:**

- **Overlay vs. headline**, per property type and LTV band — the gap between what the rate sheet says and what underwriting actually approves.
- **Rent-determination methodology per lender** — lesser-of-lease-or-market, straight market rent, or a requirement for 12 months of documented landlord history before short-term rental income counts at all. STR treatment has tightened broadly: more lenders now require documented rental history or a long-term-comp market rent appraisal rather than accepting a projected Airbnb number at face value.
- **The LTV/DSCR tradeoff matrix** — 0.75 DSCR floors trade off against tighter LTV; 1.25+ DSCR is generally where the best rate and LTV combination lives across the market.
- **Reserve and prepayment variance** — six vs. nine months PITIA, and prepayment penalty structures running zero to five years.
- **Unit-count and loan-size caps** — which lender will go past a portfolio investor's cap with a given panel member, since this is where scaling investors get stuck.

**Failure mode.** Treating the panel as static. Guidelines move even in a stable-rate environment — overlays tighten, STR documentation requirements get stricter, spreads compress as competitors fight for share. Intelligence memorized once and never re-verified decays into Scenario Accuracy failures downstream.

**Build target.** This is the natural home for an automated layer: a guideline-diffing engine that flags when a panel member's overlay actually changes, rather than a static PDF library that's accurate the day it's built and wrong three months later. If the intelligence system you're building does nothing else well, this is the function where automation compounds fastest — every other function depends on this one staying current.

---

## 03 — Borrower Trust: credible quotes

**What it is.** The discipline of quoting only what will actually survive to the closing table.

**Why it's existential.** The category now has enough bad actors running structurally impossible offers that a conservative, accurate quote is itself a competitive signal. Lenders known for clear guidelines and few late-stage surprises earn a specific reputation: they rarely issue a denial at the last minute *if the file was set up correctly* — and that reputation is what drives repeat business and referrals in a borrower base that talks to itself constantly through investor networks and forums.

**Mechanics.** Quote against the real DSCR after the lease-vs-market check, the real reserve dollar figure, the real LTV given loan purpose (purchase is least restrictive; rate-and-term refinance tighter; cash-out tightest, typically capped at 70–75% LTV), and disclose any prepayment penalty structure up front rather than letting it surface at the closing disclosure.

**Failure mode.** "Teaser quoting" — leading with the best-case DSCR floor and lowest credit overlay to win the file, then retrading after appraisal or AUS comes back. This is the single most reputation-destroying move available, because the investor base this product serves is sophisticated, repeat, and networked.

**Build target.** Every quote should show its own sensitivity — what specifically would move the number — so the verdict reads as engineered, not guessed. "This closes at X if the appraisal supports market rent at $Y; if it comes in at $Z, here's what changes" is a fundamentally more trustworthy artifact than a single number.

---

## 04 — Capital Partner Trust: clean files

**What it is.** Discipline on the supply side — files that close exactly as represented, without triggering early payment defaults, guideline exceptions, or buybacks.

**Why it's existential.** This is the mirror of the "multiple money sources" advantage in Guideline Intelligence — it's the reason you *keep* that access. An operator known for clean files gets better pricing, faster turn times, and earlier access to a capital partner's more aggressive programs. An operator with a pattern of exceptions gets repriced, restricted, or cut off the panel entirely — which collapses Guideline Intelligence back down to a single rigid source, which degrades every verdict downstream.

**Mechanics.** Documentation discipline — a rental market analysis backing any above-lease rent claim, complete entity-vesting paperwork, sourced and seasoned reserves. No guideline arbitrage — never knowingly routing a borderline file to the panel member least likely to catch the issue. Early self-disclosure of any file weakness rather than hoping underwriting misses it.

**Failure mode.** Optimizing 01 and 03 — winning the file, keeping the borrower happy — at the direct expense of 04. The clearest current example: over-promising on short-term-rental income without the documented history a tightening market increasingly requires. That gets caught at underwriting, or worse, after closing.

**Build target.** A pre-submission QC pass mapped explicitly to each capital partner's known sensitivities, not a generic checklist. What kills a file at Lender A is often a non-issue at Lender B — the QC pass should know the difference, which is really just Guideline Intelligence applied in reverse, to your own file instead of someone else's scenario.

---

## 05 — Distribution: repeatable channels

**What it is.** The demand engine — referral partners (agents who serve investors, property managers, REI community organizers, generalist loan officers who don't touch DSCR), content, and repeat-borrower cultivation.

**Why it's existential.** Demand for DSCR is still accelerating as conventional lenders keep tightening overlays on investment properties and capping financed-property counts. But the niche is also getting crowded and heavily SEO'd, which means paid acquisition gets more expensive every quarter while word-of-mouth gets cheaper relative to it. Distribution only compounds once 01–04 are solid — referral partners and repeat investors are reputation-sensitive, and a single retraded quote or late decline can quietly end a channel relationship that took months to build.

**Mechanics.** Portfolio investors are the highest-value repeat channel by a wide margin — they transact every one to two quarters as they scale, unlike a one-time homebuyer who closes once and disappears. Built correctly, every closed loan under 01–04 becomes a referral source on its own. The second durable channel is professional referrers — agents and property managers who see an investor client before any lender does — and they are direct *consumers* of the trust built under 03 and 04, not a separate marketing problem to solve with ad spend.

**Failure mode.** Leading with paid acquisition in a category where word-of-mouth and repeat-borrower velocity compound faster, and where the "flashiest ad" attracts price-shoppers without attracting the trust-sensitive professional referrers who actually drive durable volume.

**Build target.** Instrument repeat-borrower rate and referral-source attribution before scaling paid top-of-funnel spend. The cheapest, highest-trust channel available is almost always the existing closed-loan base — measure it before you go buy a more expensive one.

---

## 06 — Risk Discipline: early decline

**What it is.** The willingness to say no, fast and explained, before a bad scenario consumes underwriting time, capital partner trust, or borrower goodwill.

**Why it's existential.** This is the function that protects the other five. Structurally impossible offers exist in this market because some operators say yes to anything to win the file in the moment — a credible operator's fast, well-explained decline is itself a trust signal under 03, it protects 04 by never letting a bad file reach a capital partner in the first place, and it protects 01/02 capacity by not burning verdict-time on a scenario that was never going to close.

**Mechanics.** A pre-flight kill-list — the same one feeding Scenario Accuracy — that triggers an immediate, explained decline rather than a slow-rolled "let me check": non-investment occupancy, non-turnkey condition, sub-640 credit with no compensating factors, a DSCR structurally below what reserves or LTV can offset, a below-market lease with no realistic path to a market-rent appraisal.

**Failure mode.** The "maybe" trap — keeping a dead file alive out of pipeline anxiety. This is worse than a fast no on every dimension: worse for the borrower (false hope, wasted weeks during which they could have gone elsewhere), worse for distribution (a referral partner watches their client get strung along and remembers it), and worse for the operator's own capacity.

**Build target.** Every decline should name the specific guideline or ratio that failed and, where possible, the smallest structural change that would flip the verdict — more reserves, a different entity structure, twelve months of lease history. A decline that teaches is a trust-building act. A decline that's just a rejection is a wasted opportunity to be the lender they come back to once the gap is fixed.

---

## Maturity scorecard

A quick self-audit. For each function, where does the operation actually sit today — not where you'd like it to sit.

| Function | Level 1 — Ad hoc | Level 2 — Documented | Level 3 — Systemized | Level 4 — Category-defining |
|---|---|---|---|---|
| 01 Scenario Accuracy | Verdict depends on who answers the phone | Written kill-list exists, inconsistently applied | Every scenario runs the same checklist before quoting | Verdicts carry a confidence tier and a stated sensitivity |
| 02 Guideline Intelligence | Memory and a stale PDF folder | Panel guidelines documented, reviewed irregularly | Guidelines re-verified on a fixed cadence | Overlay changes are detected and flagged automatically |
| 03 Borrower Trust | Quotes lead with best case | Quotes are accurate but not explained | Quotes show what would change the number | Borrowers report quotes "never move" by reputation |
| 04 Capital Partner Trust | Files pass or fail by luck | QC checklist exists, generic across lenders | QC is mapped per-lender to known sensitivities | Panel proactively offers better terms unprompted |
| 05 Distribution | One channel, usually paid | Two or more channels, untracked attribution | Repeat-borrower rate measured and improving | Referral channel outgrows paid without added spend |
| 06 Risk Discipline | Files die slowly in underwriting | Kill-list exists but gets overridden under pressure | Declines are fast and explained, no exceptions | Declines include the path back — borrowers return later |

---

## Build sequence

Given where the work already stands — a scenario and guideline intelligence engine with a corrected formula chain behind it — 01 and 02 are the furthest along by definition; that engine *is* the knowledge layer. The leverage from here is in two places:

1. **Encode 06 directly into 01's kill-list, not as a separate process.** Risk Discipline that lives outside the verdict engine will get overridden under pipeline pressure exactly when it matters most. It has to be structural, not a step someone can skip.
2. **Treat the verdict's *output format* as the trust product, not a side artifact.** The same engine that powers 01 and 02 should be generating the sensitivity-annotated quote that earns 03 and the lender-specific QC pass that earns 04. If the intelligence layer only produces a number, it's doing half the job — the other half is making that number legible and credible to two different audiences who don't trust each other's industry by default.

Distribution (05) is the one function that shouldn't be built first regardless of how tempting it is — it has nothing to amplify yet, and a channel built before 01–04 are solid just scales the rate at which trust gets burned.

---

## Market sources (June 2026)

- Easy Street Capital — [DSCR Loans Guide 2026](https://easystreetcap.com/dscr-loans-guide/)
- Sistar Mortgage — [DSCR Loans 2026: Rates, Rules and How to Qualify Fast](https://sistarmortgage.com/blog/dscr-loan-requirements-and-rates)
- 1st Nationwide Mortgage — [DSCR Loan Requirements 2026](https://www.1stnwm.com/blog/dscr-loan-requirements-2026-complete-guide/)
- Griffin Funding — [DSCR Loans 2026](https://griffinfunding.com/non-qm-mortgages/dscr-loans/)
- Stacking Capital — [The DSCR Investor Loan Guide 2026](https://www.stacking.capital/articles/dscr-investor-loan-real-estate-property-types-2026.html)
- Defy Mortgage — [DSCR Loans Explained: The Complete Guide 2026](https://defymortgage.com/learn/dscr-loans-the-complete-guide/)
- JVM Lending — [DSCR Loan Requirements: 7 Essential Rules 2026](https://www.jvmlending.com/blog/dscr-loan-requirements/)
- LendingOne — [A Guide To DSCR Loans For Real Estate Investors](https://lendingone.com/insight/a-guide-to-dscr-loans-for-real-estate-investors/)
- Zeitro — [DSCR Loan Requirements 2026](https://www.zeitro.com/blog/dscr-loan-requirements) and [Best DSCR Loan Lenders in 2026](https://www.zeitro.com/blog/best-dscr-lenders)
- DSCR Authority — [How DSCR Is Calculated](https://dscrauthority.com/learn/how-dscr-is-calculated/)
