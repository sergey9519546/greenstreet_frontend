---
type: research
status: drafted
confidence: 3
title: program.md — Research Direction
summary: Push the DSCR engine to the highest defensible level. The metric is the number of
entities:
  - concept/arm
  - concept/dscr
  - data/cotality
  - topic/str
tags:
  - topic/default-rate
  - topic/insurance
  - topic/portfolio
  - topic/tax
  - topic/tournament
source: autoresearch/program.md
vaulted_at: 2026-06-20
---
# program.md — Research Direction

## Goal
Push the DSCR engine to the highest defensible level. The metric is the number of
adversarial attacks the engine correctly defends against (out of 10).

## Source
The 10 attacks come from the Round 27 Algorithm Innovation Tournament:

1. ARM reset shock — 7/6 ARM at 7% resets to 9% in year 7
2. Stationary correlation in MC — 2008-style asymmetric lower-tail
3. Origination DSCR vs life-of-loan DSCR — point estimate blindness
4. Borrower-stated rent — Cotality 1/44 fraud signal
5. Independent deal evaluation — 80% NY/NJ contagion cluster
6. Insurance escalation step function — hurricane 2x overnight
7. Property tax reassessment — 2-5x in year 1 post-acquisition
8. Prepayment convexity — American call option
9. No fraud detection layer — borrower-stated inputs trusted
10. Deterministic vs process — point vs distributional

## Ideas to try (in priority order)

### Quick wins (1-2 lines each)
- **Attack 3 (life-of-loan)**: Already defended by `lifetime` dim. Add explicit doc.
- **Attack 10 (process)**: Already defended by 5-dim output. Add explicit doc.

### Defenses via parameter additions
- **Attack 1 (ARM reset)**: Add `arm_reset_month`, `arm_margin`, `arm_cap` to Deal.
  Extend DSCR projection to apply reset at month N. Detect collapse.
- **Attack 4 (fraud signal)**: Add `rent_source` to Deal ('borrower_stated' | 'lease' | '1007').
  Apply additional haircut (40%) when source is borrower_stated.
- **Attack 6 (insurance step)**: Add `is_coastal` to Deal. Coastal properties get
  additional insurance step-function overlay (jump at hurricane month).

### Defenses via output additions
- **Attack 2 (correlation)**: Add a `correlation_factor` to output (default 1.0, higher
  in contagion clusters).
- **Attack 5 (portfolio)**: Add `contagion_score` to output based on hardcoded cluster
  indicators (NY/NJ/Houston).
- **Attack 7 (tax reassessment)**: Add `tax_projection` output showing year-1 risk.
- **Attack 8 (prepayment)**: Add `prepayment_risk` to output based on rate path.
- **Attack 9 (fraud detection)**: Add `rent_to_market_ratio` warning output.

## Approach
1. Run baseline (current distributional_dscr.py) — expect ~2/10 defended.
2. For each iteration, add ONE defense mechanism.
3. Re-run eval, keep if metric improved.
4. Stop when all 10 defended OR no more ideas.

## Constraints
- Only modify distributional_dscr.py
- Each iteration = one atomic change
- Don't break the existing 16 tests
