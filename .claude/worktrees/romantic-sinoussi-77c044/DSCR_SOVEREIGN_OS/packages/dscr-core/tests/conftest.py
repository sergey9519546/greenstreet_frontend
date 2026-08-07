"""Pytest configuration and shared fixtures for dscr-core."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parent
GOLDEN_VECTORS_PATH = FIXTURES_DIR / "golden_vectors.json"


@pytest.fixture(scope="session")
def golden_vectors() -> dict:
    """Load the locked golden vector set."""
    with open(GOLDEN_VECTORS_PATH, encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="session")
def v11_golden(golden_vectors) -> dict:
    """The canonical v11.0 golden vector."""
    return golden_vectors["v11_0_golden_vector"]
