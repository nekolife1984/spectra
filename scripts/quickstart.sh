#!/bin/bash
# quickstart.sh — One-command spectra + CRG setup
#
# Usage:
#   # Run directly from GitHub (recommended)
#   bash <(curl -s https://raw.githubusercontent.com/nekolife1984/spectra/main/scripts/quickstart.sh)
#
#   # Or clone first
#   git clone https://github.com/nekolife1984/spectra.git
#   bash spectra/scripts/quickstart.sh
#
# This script:
#   1. Installs spectra skills and templates
#   2. Installs and configures code-review-graph
#   3. Initializes .trace-mapping.yaml
#   4. Saves initial snapshot
#   5. (opt-in) Copies CI/CD templates

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}ℹ️  $1${NC}"; }
ok()    { echo -e "${GREEN}✅ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()   { echo -e "${RED}❌ $1${NC}"; }

# ── Config ─────────────────────────────────────────────
GITHUB_REPO="nekolife1984/spectra"
RAW_BASE="https://raw.githubusercontent.com/$GITHUB_REPO/main"
REPO_URL="https://github.com/$GITHUB_REPO.git"
TMP_DIR=""

cleanup() {
  [ -n "$TMP_DIR" ] && rm -rf "$TMP_DIR" 2>/dev/null || true
}
trap cleanup EXIT

echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  spectra + CRG Setup${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

# ── Step 0: Prerequisites ──────────────────────────────
info "Step 0/4: Checking prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js not found. Install from https://nodejs.org"
  exit 1
fi

PYTHON=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then
    PYTHON="$cmd"
    break
  fi
done
if [ -z "$PYTHON" ]; then
  err "Python not found. Install from https://python.org"
  exit 1
fi

if ! command -v npx &>/dev/null; then
  err "npx not found. Run: npm install -g npx"
  exit 1
fi

ok "Node.js, Python ($($PYTHON --version 2>&1 || true)), npx available"

# ── Step 1: Install spectra ────────────────────────
info "Step 1/4: Installing spectra..."

echo ""
echo "  Select your AI coding agent:"
echo "  [1] Claude Code (default)"
echo "  [2] Codex"
echo "  [3] Cursor"
echo "  [4] GitHub Copilot"
echo "  [5] Gemini CLI"
echo "  [6] Windsurf"
echo "  [7] OpenCode"
echo "  [8] Antigravity"
echo -n "  Choice (1-8, Enter=1): "
read -r AGENT_CHOICE

case "${AGENT_CHOICE:-1}" in
  1) AGENT_FLAG="";;
  2) AGENT_FLAG="--codex-skills";;
  3) AGENT_FLAG="--cursor-skills";;
  4) AGENT_FLAG="--github-copilot-skills";;
  5) AGENT_FLAG="--gemini-cli-skills";;
  6) AGENT_FLAG="--windsurf-skills";;
  7) AGENT_FLAG="--opencode-skills";;
  8) AGENT_FLAG="--antigravity-skills";;
  *) AGENT_FLAG="";;
esac

echo ""
echo "  Select template language:"
echo "  [1] English (default)"
echo "  [2] Japanese"
echo -n "  Choice (1-2, Enter=1): "
read -r LANG_CHOICE

case "${LANG_CHOICE:-1}" in
  1) LANG_FLAG="";;
  2) LANG_FLAG="--lang ja";;
  *) LANG_FLAG="";;
esac

echo ""
echo "  Settings directory (where settings and steering are stored):"
echo -n "  Path (Enter=.spectra): "
read -r SPECTRA_DIR_INPUT
SPEC_FLAG=""
if [ -n "$SPECTRA_DIR_INPUT" ]; then
  SPEC_FLAG="--spectra-dir $SPECTRA_DIR_INPUT"
fi

echo ""
echo "  Specs directory (where specification docs are stored):"
echo -n "  Path (Enter=docs): "
read -r SPECS_DIR_INPUT
SPECS_FLAG=""
if [ -n "$SPECS_DIR_INPUT" ]; then
  SPECS_FLAG="--specs-dir $SPECS_DIR_INPUT"
fi

echo ""
info "Running: npx github:$GITHUB_REPO $AGENT_FLAG $LANG_FLAG $SPEC_FLAG $SPECS_FLAG"
npx "github:$GITHUB_REPO" $AGENT_FLAG $LANG_FLAG $SPEC_FLAG $SPECS_FLAG
ok "spectra installation complete"

# ── Step 2: CRG Setup ──────────────────────────────────
info "Step 2/4: Setting up code-review-graph..."

SETUP_CRG=".spectra/scripts/setup-crg.sh"
if [ -f "$SETUP_CRG" ]; then
  info "setup-crg.sh already exists"
else
  mkdir -p .spectra/scripts
  info "Downloading setup-crg.sh..."
  curl -sSL "$RAW_BASE/.spectra/scripts/setup-crg.sh" -o "$SETUP_CRG"
  chmod +x "$SETUP_CRG"
  ok "setup-crg.sh downloaded"
fi

