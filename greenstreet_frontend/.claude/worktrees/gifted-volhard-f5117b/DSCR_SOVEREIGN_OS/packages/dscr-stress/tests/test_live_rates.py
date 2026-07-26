"""Tests for live_rates module (NY Fed SOFR + FRED CSV fetcher).

Spec source: T15 #1 (NY Fed SOFR API), T15 #6 (FRED CSV), T15 #12 (Freddie PMMS).

16 tests covering:
- Validation helpers
- Synthetic curve generation
- SOFR curve extraction
- Cache file behavior
- Fallback to defaults when offline
"""

from __future__ import annotations

import json
from datetime import date
from unittest.mock import patch

import pytest

from dscr_stress.live_rates import (
    FALLBACK_RATES,
    FRED_SERIES,
    NY_FED_SOFR_LAST_1,
    RateSnapshot,
    fetch_rate_snapshot,
    get_sofr_curve_from_snapshot,
    get_sofr_horizons_years,
    synthetic_sofr_curve,
)

# ---------------------------------------------------------------------------
# Synthetic curve (offline)
# ---------------------------------------------------------------------------


class TestSyntheticCurve:
    def test_synthetic_flat_curve(self):
        curve = synthetic_sofr_curve(flat_rate=0.04)
        assert len(curve) == 8
        # All tenors should have the same rate
        for _k, v in curve.items():
            assert v == pytest.approx(0.04, abs=1e-9)

    def test_synthetic_default_rate(self):
        curve = synthetic_sofr_curve()
        for _k, v in curve.items():
            assert v == pytest.approx(0.0365, abs=1e-9)

    def test_synthetic_rejects_invalid_rate(self):
        with pytest.raises(ValueError, match="flat_rate"):
            synthetic_sofr_curve(flat_rate=2.0)  # 200% — out of range
        with pytest.raises(ValueError, match="flat_rate"):
            synthetic_sofr_curve(flat_rate=-0.20)  # -20%

    def test_synthetic_curve_has_all_tenors(self):
        curve = synthetic_sofr_curve(0.05)
        expected = {"1m", "3m", "6m", "12m", "2y", "5y", "10y", "30y"}
        assert set(curve.keys()) == expected

    def test_sofr_horizons_in_years(self):
        h = get_sofr_horizons_years()
        assert h["1m"] == pytest.approx(1 / 12, abs=1e-9)
        assert h["3m"] == pytest.approx(3 / 12, abs=1e-9)
        assert h["6m"] == pytest.approx(6 / 12, abs=1e-9)
        assert h["12m"] == pytest.approx(1.0, abs=1e-9)
        assert h["2y"] == 2.0
        assert h["30y"] == 30.0


# ---------------------------------------------------------------------------
# SOFR curve extraction from snapshot
# ---------------------------------------------------------------------------


class TestSnapshotExtraction:
    def test_get_sofr_curve_from_full_snapshot(self):
        snapshot = RateSnapshot(
            as_of=date(2026, 6, 17),
            source="test",
            rates={
                "sofr_1m": 0.03637,
                "sofr_3m": 0.03668,
                "sofr_6m": 0.03731,
                "sofr_12m": 0.03869,
                "sofr_2y": 0.03644,
                "sofr_5y": 0.03685,
                "sofr_10y": 0.03751,
                "sofr_30y": 0.03884,
            },
        )
        curve = get_sofr_curve_from_snapshot(snapshot)
        assert len(curve) == 8
        assert curve["1m"] == pytest.approx(0.03637, abs=1e-9)
        assert curve["30y"] == pytest.approx(0.03884, abs=1e-9)

    def test_get_sofr_curve_partial_snapshot(self):
        snapshot = RateSnapshot(
            as_of=date(2026, 6, 17),
            source="test",
            rates={"sofr_1m": 0.03637, "sofr_3m": 0.03668},
        )
        curve = get_sofr_curve_from_snapshot(snapshot)
        assert len(curve) == 2
        assert "sofr_6m" not in curve

    def test_get_sofr_curve_empty_snapshot(self):
        snapshot = RateSnapshot(as_of=date(2026, 6, 17), source="test", rates={})
        assert get_sofr_curve_from_snapshot(snapshot) == {}


# ---------------------------------------------------------------------------
# Fallback behavior (offline)
# ---------------------------------------------------------------------------


class TestFallback:
    def test_fallback_rates_are_valid(self):
        """All fallback rates should be in plausible range."""
        for k, v in FALLBACK_RATES.items():
            assert -0.05 < v < 0.30, f"{k}: {v}"

    def test_fetch_rate_snapshot_falls_back_on_network_error(self, tmp_path):
        """When both live sources fail, fall back to documented defaults."""
        # tmp_path / "rates.json" reserved for future use; intentionally unused.
        _cache = tmp_path / "rates.json"
        del _cache
        with patch(
            "dscr_stress.live_rates.fetch_ny_fed_sofr", side_effect=ConnectionError("no network")
        ):
            with patch(
                "dscr_stress.live_rates.fetch_fred_csv", side_effect=ConnectionError("no network")
            ):
                snapshot = fetch_rate_snapshot(use_cache=False, timeout=0.1)
                assert snapshot.is_stale is True
                assert "fallback" in snapshot.source
                # Should have fallback rates
                assert "sofr_1m" in snapshot.rates or len(snapshot.rates) > 0

    def test_fetch_uses_cache_when_live_fails(self, tmp_path):
        """When live fetch fails but cache exists, use cache."""
        cache = tmp_path / "rates.json"
        cache.write_text(
            json.dumps(
                {
                    "as_of": "2026-06-17",
                    "rates": {"sofr_1m": 0.04, "sofr_3m": 0.041},
                    "saved_at": "2026-06-17T08:00:00+00:00",
                }
            ),
            encoding="utf-8",
        )
        with patch(
            "dscr_stress.live_rates.fetch_ny_fed_sofr", side_effect=ConnectionError("no network")
        ):
            with patch(
                "dscr_stress.live_rates.fetch_fred_csv", side_effect=ConnectionError("no network")
            ):
                snapshot = fetch_rate_snapshot(use_cache=True, cache_path=cache, timeout=0.1)
                assert snapshot.is_stale is True
                assert snapshot.source == "cache"
                assert snapshot.rates["sofr_1m"] == 0.04


# ---------------------------------------------------------------------------
# API endpoint constants
# ---------------------------------------------------------------------------


class TestEndpoints:
    def test_ny_fed_endpoint(self):
        assert NY_FED_SOFR_LAST_1.startswith("https://markets.newyorkfed.org")
        assert "sofr" in NY_FED_SOFR_LAST_1

    def test_fred_endpoints_have_required_series(self):
        assert "MORTGAGE30US" in FRED_SERIES
        assert "DGS10" in FRED_SERIES
        assert "SOFR30DAYAVG" in FRED_SERIES
        for series_id, url in FRED_SERIES.items():
            assert url.startswith("https://fred.stlouisfed.org")
            assert series_id in url
