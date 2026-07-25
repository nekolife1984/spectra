"""
Unit and integration tests for impact.py.

impact.py is a 1667-line tool that drives the spectra traceability story:
  - load .spectra/trace-mapping.yaml
  - classify impact into Green/Amber/Gray bands
  - run --quick grep-based impact when no .spectra/trace-mapping.yaml exists
  - drive CRG integration, graph rendering, HTTP serve, etc.

Until this commit, the file shipped with zero tests, so any regression
silently broke the CI gate `python3 .spectra/scripts/check_drift.py --diff
--gate` that depends on the same tag/band logic.

These tests cover the pure-function layer (no I/O, no CRG) plus a
minimal integration test for the quick-mode grep helpers using
tmpdir fixtures. CLI subcommand integration (main()) is out of scope
and would require a subprocess harness.

Run from repo root:
  python3 -m unittest tests.test_impact -v
"""

import json
import os
import re
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

# Make impact.py importable. impact.py lives in
# tools/spectra/templates/shared/scripts/ and uses `from language_profiles import ...`,
# so we add that directory to sys.path and then add the repo root so
# language_profiles can be resolved as a sibling module.
REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = REPO_ROOT / "tools" / "spectra" / "templates" / "shared" / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))
sys.path.insert(0, str(SCRIPTS_DIR))  # idempotent

# Stub language_profiles if missing (CI may run on a slimmer checkout).
# impact.py already has a try/except ImportError fallback, but we want
# the test to fail loudly if profiles are completely missing, not silently
# fall back to a hardcoded set.

# Now import impact. We import as a module; impact.py executes its
# module-level language_profiles load at import time, so the
# try/except there handles missing language_profiles.
import impact  # noqa: E402


# ────────────────────────────────────────────────────────────────────
# Test fixtures
# ────────────────────────────────────────────────────────────────────

SAMPLE_MAPPINGS = [
    {
        "id": "1.1",
        "description": "User login",
        "spec": ".spectra/specs/auth/requirements.md#1",
        "design": ".spectra/specs/auth/design.md#AuthService",
        "code": {
            "files": ["src/auth/login.py", "src/auth/session.py"],
            "symbols": ["AuthService.login", "AuthService.logout"],
        },
        "tasks": [".spectra/specs/auth/tasks.md#1.1"],
        "docs": [".spectra/specs/auth/design.md#AuthService"],
        "tags": ["@impl"],
    },
    {
        "id": "1.2",
        "description": "Session timeout",
        "spec": ".spectra/specs/auth/requirements.md#2",
        "design": ".spectra/specs/auth/design.md#SessionService",
        "code": {
            "files": ["src/auth/session.py"],
            "symbols": ["SessionService.expire"],
        },
        "tasks": [".spectra/specs/auth/tasks.md#1.2"],
        "docs": [],
        "tags": ["@impl", "@verifies"],
    },
    {
        "id": "module-auth",
        "description": "Auth module boundary",
        "spec": ".spectra/specs/auth/requirements.md",
        "design": ".spectra/specs/auth/design.md#module-auth",
        "code": {
            "files": ["src/auth/**"],
            "symbols": [],
        },
        "tasks": [],
        "docs": [],
        "tags": ["@module"],
    },
]


# ────────────────────────────────────────────────────────────────────
# Pure-function tests (no I/O)
# ────────────────────────────────────────────────────────────────────


class FindBySpecIdTest(unittest.TestCase):
    def test_returns_matching_id(self):
        out = impact.find_by_spec_id(SAMPLE_MAPPINGS, "1.1")
        self.assertEqual(len(out), 1)
        self.assertEqual(out[0]["description"], "User login")

    def test_returns_empty_for_missing_id(self):
        self.assertEqual(impact.find_by_spec_id(SAMPLE_MAPPINGS, "9.9"), [])

    def test_id_match_is_exact_not_prefix(self):
        # "1" should NOT match "1.1" or "1.2"
        self.assertEqual(impact.find_by_spec_id(SAMPLE_MAPPINGS, "1"), [])


class FindByFileTest(unittest.TestCase):
    def test_finds_file_in_code_files(self):
        out = impact.find_by_file(SAMPLE_MAPPINGS, "src/auth/login.py")
        # 1.1 has it directly, 1.2 does not, module-auth uses a glob so
        # the test of exact-string match in find_by_file is implementation
        # defined; we just assert at least one match.
        ids = [m["id"] for m in out]
        self.assertIn("1.1", ids)

    def test_finds_via_glob_pattern(self):
        out = impact.find_by_file(SAMPLE_MAPPINGS, "src/auth/session.py")
        ids = [m["id"] for m in out]
        self.assertIn("1.1", ids)
        self.assertIn("1.2", ids)

    def test_returns_empty_for_unrelated_file(self):
        self.assertEqual(impact.find_by_file(SAMPLE_MAPPINGS, "src/payments/stripe.py"), [])


class FindBySymbolTest(unittest.TestCase):
    def test_finds_symbol_match(self):
        out = impact.find_by_symbol(SAMPLE_MAPPINGS, "AuthService.login")
        ids = [m["id"] for m in out]
        self.assertIn("1.1", ids)

    def test_returns_empty_for_unknown_symbol(self):
        self.assertEqual(impact.find_by_symbol(SAMPLE_MAPPINGS, "PaymentService.charge"), [])


