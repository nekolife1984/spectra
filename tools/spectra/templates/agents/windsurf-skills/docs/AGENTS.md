# Agentic SDLC and Spec-Driven Development

spectra-style Spec-Driven Development on an agentic SDLC

## Project Memory
Project memory keeps persistent guidance (steering, specs notes, component docs) so Windsurf honors your standards each run. Treat it as the long-lived source of truth for patterns, conventions, and decisions.

- Use `{{SPECTRA_DIR}}/steering/` for project-wide policies: architecture principles, naming schemes, security constraints, tech stack decisions, api standards, etc.
- Use local `AGENTS.md` files for feature or library context (e.g. `src/lib/payments/AGENTS.md`): describe domain assumptions, API contracts, or testing conventions specific to that folder. Windsurf auto-loads these when working in the matching path.
- Specs notes stay with each spec (under `{{SPECS_DIR}}/specs/`) to guide specification-level workflows.

## Project Context

### Paths
- Steering: `{{SPECTRA_DIR}}/steering/`
- Specs: `{{SPECS_DIR}}/specs/`

### Steering vs Specification

**Steering** (`{{SPECTRA_DIR}}/steering/`) - Guide AI with project-wide rules and context
**Specs** (`{{SPECS_DIR}}/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `{{SPECS_DIR}}/specs/` for active specifications
- Use `@spectra-status [feature-name]` to check progress

## Development Guidelines
<!-- DEV_GUIDELINES: injected at install time with language-specific guidelines (npx github:nekolife1984/spectra --lang <code>) -->
{{DEV_GUIDELINES}}

## Minimal Workflow
- Phase 0 (optional): `@spectra-steering`, `@spectra-steering-custom`
- Discovery: `@spectra-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `@spectra-quick {feature} [--auto]` or step by step:
    - `@spectra-init "description"`
    - `@spectra-requirements {feature}`
    - `@spectra-validate-gap {feature}` (optional: for existing codebase)
    - `@spectra-design {feature} [-y]`
    - `@spectra-validate-design {feature}` (optional: design review)
    - `@spectra-tasks {feature} [-y]`
  - Multi-spec: `@spectra-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `@spectra-impl {feature} [tasks] [--review required|inline|off]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `--review off` skips task-local review; use it intentionally and keep `@spectra-validate-impl {feature}` as the final quality gate
  - `@spectra-validate-impl {feature}` (standalone re-validation)
- Progress check: `@spectra-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.windsurf/skills/spectra-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Use `/skills` to inspect currently available skills
- Invoke a skill directly with `@spec-<skill-name>`
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.
- `spectra-review` — task-local adversarial review protocol used by reviewer subagents
- `spectra-debug` — root-cause-first debug protocol used by debugger subagents
- `spectra-verify-completion` — fresh-evidence gate before success or completion claims

> Windsurf does not support programmatic sub-agent dispatch. Skills that reference parallel sub-agents will execute sequentially in the main context.

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `@spectra-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `{{SPECTRA_DIR}}/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `@spectra-steering-custom`)
