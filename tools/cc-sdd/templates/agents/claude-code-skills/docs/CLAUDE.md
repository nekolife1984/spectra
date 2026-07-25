# Agentic SDLC and Spec-Driven Development

spec-style Spec-Driven Development on an agentic SDLC

## Project Context

### Paths
- Steering: `{{SPEC_DIR}}/steering/`
- Specs: `{{SPEC_DIR}}/specs/`

### Steering vs Specification

**Steering** (`{{SPEC_DIR}}/steering/`) - Guide AI with project-wide rules and context
**Specs** (`{{SPEC_DIR}}/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `{{SPEC_DIR}}/specs/` for active specifications
- Use `/spec-status [feature-name]` to check progress

## Development Guidelines
{{DEV_GUIDELINES}}

## Minimal Workflow
- Phase 0 (optional): `/spec-steering`, `/spec-steering-custom`
- Discovery: `/spec-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `/spec-quick {feature} [--auto]` or step by step:
    - `/spec-init "description"`
    - `/spec-requirements {feature}`
    - `/spec-validate-gap {feature}` (optional: for existing codebase)
    - `/spec-design {feature} [-y]`
    - `/spec-validate-design {feature}` (optional: design review)
    - `/spec-tasks {feature} [-y]`
  - Multi-spec: `/spec-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `/spec-impl {feature} [tasks] [--review required|inline|off]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `--review off` skips task-local review; use it intentionally and keep `/spec-validate-impl {feature}` as the final quality gate
  - `/spec-validate-impl {feature}` (standalone re-validation)
- Progress check: `/spec-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.claude/skills/spec-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `spec-review` — task-local adversarial review protocol used by reviewer subagents
- `spec-debug` — root-cause-first debug protocol used by debugger subagents
- `spec-verify-completion` — fresh-evidence gate before success or completion claims
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `{{SPEC_DIR}}/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/spec-steering-custom`)
