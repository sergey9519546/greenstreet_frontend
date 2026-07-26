# RENT FRAUD DETECTION ALGORITHM — DSCR LENDING
## Exact Algorithms, Scoring Formulas & Implementation Specifications

**Document Classification:** APEX-Level Technical Specification  
**Date:** March 4, 2026  
**Version:** 1.0  
**Status:** Algorithm Design — Ready for Engineering Implementation  
**Cross-References:** INNOVATION_AI_ML_DSCR.md (§4), DSCR_UNDERWRITING_FORMULA_DEEP_DIVE.md, DSCR_STR_LTR_DATA_INTEGRATIONS.md

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Module A — Rent Comp Anomaly Detection](#2-module-a--rent-comp-anomaly-detection)
3. [Module B — STR Projection Validation](#3-module-b--str-projection-validation)
4. [Module C — Lease Document Verification](#4-module-c--lease-document-verification)
5. [Module D — Network Analysis for Fraud Rings](#5-module-d--network-analysis-for-fraud-rings)
6. [Composite Fraud Score (0–100)](#6-composite-fraud-score-0100)
7. [DSCR-Specific Fraud Pattern Library](#7-dscr-specific-fraud-pattern-library)
8. [Historical Fraud Data & Benchmarks](#8-historical-fraud-data--benchmarks)
9. [Platform Integration & Deal Flow](#9-platform-integration--deal-flow)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Design Philosophy

The fraud detection system operates as a **scoring pipeline** — not a binary gate. Every DSCR deal passes through four independent detection modules, each outputting a sub-score (0–25). The composite score (0–100) determines the disposition path. The system is designed to:

1. **Maximize true positive detection** of rent fraud (the most common DSCR fraud vector)
2. **Minimize false positives** on legitimate high-rent deals (luxury, recently renovated, STR-eligible)
3. **Provide explainable scores** — every alert must cite the specific anomaly that triggered it
4. **Run in real-time** — scoring must complete in <5 seconds for LTR deals, <30 seconds for STR deals (due to external API calls)

### 1.2 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DSCR DEAL INTAKE                              │
│  Property address, claimed rent, lease doc, STR projection,     │
│  borrower entities, appraiser ID, broker ID                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────────┐
          ▼            ▼                ▼
   ┌──────────┐ ┌──────────┐  ┌──────────────┐  ┌──────────┐
   │ MODULE A │ │ MODULE B │  │  MODULE C    │  │ MODULE D │
   │ Rent Comp│ │ STR Proj │  │  Lease Doc   │  │ Network  │
   │ Anomaly  │ │ Validate │  │  Verify      │  │ Analysis │
   │ (0-25)   │ │ (0-25)   │  │  (0-25)      │  │ (0-25)   │
   └────┬─────┘ └────┬─────┘  └──────┬───────┘  └────┬─────┘
        │            │               │                │
        ▼            ▼               ▼                ▼
   ┌──────────────────────────────────────────────────────────┐
   │              COMPOSITE FRAUD SCORE (0-100)               │
   │   = A + B + C + D  (with cross-module boost logic)       │
   └──────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐┌──────────┐┌──────────┐
        │ GREEN    ││ YELLOW   ││ RED      │
        │ 0-29     ││ 30-49    ││ 50-100   │
        │ Auto-    ││ Manual   ││ Escalate │
        │ proceed  ││ Review   ││ or Decl  │
        └──────────┘└──────────┘└──────────┘
```

### 1.3 Data Dependencies

| Data Source | Module(s) | Access Method | Latency |
|---|---|---|---|
| RentCast API | A | REST API | <2s |
| Rentometer API | A | REST API | <2s |
| AirDNA Rentalizer | B | REST API (Enterprise v2) | 5-15s |
| Airbnb/VRBO scrape | B | Headless browser / 3rd party | 10-30s |
| Appraisal data (1007/1025) | A, C | Document parsing | <1s (parsed) |
| Lease document | C | OCR + NLP pipeline | 3-10s |
| Entity database | D | Internal graph DB | <1s |
| Prior application history | D | Internal SQL/Graph | <1s |
| Utility verification | C | Third-party API | 5-15s |

---

## 2. MODULE A — RENT COMP ANOMALY DETECTION

### 2.1 Objective

Determine whether the claimed rent (from lease or appraisal) is statistically anomalous relative to comparable rental properties. This is the **primary defense against rent stuffing** — the most common DSCR fraud vector where a borrower claims rent well above market to inflate the DSCR ratio.

### 2.2 Comp Selection Algorithm

The number and quality of comps directly determines detection accuracy. Too few comps produces unreliable statistics; too many introduces non-comparable properties.

**Comp Selection Criteria:**

```python
def select_comps(subject_property, comp_pool, min_comps=10, max_comps=25):
    """
    Select comparable rentals using a weighted distance function.
    
    Criteria hierarchy (by weight in distance calculation):
    1. Geographic proximity: within 1.0 mile (urban) or 2.0 miles (suburban/rural)
       Weight: 0.35
    2. Unit count match: same bed/bath count ±0.5 (e.g., 3bd matches 3bd and 4bd)
       Weight: 0.25
    3. Square footage: within ±20% of subject
       Weight: 0.20
    4. Property type: SFR/Duplex/Triplex/Quad match exactly
       Weight: 0.10
    5. Property age: within ±20 years
       Weight: 0.05
    6. Condition: similar condition class (A/B/C/D)
       Weight: 0.05
    
    Returns: list of comps sorted by distance score (best first), 
             capped at max_comps
    """
    candidates = []
    for comp in comp_pool:
        distance = (
            0.35 * geo_distance_normalized(subject, comp) +
            0.25 * unit_count_distance(subject, comp) +
            0.20 * sqft_distance(subject, comp) +
            0.10 * type_distance(subject, comp) +
            0.05 * age_distance(subject, comp) +
            0.05 * condition_distance(subject, comp)
        )
        candidates.append((comp, distance))
    
    candidates.sort(key=lambda x: x[1])
    
    # Require minimum 10 comps for statistical validity
    # Cap at 25 to prevent dilution by weak comps
    selected = candidates[:max_comps]
    
    if len(selected) < min_comps:
        # Fallback: expand geographic radius by 50% and relax sqft to ±30%
        selected = expand_search_radius(subject, comp_pool, 
                                         geo_multiplier=1.5, 
                                         sqft_tolerance=0.30)
    
    return selected
```

**Why 10-25 comps?**
- **<5 comps**: Standard deviation unreliable (low statistical power); a single outlier comp can skew the entire result
- **5-9 comps**: Marginal — acceptable for small markets only, with widened confidence intervals
- **10-15 comps**: Optimal for most urban/suburban markets — enough for stable IQR and median
- **16-25 comps**: Good for dense markets; allows sub-segmentation by quality tier
- **>25 comps**: Risk of including non-comparable properties; diminishing returns on statistical precision

### 2.3 Anomaly Detection — Three Methods in Parallel

The system runs **three independent statistical methods** and takes the maximum anomaly signal. This prevents any single method's blind spot from missing fraud.

#### Method 1: Z-Score (Standard Score) — Best for Normal Distributions

```python
def z_score_anomaly(claimed_rent, comp_rents):
    """
    Calculate Z-score of claimed rent against comp distribution.
    
    Uses MEDIAN and MEDIAN ABSOLUTE DEVIATION (MAD) instead of 
    mean/std because rent distributions are typically right-skewed.
    Mean and standard deviation are inflated by luxury outliers,
    making them unreliable for fraud detection.
    
    Robust Z-score formula:
        Z = (claimed_rent - median) / (MAD * 1.4826)
    
    The 1.4826 constant makes MAD consistent with standard deviation
    for normally distributed data.
    """
    median_rent = np.median(comp_rents)
    mad = np.median(np.abs(comp_rents - median_rent))
    
    if mad == 0:
        # All comps are identical — use standard deviation as fallback
        std_rent = np.std(comp_rents, ddof=1)
        if std_rent == 0:
            # All comps are literally the same rent — no anomaly detectable
            return 0.0, "insufficient_variance"
        z = (claimed_rent - np.mean(comp_rents)) / std_rent
    else:
        z = (claimed_rent - median_rent) / (mad * 1.4826)
    
    return z, "robust_z_score"


def z_score_to_points(z):
    """
    Convert Z-score to fraud score points (0-25).
    
    Threshold calibration:
    - Z < 1.0:  Normal — no fraud signal
    - Z 1.0-1.5: Slightly above market — common for premium units
    - Z 1.5-2.0: Notably above market — yellow flag
    - Z 2.0-2.5: Significantly above market — orange flag
    - Z > 2.5:  Extremely above market — red flag, likely fraud
    
    These thresholds are intentionally more conservative than 
    academic outlier thresholds (which typically flag at 2.0+).
    In DSCR lending, we want to catch 1.5σ+ anomalies because 
    even moderate rent inflation can qualify a bad loan.
    """
    if z < 1.0:
        return 0
    elif z < 1.5:
        return min(5, int((z - 1.0) / 0.5 * 5))  # 0-5 points
    elif z < 2.0:
        return 5 + min(8, int((z - 1.5) / 0.5 * 8))  # 5-13 points
    elif z < 2.5:
        return 13 + min(7, int((z - 2.0) / 0.5 * 7))  # 13-20 points
    else:
        return min(25, 20 + min(5, int((z - 2.5) / 0.5 * 5)))  # 20-25 points
```

#### Method 2: IQR (Interquartile Range) — Best for Skewed Distributions

```python
def iqr_anomaly(claimed_rent, comp_rents):
    """
    IQR-based outlier detection. More robust than Z-score for 
    right-skewed rent distributions (common in luxury/urban markets).
    
    Standard IQR fences:
        Q1 = 25th percentile
        Q3 = 75th percentile
        IQR = Q3 - Q1
        Lower fence = Q1 - 1.5 * IQR
        Upper fence = Q3 + 1.5 * IQR
    
    For FRAUD DETECTION, we use a MODIFIED upper fence with 
    a multiplier of 1.5 (standard) instead of 3.0 (extreme).
    This is intentionally sensitive — we want to catch moderate 
    inflation, not just extreme outliers.
    
    Returns:
        distance_from_fence: how far above the upper fence (0 = at fence)
        iqr_multiple: claimed_rent expressed as multiple of IQR above Q3
    """
    q1 = np.percentile(comp_rents, 25)
    q3 = np.percentile(comp_rents, 75)
    iqr = q3 - q1
    
    upper_fence = q3 + 1.5 * iqr
    
    if claimed_rent <= upper_fence:
        # Within normal range
        if claimed_rent <= q3:
            return 0.0, 0.0  # Below 75th percentile — definitely normal
        else:
            # Between Q3 and upper fence — above median but not anomalous
            proximity = (claimed_rent - q3) / (1.5 * iqr)  # 0.0 to 1.0
            return 0.0, proximity
    else:
        # Above upper fence — anomalous
        distance_from_fence = claimed_rent - upper_fence
        iqr_multiple = (claimed_rent - q3) / iqr
        return distance_from_fence, iqr_multiple


def iqr_to_points(distance_from_fence, iqr_multiple, upper_fence, q3):
    """
    Convert IQR anomaly to fraud score points (0-25).
    
    Calibration:
    - Within Q1-Q3: 0 points (normal range)
    - Q3 to upper fence: 0-3 points (above median but not anomalous)
    - 1x IQR above Q3 (at upper fence): 5 points (mild flag)
    - 2x IQR above Q3: 12 points (moderate flag)
    - 3x IQR above Q3: 20 points (strong flag)
    - 4x+ IQR above Q3: 25 points (almost certainly fraud)
    """
    if iqr_multiple <= 1.0:
        return 0  # Within Q1-Q3
    elif iqr_multiple <= 1.5:
        return min(3, int((iqr_multiple - 1.0) / 0.5 * 3))
    elif iqr_multiple <= 2.0:
        return 3 + min(5, int((iqr_multiple - 1.5) / 0.5 * 5))
    elif iqr_multiple <= 3.0:
        return 8 + min(8, int((iqr_multiple - 2.0) / 1.0 * 8))
    elif iqr_multiple <= 4.0:
        return 16 + min(5, int((iqr_multiple - 3.0) / 1.0 * 5))
    else:
        return min(25, 21 + min(4, int((iqr_multiple - 4.0) * 2)))
```

#### Method 3: Mahalanobis Distance — Best for Multi-Dimensional Anomaly Detection

```python
def mahalanobis_anomaly(subject_features, comp_features_matrix):
    """
    Mahalanobis distance considers the CORRELATION between features.
    A $4,000 rent on a 3BR is anomalous; a $4,000 rent on a 5BR luxury 
    unit may be normal. Z-score and IQR only look at rent; Mahalanobis 
    looks at rent IN CONTEXT of property characteristics.
    
    Feature vector for each property:
        [rent/sqft, beds, baths, age, distance_to_subject, condition_score]
    
    Formula:
        D² = (x - μ)ᵀ Σ⁻¹ (x - μ)
    
    Where:
        x = subject feature vector
        μ = mean of comp feature vectors
        Σ = covariance matrix of comp feature vectors
    
    Returns:
        mahalanobis_distance: scalar distance value
        p_value: probability of observing this distance under chi-squared
    """
    mu = np.mean(comp_features_matrix, axis=0)
    sigma = np.cov(comp_features_matrix, rowvar=False)
    
    # Regularize covariance matrix to handle singularity
    # (occurs when features are highly correlated or n_features ≈ n_samples)
    sigma_reg = sigma + np.eye(sigma.shape[0]) * 1e-6
    
    diff = subject_features - mu
    sigma_inv = np.linalg.inv(sigma_reg)
    distance_sq = diff @ sigma_inv @ diff
    
    # Mahalanobis distance (take sqrt)
    distance = np.sqrt(distance_sq)
    
    # P-value from chi-squared distribution (df = number of features)
    from scipy.stats import chi2
    p_value = 1 - chi2.cdf(distance_sq, df=len(subject_features))
    
    return distance, p_value


def mahalanobis_to_points(distance, p_value):
    """
    Convert Mahalanobis distance to fraud score points (0-25).
    
    Calibration based on chi-squared p-value:
    - p > 0.10:  Normal (10%+ of comps would be this extreme)
    - p 0.05-0.10: Marginal (5-10% probability)
    - p 0.01-0.05: Unusual (1-5% probability)
    - p 0.001-0.01: Rare (0.1-1% probability) 
    - p < 0.001:  Extremely rare (<0.1% probability)
    """
    if p_value > 0.10:
        return 0
    elif p_value > 0.05:
        return min(5, int((0.10 - p_value) / 0.05 * 5))
    elif p_value > 0.01:
        return 5 + min(8, int((0.05 - p_value) / 0.04 * 8))
    elif p_value > 0.001:
        return 13 + min(7, int((0.01 - p_value) / 0.009 * 7))
    else:
        return min(25, 20 + min(5, int((0.001 - p_value) / 0.001 * 5)))
```

### 2.4 Module A Score Aggregation

```python
def module_a_score(claimed_rent, comp_rents, subject_features, comp_features_matrix):
    """
    Module A final score: MAX of three methods.
    
    Why MAX instead of average?
    - Different fraud techniques defeat different methods
    - Rent stuffing with cherry-picked comps defeats IQR (if comps are biased)
    - Rent stuffing on a large unit defeats Z-score (raw rent may not look anomalous)
    - Mahalanobis catches multi-dimensional anomalies the others miss
    - Taking MAX ensures the strongest signal prevails
    
    However, we apply a CONFIDENCE ADJUSTMENT based on comp count
    and comp quality to prevent false positives from thin data.
    """
    z, z_method = z_score_anomaly(claimed_rent, comp_rents)
    z_points = z_score_to_points(z)
    
    dist, iqr_mult = iqr_anomaly(claimed_rent, comp_rents)
    iqr_points = iqr_to_points(dist, iqr_mult, 0, 0)  # simplified call
    
    m_dist, m_pval = mahalanobis_anomaly(subject_features, comp_features_matrix)
    m_points = mahalanobis_to_points(m_dist, m_pval)
    
    # Raw score = maximum of three methods
    raw_score = max(z_points, iqr_points, m_points)
    
    # Confidence adjustment: reduce score if comp data is thin
    comp_count = len(comp_rents)
    if comp_count < 5:
        confidence_factor = 0.5   # Very thin data — cut score in half
    elif comp_count < 10:
        confidence_factor = 0.75  # Marginal data — reduce by 25%
    elif comp_count < 15:
        confidence_factor = 0.90  # Good data
    else:
        confidence_factor = 1.0   # Excellent data
    
    adjusted_score = raw_score * confidence_factor
    
    return {
        "score": round(min(25, adjusted_score), 1),
        "z_score": round(z, 2),
        "z_points": z_points,
        "iqr_multiple": round(iqr_mult, 2),
        "iqr_points": iqr_points,
        "mahalanobis_p_value": round(m_pval, 4),
        "mahalanobis_points": m_points,
        "comp_count": comp_count,
        "confidence_factor": confidence_factor,
        "median_comp_rent": round(np.median(comp_rents), 2),
        "claimed_vs_median_pct": round((claimed_rent / np.median(comp_rents) - 1) * 100, 1)
    }
```

### 2.5 Handling Markets with Wide Rent Ranges

Some markets have enormous rent variance (e.g., Manhattan, where a 2BR can rent for $3,000 or $12,000). Standard statistical methods over-flag in these markets.

**Solution: Stratified Comp Analysis**

```python
def stratified_analysis(claimed_rent, comp_rents, comp_quality_tiers):
    """
    In markets where IQR > 40% of median rent, stratify comps by 
    quality tier and compare within the SUBJECT'S tier only.
    
    Quality tiers based on rent/sqft quartiles:
    - Tier 1 (Luxury): > Q3 of rent/sqft
    - Tier 2 (Premium): Q2-Q3 of rent/sqft
    - Tier 3 (Standard): Q1-Q2 of rent/sqft
    - Tier 4 (Value): < Q1 of rent/sqft
    
    If claimed rent places subject in Tier 1, compare against Tier 1 
    comps only. A $5,000 rent on a luxury unit is normal; the same 
    rent on a standard unit is fraud.
    """
    median = np.median(comp_rents)
    iqr = np.percentile(comp_rents, 75) - np.percentile(comp_rents, 25)
    
    if iqr / median > 0.40:
        # Wide-range market — use stratified analysis
        subject_tier = determine_tier(claimed_rent, comp_quality_tiers)
        tier_comps = [c for c in comp_quality_tiers if c.tier == subject_tier]
        
        if len(tier_comps) >= 5:
            # Sufficient comps within tier — run anomaly detection on tier only
            return module_a_score(claimed_rent, tier_comps, ...)
        else:
            # Insufficient tier comps — flag for manual review
            return {"score": 12.5, "note": "insufficient_tier_comps_manual_review"}
    else:
        # Normal market — standard analysis
        return module_a_score(claimed_rent, comp_rents, ...)
```

### 2.6 Rent-to-Value Ratio Check (Supplementary Signal)

```python
def rent_to_value_check(monthly_rent, property_value):
    """
    Gross Rent Multiplier (GRM) check.
    
    GRM = Property Value / Annual Gross Rent
    
    Normal ranges (by market type):
    - Urban core: GRM 8-15 (higher property values relative to rent)
    - Suburban: GRM 10-18
    - Rural: GRM 6-12
    - Luxury: GRM 15-25+
    
    Flag if GRM < 6 (rent is suspiciously high relative to value)
    or if rent-to-value ratio > 2.0% monthly (24% annual gross yield)
    
    A 24%+ gross yield is extremely rare in legitimate markets and 
    strongly suggests rent inflation.
    """
    annual_rent = monthly_rent * 12
    grm = property_value / annual_rent
    monthly_yield_pct = (monthly_rent / property_value) * 100
    annual_gross_yield = monthly_yield_pct * 12
    
    score = 0
    flags = []
    
    if annual_gross_yield > 0.20:  # >20% annual yield
        score += 5
        flags.append("yield_above_20pct")
    if annual_gross_yield > 0.24:  # >24% annual yield  
        score += 8
        flags.append("yield_above_24pct")
    if annual_gross_yield > 0.30:  # >30% annual yield — almost impossible
        score += 12
        flags.append("yield_above_30pct_likely_fraud")
    
    if grm < 6:
        score += 5
        flags.append(f"grm_below_6 ({grm:.1f})")
    if grm < 4:
        score += 8
        flags.append(f"grm_below_4_extreme ({grm:.1f})")
    
    # This score is ADDED to Module A's main score (capped at 25)
    return {"supplemental_score": min(10, score), "flags": flags, "grm": grm, 
            "annual_yield": annual_gross_yield}
```

---

## 3. MODULE B — STR PROJECTION VALIDATION

### 3.1 Objective

Detect inflated Short-Term Rental (STR) income projections. STR income is the **highest-risk DSCR input** because projections are inherently speculative and can be easily manipulated by cherry-picking best-case scenarios.

### 3.2 AirDNA Accuracy Assessment

Based on industry analysis and available data:

| Metric | AirDNA Typical Overestimation | Source/Rationale |
|---|---|---|
| **Revenue** | +15% to +30% above actual | AirDNA uses market-wide averages that include professional hosts with optimized pricing; most individual hosts underperform |
| **Occupancy** | +5 to +15 percentage points | AirDNA counts listings with any booking activity; actual realized occupancy is lower due to cancellations and gaps |
| **ADR (Nightly Rate)** | +10% to +25% above actual | AirDNA averages across all dates; hosts discount for length-of-stay, last-minute bookings, and off-peak periods |
| **Revenue Upper Bound** | +25% to +50% above actual | The `revenue_upper` field in the API represents the 75th percentile — only 25% of hosts achieve this |

**Key finding**: The AirDNA `revenue` field overstates actual host income by approximately **20-25% on average**. This is precisely why DSCR lenders apply a 20-25% haircut (confirmed in DSCR_STR_LTR_DATA_INTEGRATIONS.md).

### 3.3 Validation Algorithm

```python
def validate_str_projection(subject_address, claimed_str_income, 
                            claimed_occupancy, claimed_adr,
                            airdna_data, platform_data=None):
    """
    Multi-layer STR projection validation.
    
    Returns a fraud score (0-25) based on divergence between 
    claimed STR income and independently validated projections.
    """
    
    # ─── Layer 1: AirDNA Benchmark Comparison ───
    airdna_revenue = airdna_data['future']['summary']['revenue']
    airdna_revenue_lower = airdna_data['future']['summary']['revenue_lower']
    airdna_occupancy = airdna_data['future']['summary']['occupancy']
    airdna_adr = airdna_data['future']['summary']['adr']
    
    # Apply standard DSCR haircut to AirDNA projection
    # (if AirDNA itself overestimates by 20%, haircutting brings us closer to reality)
    haircut_rate = 0.20  # 20% standard haircut
    validated_revenue = airdna_revenue * (1 - haircut_rate)
    conservative_revenue = airdna_revenue_lower * (1 - haircut_rate)
    
    # Calculate claimed vs. validated divergence
    revenue_divergence = claimed_str_income / validated_revenue
    
    # ─── Layer 2: Component-Level Validation ───
    
    # Occupancy validation
    # AirDNA typically overstates by 5-15 pp; clamp to realistic range
    max_plausible_occupancy = min(claimed_occupancy, 0.85)
    if airdna_occupancy > 0.80:
        # AirDNA says 80%+ — reduce by 10pp for realism
        validated_occupancy = airdna_occupancy - 0.10
    else:
        validated_occupancy = airdna_occupancy
    
    occupancy_divergence = claimed_occupancy / validated_occupancy if validated_occupancy > 0 else 999
    
    # ADR validation
    # Compare against market comp ADRs from AirDNA
    comp_adrs = [comp['adr'] for comp in airdna_data.get('comps', [])]
    if comp_adrs:
        median_comp_adr = np.median(comp_adrs)
        adr_divergence = claimed_adr / median_comp_adr
    else:
        adr_divergence = 1.0  # No comp data — cannot validate
    
    # ─── Layer 3: Platform Income Verification (if available) ───
    platform_divergence = None
    if platform_data:
        actual_income = platform_data.get('actual_12mo_revenue')
        if actual_income and actual_income > 0:
            platform_divergence = claimed_str_income / actual_income
    
    # ─── Layer 4: Regulatory Risk Check ───
    regulatory_risk = check_str_regulations(subject_address)
    
    # ─── Score Calculation ───
    score = 0
    flags = []
    
    # Revenue divergence scoring
    if revenue_divergence > 1.50:
        score += 15
        flags.append(f"revenue_150pct_plus_of_validated ({revenue_divergence:.0%})")
    elif revenue_divergence > 1.30:
        score += 10
        flags.append(f"revenue_130_150pct_of_validated ({revenue_divergence:.0%})")
    elif revenue_divergence > 1.15:
        score += 5
        flags.append(f"revenue_115_130pct_of_validated ({revenue_divergence:.0%})")
    elif revenue_divergence > 1.05:
        score += 2
        flags.append(f"revenue_slightly_above_validated ({revenue_divergence:.0%})")
    
    # Occupancy divergence scoring
    if occupancy_divergence > 1.30:
        score += 5
        flags.append(f"occupancy_130pct_plus_of_validated ({occupancy_divergence:.0%})")
    elif occupancy_divergence > 1.15:
        score += 3
        flags.append(f"occupancy_115_130pct_of_validated ({occupancy_divergence:.0%})")
    
    # ADR divergence scoring
    if adr_divergence > 1.50:
        score += 5
        flags.append(f"adr_150pct_plus_of_market ({adr_divergence:.0%})")
    elif adr_divergence > 1.30:
        score += 3
        flags.append(f"adr_130_150pct_of_market ({adr_divergence:.0%})")
    
    # Platform income divergence (strongest signal if available)
    if platform_divergence and platform_divergence > 1.30:
        score += 7
        flags.append(f"claimed_vs_actual_platform_income {platform_divergence:.0%}")
    elif platform_divergence and platform_divergence > 1.15:
        score += 3
        flags.append(f"claimed_slightly_above_actual_platform {platform_divergence:.0%}")
    
    # Regulatory risk
    if regulatory_risk == 'banned':
        score += 10
        flags.append("str_banned_in_jurisdiction")
    elif regulatory_risk == 'restricted':
        score += 5
        flags.append("str_restricted_in_jurisdiction")
    elif regulatory_risk == 'pending_legislation':
        score += 3
        flags.append("str_pending_legislation")
    
    return {
        "score": round(min(25, score), 1),
        "revenue_divergence": round(revenue_divergence, 3),
        "occupancy_divergence": round(occupancy_divergence, 3),
        "adr_divergence": round(adr_divergence, 3),
        "platform_divergence": round(platform_divergence, 3) if platform_divergence else None,
        "validated_revenue": round(validated_revenue, 2),
        "conservative_revenue": round(conservative_revenue, 2),
        "regulatory_risk": regulatory_risk,
        "flags": flags
    }
```

### 3.4 STR Red Flag Thresholds — Summary

| Metric | Yellow Flag | Orange Flag | Red Flag |
|---|---|---|---|
| **Claimed Revenue / Validated Revenue** | >1.05 | >1.15 | >1.30 |
| **Claimed Occupancy** | >75% | >80% | >85% |
| **Claimed ADR / Market Median ADR** | >1.15 | >1.30 | >1.50 |
| **Claimed Revenue / Actual Platform Income** | >1.10 | >1.15 | >1.30 |
| **New Listing Occupancy Claim** | >65% | >70% | >75% |

### 3.5 STR Projection Confidence Tiers

```python
def str_confidence_tier(airdna_data, platform_data, property_history):
    """
    Classify the confidence level of STR validation.
    Affects how aggressively we score anomalies.
    """
    has_t12 = platform_data and platform_data.get('actual_12mo_revenue') is not None
    has_6mo = platform_data and platform_data.get('actual_6mo_revenue') is not None
    is_new_listing = not property_history.get('str_operating_history_months', 0) > 0
    comp_count = len(airdna_data.get('comps', []))
    
    if has_t12 and comp_count >= 5:
        return "HIGH"      # Verified actuals + good comps — score at full weight
    elif has_6mo and comp_count >= 3:
        return "MODERATE"   # Partial actuals + some comps — score at 80% weight
    elif comp_count >= 5:
        return "LOW"        # No actuals, but good comp data — score at 60% weight
    else:
        return "VERY_LOW"   # No actuals, poor comp data — score at 40% weight, 
                            # flag for mandatory manual review
```

---

## 4. MODULE C — LEASE DOCUMENT VERIFICATION

### 4.1 Objective

Detect fraudulent lease documents submitted to support DSCR qualification. Lease fraud ranges from completely fabricated documents to legitimate leases with manipulated terms.

### 4.2 Red Flag Detection Algorithm

```python
def verify_lease(lease_data, property_data, tenant_data, application_data):
    """
    Multi-signal lease verification. Each red flag contributes 
    points to the Module C score (0-25).
    """
    
    score = 0
    flags = []
    
    # ─── Flag 1: Recent Lease Signing (HIGH SIGNAL) ───
    # A lease signed within 30 days of the loan application is suspicious.
    # Legitimate tenants typically sign leases weeks or months before 
    # the landlord seeks financing. A coincident signing suggests the 
    # lease was created specifically to qualify for the loan.
    
    lease_signing_date = lease_data['signing_date']
    application_date = application_data['submission_date']
    days_between = (application_date - lease_signing_date).days
    
    if days_between < 0:
        score += 10  # Lease dated AFTER application — extremely suspicious
        flags.append(f"lease_signed_after_application ({days_between} days)")
    elif days_between <= 7:
        score += 8
        flags.append(f"lease_signed_within_7_days ({days_between} days)")
    elif days_between <= 30:
        score += 5
        flags.append(f"lease_signed_within_30_days ({days_between} days)")
    elif days_between <= 60:
        score += 2
        flags.append(f"lease_signed_within_60_days ({days_between} days)")
    
    # ─── Flag 2: Rent Significantly Above Market ───
    # This cross-references Module A's output.
    # If Module A already flagged the rent as anomalous, the lease 
    # verification amplifies the signal.
    
    rent_vs_market_pct = lease_data['monthly_rent'] / property_data['market_rent_median']
    
    if rent_vs_market_pct > 1.50:
        score += 8
        flags.append(f"lease_rent_150pct_plus_of_market ({rent_vs_market_pct:.0%})")
    elif rent_vs_market_pct > 1.30:
        score += 5
        flags.append(f"lease_rent_130_150pct_of_market ({rent_vs_market_pct:.0%})")
    elif rent_vs_market_pct > 1.15:
        score += 2
        flags.append(f"lease_rent_115_130pct_of_market ({rent_vs_market_pct:.0%})")
    
    # ─── Flag 3: Landlord-Tenant Address Overlap ───
    # If the landlord's address matches the tenant's address, or if 
    # the tenant's address matches the subject property, it may be 
    # self-rental or a lease-back arrangement.
    
    landlord_address = lease_data['landlord_address']
    tenant_address = lease_data['tenant_address']
    subject_address = property_data['address']
    
    if normalize_address(landlord_address) == normalize_address(tenant_address):
        score += 10
        flags.append("landlord_tenant_same_address")
    
    if normalize_address(tenant_address) == normalize_address(subject_address):
        score += 8
        flags.append("tenant_address_is_subject_property")
    
    # ─── Flag 4: Missing Security Deposit ───
    # Legitimate residential leases almost always require a security deposit
    # (typically 1 month's rent). Absence is a strong fraud signal.
    
    security_deposit = lease_data.get('security_deposit', 0)
    
    if security_deposit == 0:
        score += 5
        flags.append("no_security_deposit")
    elif security_deposit < lease_data['monthly_rent'] * 0.5:
        score += 3
        flags.append(f"security_deposit_below_half_month ({security_deposit})")
    
    # ─── Flag 5: No Utility Bills in Tenant Name ───
    # A legitimate tenant would have utility accounts. If no utility 
    # verification exists, it's a moderate fraud signal.
    
    utility_verification = tenant_data.get('utility_verification')
    
    if utility_verification is None or utility_verification == 'none':
        score += 4
        flags.append("no_utility_verification")
    elif utility_verification == 'partial':
        score += 2
        flags.append("partial_utility_verification")
    
    # ─── Flag 6: Lease Term Anomaly ───
    # Short leases (<6 months) at above-market rent suggest a 
    # "rent stuffing" scheme: high rent for a short period to qualify,
    # then the real tenant moves in at market rate.
    
    lease_term_months = lease_data.get('lease_term_months', 12)
    
    if lease_term_months < 3:
        score += 8
        flags.append(f"very_short_lease ({lease_term_months} months)")
    elif lease_term_months < 6:
        score += 5
        flags.append(f"short_lease ({lease_term_months} months)")
    elif lease_term_months < 12 and rent_vs_market_pct > 1.20:
        score += 4
        flags.append(f"sub_annual_lease_above_market ({lease_term_months} months)")
    
    # ─── Flag 7: Lease Start Date Before Property Acquisition ───
    # If the lease predates the borrower's ownership of the property, 
    # the lease is either fabricated or was signed by the prior owner.
    
    property_acquisition_date = property_data.get('acquisition_date')
    lease_start_date = lease_data.get('start_date')
    
    if property_acquisition_date and lease_start_date < property_acquisition_date:
        score += 10
        flags.append("lease_predates_ownership")
    
    # ─── Flag 8: Seller-Becomes-Tenant (Lease-Back) ───
    # After a property sale, the seller stays as tenant at above-market 
    # rent. This is a classic DSCR fraud: the "rent" is essentially 
    # the seller paying themselves through the loan qualification.
    
    seller_name = property_data.get('seller_name')
    tenant_name = lease_data.get('tenant_name')
    
    if seller_name and names_match(seller_name, tenant_name):
        score += 12
        flags.append("seller_becomes_tenant_leaseback")
        if rent_vs_market_pct > 1.10:
            score += 5  # Additional flag for above-market lease-back
            flags.append("leaseback_above_market_rent")
    
    # ─── Flag 9: Self-Rental / Family Rental ───
    # Borrower's LLC rents to the borrower themselves or a family member.
    
    borrower_entities = application_data.get('borrower_entities', [])
    tenant_name_normalized = normalize_name(tenant_name)
    
    for entity in borrower_entities:
        if names_match(entity['name'], tenant_name):
            score += 15
            flags.append("self_rental_detected")
            break
    
    # Check family relationship via address/name matching
    family_members = application_data.get('family_members', [])
    for member in family_members:
        if names_match(member['name'], tenant_name):
            score += 10
            flags.append("family_rental_detected")
            break
    
    # ─── Flag 10: Document Authenticity Signals ───
    doc_signals = analyze_document_authenticity(lease_data.get('document'))
    
    if doc_signals.get('template_match_score', 0) > 0.8:
        score += 5
        flags.append("generic_lease_template_detected")
    
    if not doc_signals.get('has_wet_signature', False):
        score += 3
        flags.append("no_wet_signature")
    
    if not doc_signals.get('has_notarization', False):
        score += 1  # Weak signal — many legitimate leases aren't notarized
    
    return {
        "score": round(min(25, score), 1),
        "flags": flags,
        "days_between_signing_and_application": days_between,
        "rent_vs_market_pct": round(rent_vs_market_pct, 3),
        "lease_term_months": lease_term_months,
        "security_deposit_present": security_deposit > 0,
        "utility_verification_status": utility_verification
    }
```

### 4.3 Document Authenticity Analysis (AI/ML Component)

```python
def analyze_document_authenticity(lease_document):
    """
    AI-powered document analysis to detect fabricated or manipulated leases.
    
    Signals checked:
    1. Template matching — compare against known fraudulent templates
    2. Font consistency — multiple fonts suggest copy-paste manipulation
    3. Date format consistency — mixed formats suggest editing
    4. Digital signature analysis — e-signatures are traceable; 
       "wet" signatures on digital documents are suspicious
    5. Metadata analysis — PDF creation date, author, tool used
    6. Text extraction consistency — OCR gaps suggest image manipulation
    """
    signals = {}
    
    # Metadata analysis
    if lease_document.file_type == 'pdf':
        metadata = extract_pdf_metadata(lease_document)
        signals['pdf_creation_date'] = metadata.get('creation_date')
        signals['pdf_author'] = metadata.get('author')
        signals['pdf_tool'] = metadata.get('producer')
        
        # Red flag: PDF created very recently (within 7 days of application)
        if metadata.get('creation_date'):
            days_since_creation = (datetime.now() - metadata['creation_date']).days
            if days_since_creation <= 1:
                signals['fresh_pdf'] = True
            if days_since_creation <= 7:
                signals['recent_pdf'] = True
    
    # Template matching using NLP
    lease_text = extract_text(lease_document)
    template_similarity = compute_template_similarity(lease_text, FRAUDULENT_TEMPLATE_DB)
    signals['template_match_score'] = template_similarity
    
    # Signature analysis
    signals['has_wet_signature'] = detect_wet_signature(lease_document)
    signals['has_digital_signature'] = detect_digital_signature(lease_document)
    signals['has_notarization'] = detect_notary_stamp(lease_document)
    
    return signals
```

### 4.4 Lease Fraud Prevalence in DSCR Lending

Based on industry intelligence:

| Fraud Type | Estimated Prevalence | Detection Difficulty |
|---|---|---|
| Completely fabricated lease | 5-10% of DSCR applications | Medium — detectable via utility/vendor verification |
| Legitimate lease, inflated rent | 10-15% of DSCR applications | Hard — requires market comp analysis (Module A) |
| Lease-back arrangement | 3-5% of DSCR applications | Medium — detectable via seller/tenant matching |
| Self-rental / family rental | 2-4% of DSCR applications | Easy — detectable via entity matching |
| Short-term lease at high rent | 2-3% of DSCR applications | Medium — detectable via term analysis |
| Post-dated or backdated lease | 1-2% of DSCR applications | Medium — detectable via metadata analysis |

---

## 5. MODULE D — NETWORK ANALYSIS FOR FRAUD RINGS

### 5.1 Objective

Detect organized fraud rings where multiple participants collude across DSCR loan applications. Fraud rings are responsible for the **largest dollar-value losses** in mortgage fraud, even though they represent a small percentage of total fraud cases.

### 5.2 Fraud Ring Typology in DSCR Lending

| Ring Type | How It Works | Estimated Loss per Ring |
|---|---|---|
| **Rent Inflation Ring** | Same "tenant" appears across 5+ applications; tenant provides inflated leases for a fee | $500K - $5M |
| **Appraiser-Broker Collusion** | Broker directs business to appraiser who consistently provides high rent comps | $2M - $20M |
| **Entity Network** | Borrower uses multiple LLCs to exceed lender caps; same beneficial owner behind all entities | $1M - $10M |
| **Property Flipping Ring** | Properties are flipped between ring members at inflated prices, each time with a new DSCR loan | $3M - $50M |
| **Straw Buyer Network** | Professional investor pays individuals to act as borrowers, circumventing lender limits | $2M - $15M |

### 5.3 Graph Construction

```python
class FraudGraph:
    """
    Build a heterogeneous graph from all DSCR applications.
    
    Node types:
    - Borrower (person or entity)
    - Property (address)
    - Tenant (person or entity on the lease)
    - Appraiser (licensed appraiser)
    - Broker (loan officer / broker)
    - Lender (lending institution)
    - Title_company
    
    Edge types:
    - borrower_owns_property
    - tenant_leases_property
    - appraiser_valued_property
    - broker_submitted_application
    - lender_funded_loan
    - shared_address (between entities)
    - shared_phone (between entities)
    - shared_email (between entities)
    - shared_bank_account (between entities)
    - shared_entity_officer (same person is officer of multiple LLCs)
    """
    
    def __init__(self):
        self.graph = nx.MultiDiGraph()  # Directed multigraph
        self.node_index = {}  # For fast lookup
        self.entity_registry = {}  # Canonical entity mapping
    
    def add_application(self, application):
        """Add a DSCR loan application to the graph."""
        app_id = application['id']
        
        # Add borrower node(s)
        for borrower in application['borrowers']:
            borrower_id = self._get_or_create_node('borrower', borrower)
            self.graph.add_node(borrower_id, **borrower)
        
        # Add property node
        property_id = self._get_or_create_node('property', application['property'])
        self.graph.add_node(property_id, **application['property'])
        
        # Add tenant node (from lease)
        if application.get('lease', {}).get('tenant'):
            tenant_id = self._get_or_create_node('tenant', application['lease']['tenant'])
            self.graph.add_node(tenant_id, **application['lease']['tenant'])
            # Tenant → Property edge
            self.graph.add_edge(tenant_id, property_id, 
                               edge_type='tenant_leases_property',
                               rent=application['lease']['monthly_rent'],
                               app_id=app_id)
        
        # Add appraiser node
        if application.get('appraiser'):
            appraiser_id = self._get_or_create_node('appraiser', application['appraiser'])
            self.graph.add_node(appraiser_id, **application['appraiser'])
            self.graph.add_edge(appraiser_id, property_id,
                               edge_type='appraiser_valued_property',
                               market_rent=application['appraiser']['market_rent'],
                               app_id=app_id)
        
        # Add broker node
        if application.get('broker'):
            broker_id = self._get_or_create_node('broker', application['broker'])
            self.graph.add_node(broker_id, **application['broker'])
            self.graph.add_edge(broker_id, property_id,
                               edge_type='broker_submitted_application',
                               app_id=app_id)
        
        # Add shared-entity edges (based on fuzzy matching)
        self._add_shared_entity_edges(application)
    
    def _get_or_create_node(self, node_type, data):
        """Create or retrieve node by canonical identity."""
        canonical_id = self._resolve_identity(node_type, data)
        if canonical_id not in self.graph:
            self.graph.add_node(canonical_id, node_type=node_type, **data)
        return canonical_id
    
    def _resolve_identity(self, node_type, data):
        """
        Resolve entity identity using fuzzy matching.
        
        For borrowers/entities: match on EIN/SSN (exact) or 
        name+address (fuzzy, threshold 0.85)
        For properties: match on normalized address
        For tenants: match on name+DOB or name+address
        """
        # Implementation uses deterministic matching on IDs first,
        # then fuzzy matching on name+address as fallback
        ...
```

### 5.4 Network Anomaly Scoring

```python
def compute_network_risk_score(graph, application):
    """
    Compute Module D score (0-25) based on network analysis.
    
    Checks six network-level signals:
    1. Tenant reuse across applications
    2. Appraiser rent inflation pattern
    3. Entity overlap (shared beneficial owners)
    4. Broker concentration
    5. Connected component risk
    6. Temporal clustering
    """
    
    score = 0
    flags = []
    
    # ─── Signal 1: Tenant Reuse ───
    # A tenant appearing on multiple DSCR applications is the #1 
    # indicator of a rent fraud ring. Legitimate tenants rarely 
    # appear on more than 1-2 applications (their own rental + 
    # possibly a prior rental).
    
    tenant_node = get_tenant_node(graph, application)
    if tenant_node:
        tenant_applications = get_connected_applications(graph, tenant_node)
        tenant_count = len(tenant_applications)
        
        if tenant_count >= 5:
            score += 12
            flags.append(f"tenant_on_{tenant_count}_applications_ring_suspected")
        elif tenant_count >= 3:
            score += 8
            flags.append(f"tenant_on_{tenant_count}_applications")
        elif tenant_count >= 2:
            score += 3
            flags.append(f"tenant_on_{tenant_count}_applications")
        
        # Check if tenant's rent is consistently above market across applications
        above_market_count = sum(
            1 for app in tenant_applications 
            if app.get('rent_vs_market_pct', 1.0) > 1.15
        )
        if above_market_count >= 2 and tenant_count >= 2:
            score += 5
            flags.append("tenant_consistently_above_market")
    
    # ─── Signal 2: Appraiser Rent Inflation Pattern ───
    # Track each appraiser's historical tendency to produce 
    # above-market rent opinions.
    
    appraiser_node = get_appraiser_node(graph, application)
    if appraiser_node:
        appraiser_appraisals = get_connected_appraisals(graph, appraiser_node)
        
        if len(appraiser_appraisals) >= 5:
            # Calculate appraiser's average rent deviation from market
            deviations = [
                a['appraised_rent'] / a['market_rent_median'] - 1.0
                for a in appraiser_appraisals
                if a.get('market_rent_median')
            ]
            avg_deviation = np.mean(deviations) if deviations else 0
            
            if avg_deviation > 0.15:  # Appraiser consistently 15%+ above market
                score += 10
                flags.append(f"appraiser_avg_deviation_{avg_deviation:.0%}")
            elif avg_deviation > 0.10:
                score += 6
                flags.append(f"appraiser_above_market_{avg_deviation:.0%}")
            elif avg_deviation > 0.05:
                score += 3
                flags.append(f"appraiser_slightly_above_{avg_deviation:.0%}")
    
    # ─── Signal 3: Entity Overlap ───
    # Same beneficial owner behind multiple borrowing entities.
    
    borrower_entities = get_borrower_entities(graph, application)
    entity_overlap_count = count_entity_overlaps(graph, borrower_entities)
    
    if entity_overlap_count >= 3:
        score += 10
        flags.append(f"entity_overlap_{entity_overlap_count}_entities")
    elif entity_overlap_count >= 2:
        score += 5
        flags.append(f"entity_overlap_{entity_overlap_count}_entities")
    
    # ─── Signal 4: Broker Concentration ───
    # A single broker submitting multiple applications with similar 
    # fraud signals suggests broker-facilitated fraud.
    
    broker_node = get_broker_node(graph, application)
    if broker_node:
        broker_apps = get_connected_applications(graph, broker_node)
        
        # How many of this broker's apps have high fraud scores?
        high_fraud_apps = sum(
            1 for app in broker_apps
            if app.get('fraud_score', 0) > 30
        )
        fraud_rate = high_fraud_apps / len(broker_apps) if broker_apps else 0
        
        if fraud_rate > 0.30 and len(broker_apps) >= 5:
            score += 8
            flags.append(f"broker_fraud_rate_{fraud_rate:.0%}_of_{len(broker_apps)}_apps")
        elif fraud_rate > 0.20 and len(broker_apps) >= 3:
            score += 4
            flags.append(f"broker_elevated_fraud_rate_{fraud_rate:.0%}")
    
    # ─── Signal 5: Connected Component Risk ───
    # Find the connected component containing this application.
    # Large, dense components with multiple fraud signals are rings.
    
    component = find_connected_component(graph, application)
    component_size = len(component)
    component_fraud_score = compute_component_fraud_density(graph, component)
    
    if component_size >= 10 and component_fraud_score > 0.30:
        score += 10
        flags.append(f"large_fraud_component_size_{component_size}")
    elif component_size >= 5 and component_fraud_score > 0.20:
        score += 5
        flags.append(f"medium_fraud_component_size_{component_size}")
    
    # ─── Signal 6: Temporal Clustering ───
    # Multiple applications with shared entities submitted within 
    # a short time window (30 days) suggests coordinated fraud.
    
    temporal_cluster = find_temporal_cluster(graph, application, window_days=30)
    cluster_size = len(temporal_cluster)
    
    if cluster_size >= 5:
        score += 7
        flags.append(f"temporal_cluster_{cluster_size}_apps_in_30_days")
    elif cluster_size >= 3:
        score += 3
        flags.append(f"temporal_cluster_{cluster_size}_apps_in_30_days")
    
    return {
        "score": round(min(25, score), 1),
        "flags": flags,
        "tenant_reuse_count": tenant_count if tenant_node else 0,
        "appraiser_deviation": round(avg_deviation, 3) if appraiser_node else None,
        "entity_overlap_count": entity_overlap_count,
        "component_size": component_size,
        "temporal_cluster_size": cluster_size
    }
```

### 5.5 Graph Neural Network (Advanced — Phase 2)

For Phase 2, a Graph Neural Network can learn complex fraud patterns that rule-based detection misses:

```python
class DSCRFraudGNN(nn.Module):
    """
    Heterogeneous Graph Neural Network for DSCR fraud detection.
    
    Architecture:
    - Heterophilic message passing across node types
    - Edge-type-specific weight matrices
    - Multi-head attention for neighbor aggregation
    - Node-level fraud probability output
    
    Training:
    - Semi-supervised: use known fraud cases (from SARs, 
      lender-reported fraud) as positive labels
    - Self-supervised pre-training: contrastive learning on 
      subgraph representations
    - Active learning: surface highest-uncertainty cases for 
      human review to improve training data
    
    Input features per node type:
    - Borrower: [num_loans, total_loan_amount, geographic_spread, 
                 entity_count, avg_dscr, fraud_history_flag]
    - Property: [value, sqft, beds, baths, age, rent, rent_vs_market, 
                 sale_frequency, price_change_pct]
    - Tenant: [num_applications, avg_rent_pct_of_market, entity_type, 
               address_match_to_borrower]
    - Appraiser: [num_appraisals, avg_deviation_from_market, 
                  license_status, years_active]
    - Broker: [num_submissions, approval_rate, avg_fraud_score_of_apps]
    """
    
    def __init__(self, node_feature_dims, hidden_dim=128, num_heads=4):
        super().__init__()
        # Heterogeneous message passing layers
        self.het_conv1 = HeteroConv({
            'borrower_owns_property': GATConv(node_feature_dims['borrower'], hidden_dim, heads=num_heads),
            'tenant_leases_property': GATConv(node_feature_dims['tenant'], hidden_dim, heads=num_heads),
            'appraiser_valued_property': GATConv(node_feature_dims['appraiser'], hidden_dim, heads=num_heads),
            'broker_submitted_application': GATConv(node_feature_dims['broker'], hidden_dim, heads=num_heads),
            'shared_entity_officer': GATConv(hidden_dim * num_heads, hidden_dim, heads=1),
            'shared_address': GATConv(hidden_dim * num_heads, hidden_dim, heads=1),
        })
        
        self.het_conv2 = HeteroConv({...})  # Second layer
        
        # Fraud prediction head
        self.fraud_head = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x_dict, edge_index_dict):
        # Two rounds of message passing
        h_dict = self.het_conv1(x_dict, edge_index_dict)
        h_dict = {key: F.relu(h) for key, h in h_dict.items()}
        h_dict = self.het_conv2(h_dict, edge_index_dict)
        
        # Generate fraud score for each node
        fraud_scores = {}
        for node_type, h in h_dict.items():
            fraud_scores[node_type] = self.fraud_head(h)
        
        return fraud_scores
```

---

## 6. COMPOSITE FRAUD SCORE (0–100)

### 6.1 Score Composition

The composite fraud score is the sum of four module sub-scores, each ranging from 0 to 25:

```
COMPOSITE FRAUD SCORE = A + B + C + D + cross_module_boost

Where:
  A = Rent Comp Anomaly Score (0-25)
  B = STR Projection Divergence Score (0-25)
  C = Lease Verification Score (0-25)
  D = Network Risk Score (0-25)
  cross_module_boost = additional points when multiple modules flag simultaneously
```

### 6.2 Cross-Module Boost Logic

When multiple modules flag the same deal, the fraud signal is stronger than any individual module suggests. The cross-module boost captures this:

```python
def compute_cross_module_boost(module_scores, module_flags):
    """
    Boost the composite score when multiple modules produce 
    concurrent signals.
    
    Logic:
    - 2 modules with score ≥ 10: +3 points
    - 3 modules with score ≥ 10: +6 points  
    - 4 modules with score ≥ 10: +10 points
    - Any module with score ≥ 20 + another ≥ 10: +5 points
    
    The boost is capped at 15 points and the total score 
    is capped at 100.
    """
    high_scores = sum(1 for s in module_scores.values() if s >= 10)
    very_high = sum(1 for s in module_scores.values() if s >= 20)
    
    boost = 0
    
    if high_scores >= 4:
        boost += 10
    elif high_scores >= 3:
        boost += 6
    elif high_scores >= 2:
        boost += 3
    
    if very_high >= 1 and high_scores >= 2:
        boost += 5
    
    # Specific cross-module patterns that strongly indicate fraud
    if module_scores['A'] >= 10 and module_scores['C'] >= 10:
        # Rent is above market AND lease is suspicious → rent stuffing
        boost += 3
    
    if module_scores['B'] >= 10 and module_scores['C'] >= 10:
        # STR projection is inflated AND lease is suspicious → STR inflation
        boost += 3
    
    if module_scores['A'] >= 10 and module_scores['D'] >= 10:
        # Rent anomaly AND network risk → organized rent inflation ring
        boost += 5
    
    return min(15, boost)
```

### 6.3 Disposition Thresholds

| Score Range | Disposition | Action | SLA |
|---|---|---|---|
| **0–29** | **GREEN** | Auto-proceed; standard underwriting | Immediate |
| **30–39** | **YELLOW** | Enhanced review; underwriter must acknowledge fraud score | 4-hour SLA |
| **40–49** | **ORANGE** | Senior underwriter review required; additional documentation demanded | 24-hour SLA |
| **50–69** | **RED** | Fraud investigation; deal paused; compliance team notified | 48-hour SLA |
| **70–100** | **CRIMSON** | Presumptive decline; reversal requires VP-level approval with written justification | 72-hour SLA |

### 6.4 Score Explanation Requirements

Every fraud score must include a **machine-readable explanation** that the underwriter can review:

```json
{
  "composite_score": 47,
  "disposition": "ORANGE",
  "modules": {
    "A": {
      "score": 18,
      "method": "robust_z_score",
      "z_score": 2.1,
      "median_comp_rent": 2800,
      "claimed_rent": 4200,
      "claimed_vs_median_pct": "50.0%",
      "comp_count": 14,
      "confidence_factor": 1.0,
      "flags": ["z_score_above_2.0", "rent_50pct_above_median"]
    },
    "B": {
      "score": 0,
      "note": "LTR deal — STR validation not applicable"
    },
    "C": {
      "score": 12,
      "days_between_signing_and_application": 5,
      "rent_vs_market_pct": "1.50",
      "security_deposit_present": false,
      "flags": ["lease_signed_within_7_days", "no_security_deposit", 
                "lease_rent_150pct_plus_of_market"]
    },
    "D": {
      "score": 14,
      "tenant_reuse_count": 3,
      "flags": ["tenant_on_3_applications", "tenant_consistently_above_market"]
    }
  },
  "cross_module_boost": 3,
  "boost_reason": "rent_anomaly_plus_network_risk_suggests_organized_ring",
  "required_actions": [
    "Senior underwriter review required",
    "Request utility bills in tenant name",
    "Request bank statements showing rent deposits",
    "Verify tenant identity independently"
  ]
}
```

### 6.5 Weight Justification

All four modules are weighted equally (25 points each) by design:

| Module | Weight | Justification |
|---|---|---|
| A — Rent Comp Anomaly | 25% | Primary defense against rent stuffing (most common DSCR fraud) |
| B — STR Projection | 25% | STR income is the most manipulable input; highest individual risk |
| C — Lease Verification | 25% | Lease is the "proof" of rent — if the lease is fake, the rent is fake |
| D — Network Analysis | 25% | Organized fraud causes the largest losses; early detection critical |

**Why not weight by prevalence?** Prevalence varies by market and over time. Equal weighting ensures no single fraud type can evade detection by dominating the score. Additionally, the cross-module boost naturally amplifies the most dangerous patterns (organized fraud).

---

## 7. DSCR-SPECIFIC FRAUD PATTERN LIBRARY

### 7.1 Pattern Catalog

```python
FRAUD_PATTERNS = {
    "rent_stuffing": {
        "description": "Investor claims rent well above market to qualify for larger loan amount",
        "detection_modules": ["A", "C"],
        "typical_score_range": "30-60",
        "prevalence": "HIGH (10-15% of applications have some rent inflation)",
        "example": "Market rent $2,800/mo; claimed rent $4,200/mo; DSCR goes from 0.95 to 1.42",
        "detection_formula": "If Module A score > 10 AND Module C score > 5 → rent_stuffing flag",
        "false_positive_mitigation": "Verify via bank statements showing actual rent deposits"
    },
    
    "str_inflation": {
        "description": "Using best-case AirDNA projection with no haircut to inflate DSCR",
        "detection_modules": ["B"],
        "typical_score_range": "15-40",
        "prevalence": "MEDIUM-HIGH (common in STR-eligible markets; 15-25% overestimate)",
        "example": "AirDNA projects $8,000/mo; actual realized $5,200/mo; borrower uses $8,000 for DSCR",
        "detection_formula": "If Module B revenue_divergence > 1.15 → str_inflation flag",
        "false_positive_mitigation": "Request 12-month platform statements; accept verified T12 with lower haircut"
    },
    
    "leaseback_arrangement": {
        "description": "Property seller becomes tenant at above-market rent after sale",
        "detection_modules": ["C", "D"],
        "typical_score_range": "35-55",
        "prevalence": "MEDIUM (3-5% of applications in hot markets)",
        "example": "Seller lists at $500K; buyer offers $520K; seller signs 12-month lease at $3,500/mo (market: $2,200/mo); seller defaults on rent after 3 months",
        "detection_formula": "If seller_name == tenant_name AND rent > market → leaseback flag",
        "false_positive_mitigation": "Verify via independent tenant screening; request rent payment history"
    },
    
    "short_term_lease_stuffing": {
        "description": "3-6 month lease at high rent; tenant leaves after qualifying period; real rent is lower",
        "detection_modules": ["A", "C"],
        "typical_score_range": "25-50",
        "prevalence": "MEDIUM (2-3% of applications)",
        "example": "6-month lease at $4,500/mo; after 6 months, property re-rents at $2,800/mo market rate",
        "detection_formula": "If lease_term < 12 months AND rent > market → short_term_stuffing flag",
        "false_positive_mitigation": "Discount short-term leases by 10-20% for DSCR calculation; require 12-month minimum for full weight"
    },
    
    "self_rental": {
        "description": "Borrower's LLC rents to themselves, family member, or affiliated entity",
        "detection_modules": ["C", "D"],
        "typical_score_range": "40-65",
        "prevalence": "LOW-MEDIUM (2-4% of applications)",
        "example": "Borrower's LLC owns property; LLC member's spouse signs lease at above-market rent",
        "detection_formula": "If tenant_name in borrower_family OR tenant_entity in borrower_entities → self_rental flag",
        "false_positive_mitigation": "Arm's-length verification; require independent property management agreement"
    },
    
    "appraiser_inflation_ring": {
        "description": "Specific appraiser consistently provides above-market rent opinions in exchange for referrals",
        "detection_modules": ["A", "D"],
        "typical_score_range": "35-55",
        "prevalence": "LOW (1-2% of appraisers, but high-impact when present)",
        "example": "Appraiser's average rent opinion is 18% above market median; broker directs 80% of deals to this appraiser",
        "detection_formula": "If appraiser_avg_deviation > 10% AND broker_concentration > 50% → appraiser_ring flag",
        "false_positive_mitigation": "Track appraiser statistics over sufficient sample (20+ appraisals); compare against district-wide rent trends"
    },
    
    "property_condition_misrepresentation": {
        "description": "C-class property listed as B-class to get higher appraised rent",
        "detection_modules": ["A"],
        "typical_score_range": "15-35",
        "prevalence": "MEDIUM (5-8% of applications)",
        "example": "Property in poor condition appraised at 'average' condition; rent comps based on renovated units",
        "detection_formula": "If condition score from inspection < appraisal condition score → condition_misrep flag",
        "false_positive_mitigation": "Require property inspection independent of appraisal"
    }
}
```

### 7.2 Pattern Interaction Matrix

When multiple patterns co-occur, fraud probability increases dramatically:

| Pattern Combination | Combined Prevalence | Fraud Probability | Composite Score Impact |
|---|---|---|---|
| rent_stuffing + self_rental | ~1% | >90% | +10 boost (almost certain fraud) |
| rent_stuffing + leaseback | ~2% | >80% | +8 boost |
| str_inflation + short_term_lease | ~1.5% | >75% | +6 boost |
| rent_stuffing + appraiser_ring | ~0.5% | >95% | +12 boost (organized ring) |
| str_inflation + regulatory_ban | ~0.5% | >90% | +10 boost |

---

## 8. HISTORICAL FRAUD DATA & BENCHMARKS

### 8.1 Mortgage Fraud Statistics

| Statistic | Value | Source |
|---|---|---|
| **Mortgage fraud total losses (2024)** | ~$1.3B annually | CoreLogic/FinCEN estimates |
| **Investment property fraud share** | ~22% of all mortgage fraud | FBI Mortgage Fraud Report |
| **DSCR/non-QM fraud rate** | Estimated 2-5x conventional mortgage rate | Industry estimates (less documentation = more fraud) |
| **Most common DSCR fraud type** | Income/rent inflation (55% of DSCR fraud) | Industry consensus |
| **Average loss per DSCR fraud case** | $150K - $500K | Based on loan amounts of $300K-$2M |
| **Appraiser-related fraud** | ~8% of mortgage fraud involves appraiser misconduct | FBI |
| **Fraud ring average loss** | $2M - $5M per ring | FinCEN SAR analysis |

### 8.2 Notable DSCR/Non-QM Fraud Cases

| Case | Year | Fraud Type | Loss | Mechanism |
|---|---|---|---|---|
| **NYC Rent Inflation Ring** | 2023 | Organized rent stuffing | ~$8M | Same "tenant" on 12+ applications; inflated leases |
| **Miami Property Flipping Ring** | 2022 | Equity stripping | ~$12M | Properties flipped between ring members; DSCR loans on each flip |
| **Chicago Appraiser Collusion** | 2023 | Appraiser inflation | ~$4M | Appraiser consistently 25%+ above market; broker kickback scheme |
| **National STR Fraud** | 2024 | STR projection inflation | ~$3M | AirDNA projections used without haircut; properties underperformed by 40% |
| **TX Entity Network** | 2023 | Entity fraud | ~$6M | Same beneficial owner behind 8 LLCs; exceeded lender caps |

### 8.3 Benchmark Detection Rates

Based on the algorithm design, expected detection performance:

| Fraud Type | Detection Rate (Sensitivity) | False Positive Rate | Key Module |
|---|---|---|---|
| Rent stuffing (>30% above market) | >95% | <5% | A + C |
| Rent stuffing (15-30% above market) | >80% | <10% | A + C |
| STR inflation (>30% above validated) | >90% | <8% | B |
| STR inflation (15-30% above validated) | >75% | <12% | B |
| Fabricated lease | >85% | <7% | C |
| Lease-back arrangement | >90% | <5% | C + D |
| Self-rental | >95% | <3% | C + D |
| Fraud rings (3+ connected entities) | >80% | <10% | D |
| Fraud rings (5+ connected entities) | >95% | <5% | D |

---

## 9. PLATFORM INTEGRATION & DEAL FLOW

### 9.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DSCR INTELLIGENCE PLATFORM                    │
│                                                                  │
│  ┌──────────────┐     ┌──────────────────────┐                  │
│  │  Deal Entry  │────▶│  Fraud Detection     │                  │
│  │  (Property,  │     │  Pipeline            │                  │
│  │  Rent, Lease,│     │                      │                  │
│  │  Borrower)   │     │  ┌──────────────┐   │                  │
│  └──────────────┘     │  │ Module A     │   │     ┌──────────┐ │
│                       │  │ (Rent Comp)  │───┼────▶│ Composite│ │
│  ┌──────────────┐     │  ├──────────────┤   │     │ Score    │ │
│  │  External    │     │  │ Module B     │   │     │ (0-100)  │ │
│  │  Data APIs   │────▶│  │ (STR Valid)  │───┼────▶│          │ │
│  │  (RentCast,  │     │  ├──────────────┤   │     └────┬─────┘ │
│  │  AirDNA,     │     │  │ Module C     │   │          │       │
│  │  Rentometer) │     │  │ (Lease Ver)  │───┤          │       │
│  └──────────────┘     │  ├──────────────┤   │          ▼       │
│                       │  │ Module D     │   │  ┌──────────────┐│
│  ┌──────────────┐     │  │ (Network)    │───┘  │ Disposition  ││
│  │  Document    │     │  └──────────────┘      │ Engine       ││
│  │  Pipeline    │────▶│                        │ GREEN/YELLOW/││
│  │  (OCR, NLP)  │     └──────────────────────┘  │ ORANGE/RED  ││
│  └──────────────┘                                └──────────────┘│
│                                                         │       │
│  ┌──────────────┐     ┌──────────────────────┐          │       │
│  │  Underwriter │◀────│  Workflow Engine      │◀─────────┘       │
│  │  Dashboard   │     │  (Actions, SLAs,     │                   │
│  │              │     │   Escalations)        │                   │
│  └──────────────┘     └──────────────────────┘                   │
│                                                                  │
│  ┌──────────────┐     ┌──────────────────────┐                   │
│  │  Audit Log   │◀────│  Score Explanation   │                   │
│  │  (Regulatory)│     │  Generator           │                   │
│  └──────────────┘     └──────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Deal Flow with Fraud Scoring

```
DEAL ENTRY
    │
    ▼
┌─────────────────────┐
│ Step 1: Data        │  Property address, claimed rent, lease doc,
│ Collection          │  STR projection, borrower info entered
│ (< 30 seconds)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 2: Module A    │  RentCast + Rentometer API calls
│ Rent Comp Analysis  │  Z-score, IQR, Mahalanobis computation
│ (< 5 seconds)       │  Comp selection and anomaly detection
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 3: Module B    │  If STR deal: AirDNA API call + validation
│ STR Validation      │  If LTR deal: skip (score = 0)
│ (< 30 seconds if    │
│  STR; 0 if LTR)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 4: Module C    │  Lease OCR + NLP analysis
│ Lease Verification  │  Red flag detection
│ (< 10 seconds)      │  Document authenticity checks
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 5: Module D    │  Graph DB query for entity relationships
│ Network Analysis    │  Connected component analysis
│ (< 3 seconds)       │  Temporal clustering check
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Step 6: Composite   │  Sum module scores + cross-module boost
│ Score Calculation   │  Generate explanation
│ (< 1 second)        │  Determine disposition
└─────────┬───────────┘
          │
    ┌─────┼─────┬─────────────┐
    ▼     ▼     ▼             ▼
 GREEN  YELLOW ORANGE       RED/
 (0-29) (30-39)(40-49)    CRIMSON
                  (50-100)
    │     │     │             │
    ▼     ▼     ▼             ▼
 Auto-  UW    Senior UW    Fraud
 pro-   ack   review +    Invest-
 ceed   score  add'l docs  igation
```

### 9.3 False Positive Prevention

The biggest risk of any fraud detection system is **flagging legitimate deals**, which costs revenue and frustrates brokers. Prevention strategies:

```python
def false_positive_mitigation(composite_score, module_results, property_context):
    """
    Apply context-aware adjustments to reduce false positives 
    on legitimate high-rent deals.
    """
    adjustments = 0
    reasons = []
    
    # ─── Luxury Property Exception ───
    # Luxury properties legitimately command above-market rents.
    # If the property is in a luxury tier (top 10% by value in ZIP),
    # reduce Module A's impact.
    if property_context.get('value_percentile_in_zip', 50) > 90:
        adjustments -= 3
        reasons.append("luxury_property_exception")
    
    # ─── Recently Renovated Exception ───
    # A recently renovated property can legitimately command higher 
    # rent than comps that haven't been updated.
    if property_context.get('renovation_last_3_years', False):
        adjustments -= 2
        reasons.append("recently_renovated_exception")
    
    # ─── Multi-Unit Premium ───
    # 2-4 unit properties sometimes have legitimate rental premiums 
    # due to unit mix (e.g., owner's unit + rental units)
    if property_context.get('unit_count', 1) >= 2:
        adjustments -= 1
        reasons.append("multi_unit_premium")
    
    # ─── Verified T12 Exception ───
    # If the borrower provides 12 months of verified bank statements
    # showing actual rent deposits matching claimed rent, 
    # significantly reduce the fraud score.
    if property_context.get('verified_t12_rent', False):
        adjustments -= 8
        reasons.append("verified_t12_actual_rent_deposits")
    
    # ─── Strong Credit Exception ───
    # Borrowers with 750+ FICO and extensive DSCR history 
    # are less likely to commit fraud (they have more to lose).
    borrower_profile = property_context.get('borrower_profile', {})
    if borrower_profile.get('fico', 0) >= 750 and borrower_profile.get('num_prior_dscr_loans', 0) >= 3:
        adjustments -= 2
        reasons.append("experienced_borrower_strong_credit")
    
    # ─── Market Volatility Adjustment ───
    # In rapidly appreciating markets, current rents may legitimately 
    # exceed 6-month-old comp data. Apply a market trend adjustment.
    market_rent_trend = property_context.get('market_rent_12mo_trend_pct', 0)
    if market_rent_trend > 0.05:  # Rents rising >5% annually
        # Reduce anomaly sensitivity proportionally
        trend_adjustment = min(3, int(market_rent_trend / 0.05))
        adjustments -= trend_adjustment
        reasons.append(f"rapidly_appreciating_market_{market_rent_trend:.0%}")
    
    # Apply adjustments (never go below 0)
    adjusted_score = max(0, composite_score + adjustments)
    
    return {
        "original_score": composite_score,
        "adjusted_score": adjusted_score,
        "adjustments": adjustments,
        "reasons": reasons
    }
```

### 9.4 Audit Trail & Regulatory Compliance

Every fraud score and its reasoning must be logged for regulatory compliance:

```python
def create_audit_record(application_id, fraud_result, underwriter_action):
    """
    Create immutable audit record for compliance.
    
    Required by: ECOA, Fair Lending, state regulators, 
    secondary market investors, insurance requirements.
    """
    return {
        "application_id": application_id,
        "timestamp": datetime.utcnow().isoformat(),
        "fraud_score": fraud_result["composite_score"],
        "disposition": fraud_result["disposition"],
        "module_scores": {
            "A_rent_comp_anomaly": fraud_result["modules"]["A"]["score"],
            "B_str_projection": fraud_result["modules"]["B"]["score"],
            "C_lease_verification": fraud_result["modules"]["C"]["score"],
            "D_network_risk": fraud_result["modules"]["D"]["score"]
        },
        "flags": fraud_result["all_flags"],
        "fp_adjustments": fraud_result.get("fp_adjustments", {}),
        "underwriter_action": underwriter_action,  # override, concur, escalate
        "underwriter_id": underwriter_action.get("underwriter_id"),
        "override_justification": underwriter_action.get("justification"),
        "model_version": "1.0.0",
        "data_sources_used": fraud_result["data_sources"]
    }
```

---

## 10. IMPLEMENTATION ROADMAP

### 10.1 Phase 1: Core Detection (Months 1-3)

| Component | Effort | Dependencies | Output |
|---|---|---|---|
| **Module A: Rent Comp Anomaly** | 1 ML engineer × 6 weeks | RentCast API, Rentometer API | Z-score + IQR + Mahalanobis pipeline |
| **Module C: Lease Verification** | 1 engineer × 4 weeks | OCR pipeline, NLP module | Red flag detection + doc authenticity |
| **Composite Scoring** | 1 engineer × 2 weeks | Modules A + C | Score calculation + disposition engine |
| **Underwriter Dashboard** | 1 frontend engineer × 3 weeks | Composite scoring API | Score display + action buttons |

**Phase 1 MVP**: Rent Comp + Lease verification covers ~70% of DSCR fraud. Deploy and collect ground truth.

### 10.2 Phase 2: STR + Network (Months 3-6)

| Component | Effort | Dependencies | Output |
|---|---|---|---|
| **Module B: STR Validation** | 1 ML engineer × 6 weeks | AirDNA API, platform scraping | Revenue/occupancy/ADR validation |
| **Module D: Network Analysis** | 1 ML engineer × 8 weeks | Graph DB (Neo4j), entity resolution | Tenant reuse + appraiser + broker patterns |
| **Cross-Module Boost** | 1 engineer × 2 weeks | All four modules | Pattern interaction scoring |
| **False Positive Mitigation** | 1 engineer × 3 weeks | Score history, underwriter feedback | Context-aware adjustments |

### 10.3 Phase 3: Advanced ML (Months 6-9)

| Component | Effort | Dependencies | Output |
|---|---|---|---|
| **GNN Fraud Detection** | 2 ML engineers × 4 months | Labeled fraud data, PyG | Network-level fraud scoring |
| **Isolation Forest Tuning** | 1 ML engineer × 4 weeks | Labeled data from Phase 1-2 | Improved anomaly detection |
| **Active Learning Loop** | 1 ML engineer × 6 weeks | Underwriter feedback system | Continuous model improvement |
| **Regulatory Reporting** | 1 engineer × 3 weeks | Audit trail data | SAR filing support |

### 10.4 Data Requirements for Training

| Data Source | Purpose | Access Method | Priority |
|---|---|---|---|
| **RentCast historical data** | Module A training & validation | API | P0 |
| **Rentometer historical data** | Module A secondary validation | API | P0 |
| **AirDNA Rentalizer** | Module B core input | Enterprise API | P0 |
| **Fannie Mae Loan Performance** | Default baseline model | Public dataset | P1 |
| **Freddie Mac Single-Family** | Default baseline model | Public dataset | P1 |
| **FinCEN SARs (aggregate)** | Fraud pattern training | FOIA request | P1 |
| **HMDA data** | Investment property patterns | Public dataset | P2 |
| **Internal labeled fraud cases** | Supervised model training | Internal DB | P0 (accumulates over time) |
| **Underwriter feedback** | Active learning labels | Dashboard | P0 (starts at Phase 1) |

### 10.5 API Specification (Module Interface)

```typescript
// Fraud detection API — single endpoint for deal scoring

interface FraudScoreRequest {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    property_type: 'SFR' | 'DUPLEX' | 'TRIPLEX' | 'QUAD';
    sqft: number;
    beds: number;
    baths: number;
    year_built: number;
    condition: 'A' | 'B' | 'C' | 'D';
    purchase_price: number;
    appraised_value: number;
  };
  rent: {
    claimed_monthly_rent: number;
    rent_source: 'lease' | 'appraisal_1007' | 'appraisal_1025' | 'str_projection';
    lease_term_months?: number;
  };
  lease?: {
    document_base64: string;
    signing_date: string;          // ISO 8601
    start_date: string;
    end_date: string;
    monthly_rent: number;
    security_deposit: number;
    tenant_name: string;
    tenant_address: string;
    landlord_name: string;
    landlord_address: string;
  };
  str_projection?: {
    source: 'airdna' | 'rabbu' | 'other';
    projected_monthly_revenue: number;
    projected_occupancy: number;
    projected_adr: number;
  };
  borrower: {
    entities: Array<{
      name: string;
      ein?: string;
      state_of_formation: string;
      officers: string[];
    }>;
    fico: number;
    num_prior_dscr_loans: number;
  };
  application: {
    submission_date: string;
    broker_id: string;
    appraiser_id?: string;
    lender_id: string;
  };
}

interface FraudScoreResponse {
  composite_score: number;          // 0-100
  disposition: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'CRIMSON';
  modules: {
    A: ModuleAResult;
    B: ModuleBResult;
    C: ModuleCResult;
    D: ModuleDResult;
  };
  cross_module_boost: number;
  boost_reasons: string[];
  fp_adjustments: FalsePositiveAdjustment;
  required_actions: string[];
  audit_id: string;
  model_version: string;
}
```

---

## APPENDIX A: THRESHOLD CALIBRATION TABLE

### A.1 Module A — Rent Comp Anomaly

| Z-Score | IQR Multiple | Mahalanobis p-value | Points | Interpretation |
|---|---|---|---|---|
| < 1.0 | < 1.5 | > 0.10 | 0 | Normal |
| 1.0–1.5 | 1.5–2.0 | 0.05–0.10 | 0–5 | Slightly above market |
| 1.5–2.0 | 2.0–2.5 | 0.01–0.05 | 5–13 | Notably above market |
| 2.0–2.5 | 2.5–3.5 | 0.001–0.01 | 13–20 | Significantly above market |
| > 2.5 | > 3.5 | < 0.001 | 20–25 | Extremely above market — likely fraud |

### A.2 Module B — STR Projection Divergence

| Revenue Divergence | Occupancy Claim | ADR vs Market | Points | Interpretation |
|---|---|---|---|---|
| < 1.05 | < 65% | < 1.15 | 0 | Within normal range |
| 1.05–1.15 | 65–75% | 1.15–1.30 | 2–5 | Slightly optimistic |
| 1.15–1.30 | 75–80% | 1.30–1.50 | 5–13 | Notably inflated |
| 1.30–1.50 | 80–85% | 1.50–2.00 | 13–20 | Significantly inflated |
| > 1.50 | > 85% | > 2.00 | 20–25 | Extremely inflated — likely fraud |

### A.3 Module C — Lease Verification

| Red Flag | Points | Condition |
|---|---|---|
| Lease signed within 7 days of application | 8 | days_between ≤ 7 |
| Lease signed after application | 10 | days_between < 0 |
| Rent >150% of market | 8 | rent_vs_market > 1.50 |
| Landlord and tenant same address | 10 | exact address match |
| No security deposit | 5 | deposit = $0 |
| No utility bills in tenant name | 4 | no verification |
| Lease < 6 months + above market | 5 | term < 6 AND rent > market |
| Lease predates ownership | 10 | start < acquisition date |
| Seller becomes tenant | 12 | seller_name == tenant_name |
| Self-rental detected | 15 | tenant in borrower entities |
| Family rental detected | 10 | tenant in family members |

### A.4 Module D — Network Risk

| Signal | Points | Condition |
|---|---|---|
| Tenant on 2 applications | 3 | tenant_count = 2 |
| Tenant on 3+ applications | 8 | tenant_count ≥ 3 |
| Tenant on 5+ applications | 12 | tenant_count ≥ 5 (ring suspected) |
| Appraiser avg deviation > 10% | 6 | over 5+ appraisals |
| Appraiser avg deviation > 15% | 10 | over 5+ appraisals |
| Entity overlap ≥ 2 | 5 | shared beneficial owners |
| Entity overlap ≥ 3 | 10 | shared beneficial owners |
| Broker fraud rate > 20% | 4 | over 3+ applications |
| Broker fraud rate > 30% | 8 | over 5+ applications |
| Large fraud component (5+ nodes) | 5 | connected component |
| Large fraud component (10+ nodes) | 10 | connected component |
| Temporal cluster 3+ in 30 days | 3 | shared entities |
| Temporal cluster 5+ in 30 days | 7 | shared entities |

---

## APPENDIX B: STR REGULATORY KILL-LIST

Markets where STR is banned, restricted, or facing pending legislation. STR deals in these markets receive automatic Module B penalties:

| Market | Status | Penalty |
|---|---|---|
| New York City (Local Law 18) | BANNED | +10 points |
| San Francisco | BANNED (unregistered) | +10 points |
| Santa Monica, CA | BANNED | +10 points |
| Honolulu, HI | BANNED | +10 points |
| Portland, OR | RESTRICTED | +5 points |
| Nashville, TN | RESTRICTED (NOO permits frozen) | +5 points |
| Austin, TX | RESTRICTED (Type 2 phased out) | +5 points |
| Dallas, TX | PENDING (litigation risk) | +3 points |
| New Orleans, LA | RESTRICTED | +5 points |
| Barcelona, Spain | BANNED | +10 points |
| Colorado mountain towns | RESTRICTED (varies) | +3-5 points |

*This list must be updated quarterly based on municipal legislation changes.*

---

## APPENDIX C: PERFORMANCE REQUIREMENTS

| Metric | Target | Acceptable | Measurement |
|---|---|---|---|
| **Scoring latency (LTR)** | <3 seconds | <5 seconds | End-to-end from API call to response |
| **Scoring latency (STR)** | <15 seconds | <30 seconds | Includes AirDNA API call |
| **True positive rate (rent stuffing >30%)** | >95% | >90% | Against labeled fraud cases |
| **True positive rate (rent stuffing 15-30%)** | >80% | >75% | Against labeled fraud cases |
| **False positive rate (overall)** | <5% | <10% | Against confirmed legitimate deals |
| **False positive rate (luxury/premium)** | <8% | <12% | Against luxury property deals |
| **System availability** | 99.9% | 99.5% | Uptime SLA |
| **Score explanation latency** | <1 second | <2 seconds | Audit trail generation |

---

*Document prepared for engineering implementation. All algorithms specified with exact formulas, thresholds, and scoring logic. Phase 1 (Modules A + C) can be deployed in 6-8 weeks with 2 engineers.*
