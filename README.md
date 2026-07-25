# spectra

**Spec** → **Trace** → **Spectra**. \
A modern spec-driven SDLC toolchain with bidirectional traceability.

Built on the foundation of [cc-sdd](https://github.com/gotalab/cc-sdd) — a philosophy of _spec-as-contract_ — and supercharged with **code-review-graph (CRG)** integration, spectra traces requirements through design, implementation, and tests via `@impl` / `@verifies` / `@spec` tags. It analyzes impact scope, detects spec drift, and validates boundaries — all across 17 languages and 8 AI coding agents.

### 🏷️ About the Name

**Spectra** = **Spec** + **Trace**. \
Just as a prism splits light into a spectrum, spectra splits your development into traceable layers — requirements → design → code → tests — and illuminates how they're connected. The name also nods to the project's roots: **cc** (Contract Code), **sdd** (Spec-Driven Development), and **graph** (code-review-graph) — evolved into a single, cohesive identity.

## Quick Start

### macOS / Linux
```bash
bash <(curl -s https://raw.githubusercontent.com/nekolife1984/spectra/main/scripts/quickstart.sh)
```

### Windows (PowerShell)
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/nekolife1984/spectra/main/scripts/quickstart.ps1 -OutFile quickstart.ps1
.\quickstart.ps1
```

The script automates:
1. Install spectra skills (choose agent & language)
2. Install and configure code-review-graph
3. Build the initial code graph
4. Initialize `.trace-mapping.yaml`
5. Set up pre-commit hook (auto snapshot on every commit)
6. Save initial snapshot

## Manual Setup

```bash
# Skills only
npx github:nekolife1984/spectra

# CRG only (after skills install)
bash .agents/scripts/setup-crg.sh --yes
```

## Features

### 20 spec Skills
| Phase | Skills |
|-------|--------|
| Discovery | `spec-discovery`, `spec-steering` |
| Specification | `spec-init`, `spec-requirements`, `spec-design`, `spec-tasks` |
| Batch | `spec-batch`, `spec-quick` |
| Implementation | `spec-impl` |
| Review | `spec-review`, `spec-validate-design`, `spec-validate-gap`, `spec-validate-impl` |
| Debug | `spec-debug` |
| Completion | `spec-verify-completion` |
| Status | `spec-status` |
| **CRG Traceability** | **`spec-trace`**, **`spec-impact`**, **`spec-validate-boundary`** |

### CRG-Enhanced Skills (15 of 20)
Most skills integrate with code-review-graph for graph-aware code analysis:

| Skill | CRG Integration |
|-------|----------------|
| `spec-discovery` | Auto-assess impact scope when extending existing specs |
| `spec-design` | Code graph analysis to inform architecture design |
| `spec-tasks` | Machine-verify `_Boundary:_` against actual code graph |
| `spec-init` | Auto-generate `.trace-mapping.yaml` skeleton |
| `spec-batch` | Auto-generate `.trace-mapping.yaml` for all specs |
| `spec-review` | CRG-enhanced boundary respect check |
| `spec-impl` | Auto-scan `@impl` tags and update `.trace-mapping.yaml` |
| `spec-validate-impl` | CRG flow validation |
| `spec-debug` | CRG graph investigation |
| `spec-verify-completion` | CRG architecture alignment check |
| `spec-validate-design` | Verify design components exist in code |
| `spec-validate-gap` | Detect code without spec / spec without code |
| `spec-trace` | Spec ID → code impact trace |
| `spec-impact` | Code change → spec impact trace |
| `spec-validate-boundary` | Machine-verify `_Boundary:_` vs CRG graph |

### Other
- **8 agents**: Claude Code, Codex, Cursor, Copilot, Gemini CLI, Windsurf, OpenCode, Antigravity
- **13 languages**: Templates rendered in your chosen language via `--lang`
- **Japanese templates**: `--lang ja` for requirements, design, and tasks in Japanese
- **Pre-commit hook**: Auto-updates traceability snapshot on every commit (set up by `setup-crg.sh`)
- **CI/CD gate**: `python3 .agents/scripts/check_drift.py --diff --gate` detects spec drift in CI

## Documentation

- [Package README (English)](./tools/cc-sdd/README.md)
- [Package README (日本語)](./tools/cc-sdd/README_ja.md)
- [Package README (繁體中文)](./tools/cc-sdd/README_zh-TW.md)
- [Setup Guide](./.agents/scripts/README.md)

## License

MIT
