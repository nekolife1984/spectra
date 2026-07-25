# Agentic SDLC and Spec-Driven Development

spectra-style Spec-Driven Development on an agentic SDLC

## Project Context

### Paths
- Steering: `{{SPECTRA_DIR}}/steering/`
- Specs: `{{SPECS_DIR}}/`

### Steering vs Specification

**Steering** (`{{SPECTRA_DIR}}/steering/`) - Guide AI with project-wide rules and context
**Specs** (`{{SPECS_DIR}}/`) - Formalize development process for individual features

### Active Specifications
- Check `{{SPECS_DIR}}/` for active specifications
- Use `/spectra-status [feature-name]` to check progress

## Development Guidelines
{{DEV_GUIDELINES}}

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
- Phase 2 (Implementation): `/spectra-impl {feature} [tasks] [--review required|inline|off]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `--review off` skips task-local review; use it intentionally and keep `/spectra-validate-impl {feature}` as the final quality gate
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
- Load entire `{{SPECTRA_DIR}}/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/spectra-steering-custom`)