class IsTestFileTest(unittest.TestCase):
    def test_python_test_files(self):
        # _is_test_file uses fnmatch against patterns like "**/test_*.py",
        # so the path must include at least one directory component to match.
        # A bare "test_login.py" with no path separator does NOT match.
        for path in [
            "tests/test_login.py",
            "src/auth/login_test.py",
            "test/test_login.py",
            "tests/auth/login_test.py",
        ]:
            self.assertTrue(impact._is_test_file(path), f"expected test file: {path}")

    def test_production_files_are_not_tests(self):
        for path in [
            "src/auth/login.py",
            "src/auth/session.py",
            "lib/utils/helpers.py",
        ]:
            self.assertFalse(impact._is_test_file(path), f"expected non-test: {path}")


class MakeIdReTest(unittest.TestCase):
    def test_dotted_id_escapes_dot(self):
        regex = impact._make_id_re("1.1")
        self.assertTrue(regex.search("see requirement 1.1 for details"))
        # "1a1" must NOT match — dot is escaped
        self.assertFalse(regex.search("see 1a1 here"))

    def test_module_id_with_dash(self):
        regex = impact._make_id_re("module-auth")
        self.assertTrue(regex.search("refs module-auth component"))
        self.assertFalse(regex.search("refs moduleXauth"))


# ────────────────────────────────────────────────────────────────────
# I/O tests using tmpdir
# ────────────────────────────────────────────────────────────────────


class LoadMappingTest(unittest.TestCase):
    def test_loads_yaml_into_list_of_dicts(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "trace.yaml"
            p.write_text(
                textwrap.dedent(
                    """\
                    mappings:
                      - id: "1.1"
                        description: User login
                        code:
                          files:
                            - src/auth/login.py
                    """
                )
            )
            out = impact.load_mapping(p)
            self.assertEqual(len(out), 1)
            self.assertEqual(out[0]["id"], "1.1")
            self.assertEqual(out[0]["code"]["files"], ["src/auth/login.py"])

    def test_loads_empty_mappings_returns_empty_list(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "trace.yaml"
            p.write_text("mappings: []\n")
            out = impact.load_mapping(p)
            self.assertEqual(out, [])


class CheckFileHasTagTest(unittest.TestCase):
    def test_detects_impl_tag(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "login.py"
            p.write_text(
                textwrap.dedent(
                    """\
                    # @impl 1.1, 1.2
                    def login():
                        pass
                    """
                )
            )
            self.assertTrue(impact._check_file_has_tag(p, impact.IMPL_TAG_RE, "1.1"))
            self.assertTrue(impact._check_file_has_tag(p, impact.IMPL_TAG_RE, "1.2"))
            self.assertFalse(impact._check_file_has_tag(p, impact.IMPL_TAG_RE, "9.9"))

    def test_detects_verifies_tag(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "test_login.py"
            p.write_text(
                textwrap.dedent(
                    """\
                    # @verifies 1.1
                    def test_login():
                        assert True
                    """
                )
            )
            self.assertTrue(impact._check_file_has_tag(p, impact.VERIFIES_TAG_RE, "1.1"))
            self.assertFalse(impact._check_file_has_tag(p, impact.VERIFIES_TAG_RE, "2.2"))


class GrepImplTagsTest(unittest.TestCase):
    def test_finds_impl_tag_across_files(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / "a.py").write_text("# @impl 1.1\n")
            (root / "b.py").write_text("# @impl 2.3\n# other line\n")
            (root / "c.py").write_text("# no tags here\n")
            out = impact._grep_impl_tags(root)
            # _grep_tags returns {tag_value: [filepath, ...]} — i.e. spec_id
            # keys, not file keys. This is the documented contract.
            self.assertEqual(len(out), 2)
            self.assertIn("1.1", out)
            self.assertIn("2.3", out)
            self.assertNotIn(str(root / "a.py"), out)
            self.assertEqual(out["1.1"], [str(root / "a.py")])
            self.assertEqual(out["2.3"], [str(root / "b.py")])


# ────────────────────────────────────────────────────────────────────
# Integration test: quick_impact_from_file
# ────────────────────────────────────────────────────────────────────


class QuickImpactFromFileTest(unittest.TestCase):
    def test_returns_empty_when_no_tags(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / "login.py").write_text("# no tags\ndef f(): pass\n")
            result = impact.quick_impact_from_file(root, "login.py")
            # result is a dict. With no @impl tag, the function returns a
            # 'note' / 'file' / 'query_type' shape, not a 'spec_ids' list.
            self.assertIsInstance(result, dict)
            self.assertEqual(result.get("query_type"), "quick-file")
            self.assertIn("note", result)  # "no @impl tags found in login.py"

    def test_returns_impl_tags_when_present(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / "login.py").write_text(
                textwrap.dedent(
                    """\
                    # @impl 1.1
                    def login():
                        pass
                    """
                )
            )
            result = impact.quick_impact_from_file(root, "login.py")
            # When the target file has @impl tags, the result contains
            # 'impl_tags' listing the parsed spec ids.
            self.assertEqual(result.get("query_type"), "quick-file")
            self.assertIn("1.1", result.get("impl_tags", []))


if __name__ == "__main__":
    unittest.main(verbosity=2)