echo ""
info "Running: bash $SETUP_CRG --yes"
if [ -n "$AGENT_FLAG" ]; then
  case "$AGENT_FLAG" in
    *claude-code*)    CRG_PLATFORM="claude-code" ;;
    *codex*)          CRG_PLATFORM="codex" ;;
    *cursor*)         CRG_PLATFORM="cursor" ;;
    *copilot*)        CRG_PLATFORM="copilot" ;;
    *gemini*)         CRG_PLATFORM="gemini-cli" ;;
    *windsurf*)       CRG_PLATFORM="windsurf" ;;
    *opencode*)       CRG_PLATFORM="opencode" ;;
    *)                CRG_PLATFORM="" ;;
  esac
  bash "$SETUP_CRG" --yes --platform "$CRG_PLATFORM"
else
  bash "$SETUP_CRG" --yes
fi

ok "code-review-graph setup complete"

# ── Step 3: Initialize .trace-mapping.yaml ─────────────
info "Step 3/4: Checking .trace-mapping.yaml..."

if [ -f ".trace-mapping.yaml" ]; then
  ok ".trace-mapping.yaml already exists"
elif [ -f ".trace-mapping.example.yaml" ]; then
  cp ".trace-mapping.example.yaml" ".trace-mapping.yaml"
  ok "Created .trace-mapping.yaml from .trace-mapping.example.yaml"
else
  warn ".trace-mapping.yaml not found. Create one manually later."
fi

# ── Step 4: Initial Snapshot ───────────────────────────
info "Step 4/4: Saving initial snapshot..."

if [ -f ".spectra/scripts/check_drift.py" ]; then
  $PYTHON .spectra/scripts/check_drift.py --snapshot 2>/dev/null && \
    ok "Initial snapshot saved" || \
    warn "Snapshot failed (rerun later when code exists)"
else
  warn "check_drift.py not found"
fi

# ── Step 5: CI/CD Templates (opt-in) ──────────────────
echo ""
info "Step 5/5: CI/CD Templates (optional)..."
echo ""
echo "  spectra includes CI/CD templates for GitHub Actions:"
echo "    • traceability-check.yml — 3-stage gate (PR blocking)"
echo "    • ci-check.sh — local equivalent for pre-push"
echo ""
echo -n "  Copy CI/CD templates to this project? (y/N): "
read -r CI_CHOICE

case "${CI_CHOICE:-n}" in
  y|Y|yes|YES)
    # Try to find template files
    TEMPLATE_SRC=""
    # Check if we're in a clone of the repo
    if [ -f "tools/spectra/templates/shared/.github/workflows/traceability-check.yml" ]; then
      TEMPLATE_SRC="tools/spectra/templates/shared"
    # Check if it was installed via npx (look in common locations)
    elif [ -f ".agents/skills/.gitattributes" ] && [ -d "tools" ]; then
      TEMPLATE_SRC="tools/spectra/templates/shared"
    fi

    if [ -n "$TEMPLATE_SRC" ]; then
      # GitHub Actions workflow
      mkdir -p .github/workflows
      cp "$TEMPLATE_SRC/.github/workflows/traceability-check.yml" \
        .github/workflows/traceability-check.yml 2>/dev/null && \
        ok "Copied .github/workflows/traceability-check.yml" || \
        warn "Failed to copy GitHub Actions workflow"

      # ci-check.sh
      if [ -f "$TEMPLATE_SRC/scripts/ci-check.sh" ]; then
        cp "$TEMPLATE_SRC/scripts/ci-check.sh" .spectra/scripts/ci-check.sh 2>/dev/null && \
          chmod +x .spectra/scripts/ci-check.sh 2>/dev/null && \
          ok "Copied .spectra/scripts/ci-check.sh" || \
          warn "Failed to copy ci-check.sh"
      fi
    else
      warn "Template files not found locally."
      echo "  To install manually, run from the spectra repo:"
      echo "    cp tools/spectra/templates/shared/.github/workflows/traceability-check.yml .github/workflows/"
      echo "    cp tools/spectra/templates/shared/scripts/ci-check.sh .spectra/scripts/"
    fi
    ;;
  *)
    info "Skipping CI/CD templates. Install later with:"
    echo "  cp tools/spectra/templates/shared/.github/workflows/traceability-check.yml .github/workflows/"
    echo "  cp tools/spectra/templates/shared/scripts/ci-check.sh .spectra/scripts/"
    ;;
esac

# ── Completion ─────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "  Get started with:"
echo ""

case "${AGENT_CHOICE:-1}" in
  2) PREFIX='$';;
  *) PREFIX='/';;
esac

echo "    ${PREFIX}spectra-discovery \"your idea\""
echo "    ${PREFIX}spectra-init my-feature"
echo "    ${PREFIX}spectra-requirements my-feature"
echo "    ${PREFIX}spectra-design my-feature"
echo "    ${PREFIX}spectra-tasks my-feature"
echo "    ${PREFIX}spectra-impl my-feature"
echo ""
echo "  CRG Traceability:"
echo "    ${PREFIX}spectra-trace 1.1"
echo "    ${PREFIX}spectra-impact src/my-file.py"
echo "    ${PREFIX}spectra-validate-boundary"
echo ""
echo "  Rebuild code graph:"
echo "    code-review-graph build"
echo ""
