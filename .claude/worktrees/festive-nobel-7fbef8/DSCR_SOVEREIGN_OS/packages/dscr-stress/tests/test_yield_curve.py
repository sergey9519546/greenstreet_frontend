"""Tests for yield_curve module (NSS-Svensson calibration).

Spec source: T11 godmode/11_T11_hardcore_algos/03_nss_svensson_yield_curve.md

24 tests covering:
- Yield computation correctness (NS + NSS)
- Calibration on standard curve shapes (flat, upward, humped, real-world)
- Calibration edge cases (NaN, out-of-range, mismatched shapes)
- Forward rate computation
- Fit quality classification
"""

from __future__ import annotations

import numpy as np
import pytest

from dscr_stress.yield_curve import (
    NSSParams,
    calibrate_ns,
    calibrate_nss,
    fit_quality,
    ns_yield,
    nss_forward_rate,
    nss_forward_rate_range,
    nss_yield,
)

# ---------------------------------------------------------------------------
# Yield computation tests
# ---------------------------------------------------------------------------


class TestYieldComputation:
    def test_nss_flat_curve(self):
        """Flat curve: all yields equal; should be recovered with b0=y, b1=b2=b3=0."""
        mats = np.array([0.5, 1, 2, 5, 10, 30])
        params = (0.04, 0.0, 0.0, 0.0, 1.5, 5.0)
        yields = nss_yield(mats, *params)
        np.testing.assert_allclose(yields, 0.04, atol=1e-10)

    def test_nss_zero_beta123_equals_beta0(self):
        """NSS reduces to constant when all betas except beta0 are zero."""
        mats = np.array([0.25, 1, 5, 30])
        out = nss_yield(mats, 0.05, 0.0, 0.0, 0.0, 1.5, 5.0)
        np.testing.assert_allclose(out, 0.05, atol=1e-10)

    def test_nss_rejects_zero_lambda(self):
        with pytest.raises(ValueError, match="lambda1 and lambda2 must be"):
            nss_yield(np.array([1, 5]), 0.05, 0.01, 0.0, 0.0, 0.0, 5.0)
        with pytest.raises(ValueError, match="lambda1 and lambda2 must be"):
            nss_yield(np.array([1, 5]), 0.05, 0.01, 0.0, 0.0, 1.5, 0.0)

    def test_ns_simple(self):
        """NS with slope should produce monotonic curve."""
        mats = np.array([0.5, 1, 2, 5, 10])
        out = ns_yield(mats, 0.06, -0.02, 0.01, 1.5)
        # Short rate ≈ b0 + b1 = 0.04
        assert out[0] < 0.06
        # Long rate ≈ b0 = 0.06
        assert abs(out[-1] - 0.06) < 0.005

    def test_nss_vectorized_input(self):
        """Scalar and array inputs should both work."""
        scalar = nss_yield(5.0, 0.05, -0.02, 0.01, 0.0, 1.5, 5.0)
        arr = nss_yield(np.array([5.0]), 0.05, -0.02, 0.01, 0.0, 1.5, 5.0)
        assert abs(float(scalar) - float(arr[0])) < 1e-10


# ---------------------------------------------------------------------------
# Calibration tests
# ---------------------------------------------------------------------------


