# Agentic SDLC and Spec-Driven Development

spectra-style Spec-Driven Development on an agentic SDLC

## CRG MCP Tools (code-review-graph)

This project integrates **code-review-graph (CRG)** MCP tools for code-graph-aware impact analysis across all phases:

- **spectra-design**: Uses `get_architecture_overview_tool`, `semantic_search_nodes_tool`, `query_graph_tool` during codebase analysis
- **spectra-tasks**: Validates `_Boundary:_` annotations against `get_impact_radius_tool`
- **spectra-review**: Enhanced Boundary Respect check with CRG impact radius verification
- **spectra-validate-impl**: Uses `get_affected_flows_tool` for cross-task integration validation
- **spectra-debug**: Uses `query_graph_tool` and `get_impact_radius_tool` for root cause investigation
- **spectra-trace**: Traces spec changes to code impact
- **spectra-impact**: Traces code changes back to affected specs
- **spectra-validate-boundary**: Mechanically verifies `_Boundary:_` against CRG graph

## Traceability

Projects can maintain a `.trace-mapping.yaml` file linking spec IDs to code files, symbols, tasks, and docs.
Scripts in `.spectra/scripts/` provide automated impact analysis:

| Script | Purpose |
|--------|---------|
| `extract_tags.py` | Extract `@impl`/`@module`/`@feature`/`@verifies` from code, `@spec`/`@design`/`@satisfies` from spec docs |
| `impact.py` | Bidirectional spec\u2194code impact analysis (`--quick` for grep-based mode without .trace-mapping.yaml) |
| `check_drift.py` | Snapshot-based drift detection between code and specs |
| `check-trace-completeness.py` | **Gate**: Verify @impl, code.files, code.symbols, @module, _Requirements:_, _Depends:_, @spec, @design, @satisfies, and @verifies traceability |

## Project Context

### Paths
- Steering: `.spectra/steering/`
- Specs: `.spectra/specs/`

### Steering vs Specification

**Steering** (`.spectra/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.spectra/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.spectra/specs/` for active specifications
- Use `/spectra-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in English. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (recommended for first run; required if you want steering context to inform later skills): `/spectra-steering`, `/spectra-steering-custom`
  - `spectra-steering` auto-detects Bootstrap Mode when `.spectra/steering/{product,tech,structure}.md` are missing and generates them from your codebase. Run it **before** `/spectra-discovery` on a new project so discovery's questions are answered from context, not from you.
- Discovery: `/spectra-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `/spectra-quick {feature} [--auto]` or step by step:
    - `/spectra-init "description"`
    - `/spectra-requirements {feature}`
    - `/spectra-validate-gap {feature}` (optional: for existing codebase)
    - `/spectra-design {feature} [-y]`
    - `/spectra-validate-design {feature}` (optional: design review)
    - `/spectra-tasks {feature} [-y]`
  - Multi-spec: `/spectra-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `/spectra-impl {feature} [tasks]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks only in main context)
  - `/spectra-validate-impl {feature}` (standalone re-validation)
- Progress check: `/spectra-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.claude/skills/spectra-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `spectra-review` — task-local adversarial review protocol used by reviewer subagents
- `spectra-debug` — root-cause-first debug protocol used by debugger subagents
- `spectra-verify-completion` — fresh-evidence gate before success or completion claims
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/spectra-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.spectra/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/spectra-steering-custom`)
