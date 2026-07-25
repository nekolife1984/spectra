# Skill Reference

> 📖 **日本語ガイドはこちら:** [スキルリファレンス (日本語)](ja/skill-reference.md)

Reference for the skills-mode workflow in cc-sdd. Use this guide when you installed a skills-mode agent such as `--claude-skills`, `--codex-skills`, `--cursor-skills`, `--copilot-skills`, `--windsurf-skills`, `--opencode-skills`, `--gemini-skills`, or `--antigravity`.

If you are using legacy `/spec:*` commands, use the [Command Reference](command-reference.md) instead.

## Start Here

Use this table when you are deciding which skill to run first.

| You want to... | Start with | Typical next step |
| --- | --- | --- |
| Route a new request | `/spectra-discovery` | `spectra-init`, `spectra-batch`, or direct implementation |
| Create one new spec | `/spectra-init` | `/spectra-requirements` |
| Create many specs from one initiative | `/spectra-batch` | Review generated specs, then `/spectra-impl` on the approved one(s) |
| Implement approved tasks | `/spectra-impl` | `/spectra-validate-impl` |
| Validate feature integration | `/spectra-validate-impl` | Fix findings or report `GO` / `NO-GO` / `MANUAL_VERIFY_REQUIRED` |
| Capture project memory | `/spectra-steering` or `/spectra-steering-custom` | Start or resume spec work |

## Workflow Skills

### `/spectra-discovery`

Use when you have new work but do not yet know whether it should become one spec, multiple specs, or no spec at all.

- What it does:
  - routes the request
  - refines scope
  - writes `brief.md` and, when needed, `roadmap.md`
  - suggests the next command and stops
- Typical outcomes:
  - extend an existing spec
  - implement directly with no spec
  - create one new spec
  - decompose into multiple specs

### `/spectra-batch`

Use when discovery or a roadmap already tells you the work should be split into multiple specs.

- What it does:
  - creates multiple specs in parallel
  - keeps cross-spec consistency
  - prepares a roadmap-shaped backlog instead of one oversized spec
- Typical next step:
  - review the generated specs
  - continue with the approved spec(s)

### `/spectra-impl`

Use when `tasks.md` is approved and you want to execute implementation.

- Modes:
  - autonomous mode: no task args, one task per iteration, fresh implementer + reviewer + debugger
  - manual mode: task args provided, TDD in main context with review gate
- Guarantees:
  - reviewer approval before completion
  - `spectra-verify-completion` before success claims
  - bounded remediation and debug loops

### `/spectra-validate-impl`

Use after implementation when you need feature-level validation across tasks.

- What it checks:
  - integration across tasks
  - requirements coverage
  - design alignment
  - full-suite evidence
- Possible outcomes:
  - `GO`
  - `NO-GO`
  - `MANUAL_VERIFY_REQUIRED`

## Supporting Skills

These are real skills, but many users meet them indirectly through `/spectra-impl`.

### `spectra-review`

Task-local adversarial review protocol.

- Used by:
  - reviewer subagents in autonomous mode
  - manual-mode review gate
- Checks:
  - spec compliance
  - boundary fit
  - mechanical verification
  - RED-phase evidence where required

### `spectra-debug`

Root-cause-first debug protocol.

- Used when:
  - implementer is blocked
  - reviewer rejection loops do not converge
  - validation uncovers a deeper issue
- Returns:
  - `ROOT_CAUSE`
  - `CATEGORY`
  - `FIX_PLAN`
  - `NEXT_ACTION`

### `spectra-verify-completion`

Fresh-evidence gate before success claims.

- Used before:
  - marking tasks complete
  - saying a fix works
  - reporting feature success
- Returns:
  - `VERIFIED`
  - `NOT_VERIFIED`
  - `MANUAL_VERIFY_REQUIRED`

## Inside `/spectra-impl`: Dispatch and Iteration

Most of the "what is a subagent here?" question lives inside `/spectra-impl`. Unlike the legacy `--claude-agent` install target, skills mode does not rely on pre-defined subagent files under `.claude/agents/spec/`. Implementation dispatch is owned by the skill itself.

### Dynamic dispatch, not static agent files

