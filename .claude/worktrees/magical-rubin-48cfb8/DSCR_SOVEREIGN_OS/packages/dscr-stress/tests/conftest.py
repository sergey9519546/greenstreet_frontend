"""Conftest for dscr-stress test suite.

Adds the project root to sys.path so `dscr_core` and `dscr_stress` packages
are importable when running tests from this directory.
"""

import sys
from pathlib import Path

# Add src to sys.path so test files can import dscr_stress and dscr_core
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))