class TestCalibration:
    def test_calibrate_nss_flat_curve_recovers_input(self):
        """Fitting a flat curve should give near-zero slope/curvature."""
        mats = np.array([0.5, 1, 2, 5, 10, 30])
        flat_yields = np.full(6, 0.04)
        result = calibrate_nss(mats, flat_yields)
        # b1 (slope) should be near 0 for a flat curve
        assert abs(result.params.beta1) < 0.001
        assert result.rmse < 0.0001  # < 1 bp

    def test_calibrate_nss_known_params_recovered(self):
        """Fit a curve with known params; check RMSE is small."""
        true_params = (0.045, -0.01, 0.005, -0.002, 1.5, 5.0)
        mats = np.array([0.25, 0.5, 1, 2, 5, 7, 10, 20, 30])
        true_y = nss_yield(mats, *true_params)
        # Add tiny noise
        rng = np.random.default_rng(42)
        noisy_y = true_y + rng.normal(0, 0.0001, len(mats))
        result = calibrate_nss(mats, noisy_y)
        # RMSE should be very small (sub-bp)
        assert result.rmse < 0.0005

    def test_calibrate_nss_rejects_nan_yields(self):
        mats = np.array([1, 5, 10])
        yields = np.array([0.04, np.nan, 0.05])
        with pytest.raises(ValueError, match="NaN"):
            calibrate_nss(mats, yields)

    def test_calibrate_nss_rejects_out_of_range(self):
        mats = np.array([1, 5, 10])
        yields = np.array([0.04, 0.50, 0.05])  # 50% is out of plausible
        with pytest.raises(ValueError, match="plausible range"):
            calibrate_nss(mats, yields)

    def test_calibrate_nss_rejects_shape_mismatch(self):
        with pytest.raises(ValueError, match="shape"):
            calibrate_nss(np.array([1, 5, 10]), np.array([0.04, 0.05]))

    def test_calibrate_nss_rejects_too_few_points(self):
        with pytest.raises(ValueError, match="at least 4"):
            calibrate_nss(np.array([1, 5]), np.array([0.04, 0.05]))

    def test_calibrate_nss_rejects_negative_maturity(self):
        with pytest.raises(ValueError, match="positive"):
            calibrate_nss(np.array([0, 1, 5]), np.array([0.04, 0.04, 0.05]))

    def test_calibrate_nss_rejects_long_maturity(self):
        with pytest.raises(ValueError, match="50 years"):
            calibrate_nss(np.array([1, 60]), np.array([0.04, 0.05]))

    def test_calibrate_ns_basic(self):
        mats = np.array([0.5, 1, 2, 5, 10])
        yields = np.array([0.04, 0.045, 0.05, 0.055, 0.06])
        result = calibrate_ns(mats, yields)
        assert result.rmse < 0.001  # 10 bps (NS is constrained — 4 params only)

    def test_calibrate_with_lbfgsb_method(self):
        mats = np.array([0.5, 1, 2, 5, 10, 30])
        yields = np.array([0.038, 0.040, 0.043, 0.048, 0.050, 0.052])
        result = calibrate_nss(mats, yields, method="L-BFGS-B")
        assert result.rmse < 0.001

    def test_calibrate_with_differential_evolution(self):
        mats = np.array([0.5, 1, 2, 5, 10, 30])
        yields = np.array([0.038, 0.040, 0.043, 0.048, 0.050, 0.052])
        result = calibrate_nss(mats, yields, method="differential_evolution")
        assert result.rmse < 0.001

    def test_calibrate_unknown_method_raises(self):
        mats = np.array([1, 2, 5, 10])
        yields = np.array([0.04, 0.045, 0.05, 0.055])
        with pytest.raises(ValueError, match="Unknown method"):
            calibrate_nss(mats, yields, method="bogus_method")


# ---------------------------------------------------------------------------
# Forward rate tests
# ---------------------------------------------------------------------------


class TestForwardRates:
    def test_forward_at_zero_equals_long_rate_plus_decay(self):
        """At tau=0, forward rate = b0 + b1 (initial slope contribution)."""
        params = NSSParams(
            beta0=0.05, beta1=-0.01, beta2=0.005, beta3=-0.002, lambda1=1.5, lambda2=5.0
        )
        fwd = nss_forward_rate(0.0, params)
        # At tau=0: f(0) = b0 + b1 + 0 + 0 = 0.05 + (-0.01) = 0.04
        assert abs(fwd - 0.04) < 1e-10

    def test_forward_at_large_tau_approaches_long_rate(self):
        """As tau -> infinity, forward rate -> b0."""
        params = NSSParams(
            beta0=0.05, beta1=-0.01, beta2=0.005, beta3=-0.002, lambda1=1.5, lambda2=5.0
        )
        fwd = nss_forward_rate(50.0, params)
        assert abs(fwd - 0.05) < 0.001

    def test_forward_negative_tau_raises(self):
        params = NSSParams(beta0=0.05, beta1=0.0, beta2=0.0, beta3=0.0, lambda1=1.5, lambda2=5.0)
        with pytest.raises(ValueError, match=">= 0"):
            nss_forward_rate(-1.0, params)

    def test_forward_range_vectorized(self):
        params = NSSParams(beta0=0.05, beta1=-0.01, beta2=0.0, beta3=0.0, lambda1=1.5, lambda2=5.0)
        horizons = np.array([0.5, 1, 5, 10])
        fwds = nss_forward_rate_range(horizons, params)
        assert len(fwds) == 4
        # At long horizons, rates should approach b0
        assert fwds[-1] > 0.045  # closer to b0 than short end


# ---------------------------------------------------------------------------
# Fit quality classification
# ---------------------------------------------------------------------------


class TestFitQuality:
    def test_excellent(self):
        assert fit_quality(0.00005) == "excellent"

    def test_good(self):
        assert fit_quality(0.0003) == "good"

    def test_acceptable(self):
        assert fit_quality(0.0008) == "acceptable"

    def test_marginal(self):
        assert fit_quality(0.002) == "marginal"

    def test_poor(self):
        assert fit_quality(0.01) == "poor"