- There is no `tdd-task-implementer.md` or similar file under `.claude/agents/`.
- `/spectra-impl` spawns fresh execution contexts on demand through each platform's native subagent primitive (for example, Claude Code's Task tool), using prompt templates kept under the skill.
- This is what lets the same `/spectra-impl` skill work across Claude Code, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, and Antigravity without maintaining a separate agent file per platform.

### Per-task role trio

Each task may involve up to three roles dispatched by `/spectra-impl`:

- **Implementer** — fresh execution context that builds a Task Brief from the spec, then implements with TDD (RED → GREEN under the Feature Flag Protocol).
- **Reviewer** — independent pass that runs `git diff`, greps for TODOs, runs the test suite, and checks task-boundary compliance.
- **Debugger** — triggered when the implementer is BLOCKED, or when the reviewer rejects after 2 remediation rounds. Investigates root causes in a clean context (with web search), produces a fix plan, and hands off to a new implementer. Max 2 debug rounds per task.

These three roles correspond to the three supporting skills above (`spectra-review`, `spectra-debug`, `spectra-verify-completion`). The dispatch is dynamic — no file under `.claude/agents/` needs to exist.

### Learnings propagation

When a task reveals cross-cutting insights (for example "better-sqlite3 needs Electron-specific ABI rebuild"), the finding is recorded under `## Implementation Notes` in `tasks.md` and injected into subsequent implementer prompts. This is how later tasks benefit from what earlier tasks discovered.

### 1 task per iteration

Each iteration processes a single task. This keeps context hygiene across long autonomous runs, makes `/spectra-impl` safe to re-run after interruption, and bounds the scope of review and debug passes.

## Skills mode vs `--claude-agent`

Skills mode and the legacy `--claude-agent` install target take fundamentally different approaches to subagent work. Both are valid; choose the one that fits your workflow.

| Concern | `--claude-agent` (legacy) | Skills mode |
| --- | --- | --- |
| Subagent definitions | Static `.claude/agents/spec/*.md` files | Prompt templates inside skills, dispatched dynamically |
| Cross-platform | Claude Code only | 8 platforms |
| Spec generation (`spectra-quick`) | Four-phase Subagent orchestration | Inline `spectra-quick` skill that sequences the four spec skills |
| Parallel spec batch | Not available | `/spectra-batch` with cross-spec review |
| Implementation | Manual via `/spec:spectra-impl` | Autonomous or manual via `/spectra-impl` |
| Review process | Manual or via `validate-impl` | Built-in independent reviewer pass |
| Debug on failure | Not available | Auto debug pass (max 2 rounds) with web search |
| Session resume | Start fresh | Safe to re-run after interruption |
| External dependencies | None | None (native subagent primitive only) |

For the `--claude-agent` details, see [Claude Code Subagents Workflow](claude-subagents.md).

## Customizing skills-mode dispatch

Because skills mode generates prompts dynamically, customization works differently than editing `.claude/agents/spec/*.md` files.

1. **Steering documents** — the primary lever. Implementer and reviewer contexts inherit rules from steering, so update `{{SPECTRA_DIR}}/steering/*.md` for architecture and convention changes.
2. **Templates and rules** — update `{{SPECTRA_DIR}}/settings/templates/*.md` and `{{SPECTRA_DIR}}/settings/rules/*.md` to influence the Task Brief and review criteria.
3. **Skill files** — advanced users can edit the installed `SKILL.md` files under `.claude/skills/` (or the equivalent per platform) to adjust dispatch behaviour, review gates, or iteration strategy.

## Skills vs Commands

| Area | Skills mode | Legacy commands |
| --- | --- | --- |
| New-work entry point | `/spectra-discovery` | none |
| Multi-spec creation | `/spectra-batch` | none |
| Implementation | `/spectra-impl` | `/spec:spectra-impl` |
| Integration validation | `/spectra-validate-impl` | `/spec:validate-impl` |
| Review/debug/completion gates | explicit skills | embedded in command flow or external process |

## Recommended Reading Order

1. [Spec-Driven Development Workflow](spec-driven.md)
2. This skill reference
3. [Command Reference](command-reference.md) only if you need legacy mode

