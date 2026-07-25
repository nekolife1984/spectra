# Agentic SDLC and Spec-Driven Development

Spec-style Spec-Driven Development on an agentic SDLC.
Powered by [**spectra**](https://github.com/nekolife1984/spectra) — Spec → Code bidirectional traceability with CRG integration.

> **Spectra** = **Spec** + **Trace**. The name reflects how the toolchain splits development into traceable layers (requirements → design → code → tests) like a prism splits light into a spectrum, and traces how they're connected.

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
- Phase 0 (optional): `/spectra-steering`, `/spectra-steering-custom`
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
Skills are located in `.agents/skills/spectra-*/SKILL.md` (or agent-specific paths like `.claude/skills/`, `.opencode/skills/`, etc.)
- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `spectra-review` — task-local adversarial review protocol used by reviewer subagents
- `spectra-debug` — root-cause-first debug protocol used by debugger subagents
- `spectra-verify-completion` — fresh-evidence gate before success or completion claims
- `spectra-trace` — trace spec changes to code impact (requires `.trace-mapping.yaml`)
- `spectra-impact` — trace code changes back to affected specs
- `spectra-validate-boundary` — mechanically verify `_Boundary:_` against CRG code graph
- **CRG MCP tools** (code-review-graph) are used by design, review, validation, and debug skills for code-graph-aware impact analysis
- **Traceability**: Projects with `.trace-mapping.yaml` get automated impact analysis via `.agents/scripts/impact.py` and drift detection via `.agents/scripts/check_drift.py`
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
