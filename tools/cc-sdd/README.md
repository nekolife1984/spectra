# cc-sdd: Long-running spec-driven implementation for AI coding agents

[![npm version](https://img.shields.io/npm/v/cc-sdd?logo=npm)](https://www.npmjs.com/package/cc-sdd?activeTab=readme)
[![install size](https://packagephobia.com/badge?p=cc-sdd)](https://packagephobia.com/result?p=cc-sdd)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

<div align="center" style="margin-bottom: 1rem; font-size: 1.1rem;"><sub>
English | <a href="./README_ja.md">日本語</a> | <a href="./README_zh-TW.md">繁體中文</a>
</sub></div>

**Turn approved specs into long-running autonomous implementation.** One command installs an agentic SDLC workflow as Agent Skills: discovery, requirements, design, tasks, and autonomous implementation with per-task independent review. Works across 8 AI coding agents, with the same 17-skill set on each.

👻 **Spec-inspired.** Similar spec-driven, agentic SDLC style as Spec IDE. Existing Spec specs remain compatible and portable.

## What's new in v3.0

cc-sdd v3.0 is a rework around Agent Skills and long-running autonomous implementation.

- **`/spec-discovery` as the new entry point.** Discovery routes new work into one of: extend an existing spec, implement directly with no spec, create one new spec, decompose into multiple specs, or mixed decomposition. It writes `brief.md` and, when needed, `roadmap.md`, so you can resume a workstream without re-explaining scope.
- **`/spec-impl` for long-running autonomous implementation.** Each task gets a fresh implementer running TDD (RED → GREEN) behind a feature flag, an independent reviewer, and an auto-debug pass that investigates root causes in a clean context when the implementer is blocked or the reviewer rejects twice. Learnings from earlier tasks propagate forward via `## Implementation Notes` in `tasks.md`. 1 task per iteration, safe to re-run after interruption.
- **Boundary-first spec discipline.** `design.md` now includes a File Structure Plan that drives task boundaries. Tasks carry `_Boundary:_` and `_Depends:_` annotations. Review and validation look for boundary violations, not just style issues.
- **`/spec-batch` for multi-spec initiatives.** Turn a roadmap into multiple specs in parallel, with cross-spec review to catch contradictions, duplicated responsibilities, and interface mismatches.
- **Agent Skills across 8 coding agents.** 17 skills per install, loaded on demand (progressive disclosure). Claude Code and Codex are stable; Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, and Antigravity are in beta. No external dependencies; subagents are spawned through each platform's native primitive.

Full skills-mode workflow and `/spec-impl` internals: [Skill Reference](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/skill-reference.md).

Upgrading from v1.x or v2.x? See the [Migration Guide](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/migration-guide.md#5-v2x-to-v30).

## Why cc-sdd?

cc-sdd treats the spec as a contract between parts of the system, not a master command document handed to the agent. Code remains the source of truth. Specs make the boundaries between parts of the code explicit so humans and agents can work in parallel without constant synchronization.

The bet: explicit contracts at the right granularity let AI-driven development at team scale move faster, not slower. Agents write the spec, humans approve the contract at phase gates, code is what ships.

Boundaries are not overhead. They are what lets you move freely inside while protecting the outside.

Full rationale, trade-offs, and when-to-use / when-not-to-use: [Why cc-sdd? A philosophy note](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/why-cc-sdd.md).

## Quick Start

```bash
cd your-project
npx github:nekolife1984/spectra
```

The default installs **Claude Code Skills** with English docs. To pick another agent or language:

```bash
npx github:nekolife1984/spectra --codex-skills --lang ja      # Codex, Japanese
npx github:nekolife1984/spectra --cursor-skills --lang zh-TW  # Cursor IDE, Traditional Chinese
```

Supports 8 AI coding agents (Claude Code and Codex stable; Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, and Antigravity in beta) and 13 languages. See [Supported Agents](#supported-agents) for the full list.

### Optional: CRG Traceability Setup

After installation, optionally install **code-review-graph** for code-graph-aware spec→code impact analysis:

```bash
bash .agents/scripts/setup-crg.sh
```

This enables:
- `/spec-trace <spec-id>` — trace spec changes to code impact
- `/spec-impact <file>` — trace code changes back to affected specs
- `/spec-validate-boundary` — mechanically verify `_Boundary:_` against code graph
- CRG-enhanced design review, gap analysis, completion verification, and more (15 skills total)
- Pre-commit hook for automatic snapshot updates on every commit

See [Setup Guide](./.agents/scripts/README.md) for more options including `--yes` and `--platform` flags.

Then, in your agent:

```bash
/spec-discovery <idea>
```

Not sure where to start? Start with `spec-discovery`. It routes your request and tells you what command to run next.

### Common workflows

| You want to... | Skills mode |
|---|---|
| Start a new feature or product-sized idea | `spec-discovery` → `spec-init` → `spec-requirements` → `spec-design` → `spec-tasks` → `spec-impl` |
| Extend an existing system | `spec-steering` → `spec-discovery` or `spec-init` → optional `spec-validate-gap` → `spec-design` → `spec-tasks` → `spec-impl` |
| Break down a large initiative | `spec-discovery` → `spec-batch` |
| Implement a small change with no spec | `spec-discovery` → direct implementation |

Legacy `/spec:*` command modes are still available (`--claude`, `--cursor`, etc.) but are deprecated. See the [Migration Guide](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/migration-guide.md) for the upgrade path.

For larger approved task sets, run `spec-impl` to start autonomous implementation with per-task subagent spawn, independent review, and auto-debug on failure.

## See It In Action

Example: build a new Photo Albums feature.

```bash
/spec-discovery Photo albums with upload, tagging, and sharing
# discovery writes brief.md (and roadmap.md when multi-spec) and suggests the next command
/spec-init photo-albums
/spec-requirements photo-albums
/spec-design photo-albums
/spec-tasks photo-albums
/spec-impl photo-albums
# autonomous: fresh implementer, independent reviewer, and auto-debug per task
```

Typical spec outputs (under 10 minutes):

- `requirements.md`: EARS-format requirements with acceptance criteria.
- `design.md`: architecture with Mermaid diagrams and a File Structure Plan.
- `tasks.md`: implementation tasks with boundaries and dependency annotations.

Then `/spec-impl` runs the tasks autonomously with TDD (RED → GREEN) behind feature flags, an independent reviewer pass, and auto-debug on failure.

## Supported Agents

All 8 skills variants ship the same 17-skill set. The difference is how much real-world usage each platform integration has seen.

| Agent | Skills mode | Stability | Legacy mode |
|---|---|---|---|
| **Claude Code** | `--claude-skills` | Stable | `--claude` / `--claude-agent` (deprecated) |
| **Codex** | `--codex-skills` | Stable | `--codex` (blocked) |
| **Cursor IDE** | `--cursor-skills` | Beta | `--cursor` (deprecated) |
| **GitHub Copilot** | `--copilot-skills` | Beta | `--copilot` (deprecated) |
| **Windsurf IDE** | `--windsurf-skills` | Beta | `--windsurf` (deprecated) |
| **OpenCode** | `--opencode-skills` | Beta | `--opencode` / `--opencode-agent` (deprecated) |
| **Gemini CLI** | `--gemini-skills` | Beta | `--gemini` (deprecated) |
| **Antigravity** | `--antigravity` | Beta (experimental) | — |
| **Qwen Code** | — | — | `--qwen` |

"Beta" does not mean "missing features", the 17 skills and templates are identical across all 8 platforms. It means the platform integration (subagent spawn behavior, ergonomics, `SKILL.md` loading) has had less real-world usage than Claude Code and Codex, and edge cases may still surface. Please [report issues](https://github.com/gotalab/cc-sdd/issues) if you hit any.

## Installation details

### Language

```bash
npx github:nekolife1984/spectra --lang ja    # Japanese
npx github:nekolife1984/spectra --lang zh-TW # Traditional Chinese
npx github:nekolife1984/spectra --lang es    # Spanish
# Supports: en, ja, zh-TW, zh, es, pt, de, fr, ru, it, ko, ar, el
```

### Legacy modes (deprecated)

```bash
npx github:nekolife1984/spectra --claude        # Claude Code commands (use --claude-skills)
npx github:nekolife1984/spectra --claude-agent  # Claude Code subagents (use --claude-skills)
npx github:nekolife1984/spectra --cursor        # Cursor IDE commands (use --cursor-skills)
npx github:nekolife1984/spectra --copilot       # GitHub Copilot prompts (use --copilot-skills)
npx github:nekolife1984/spectra --windsurf      # Windsurf IDE workflows (use --windsurf-skills)
npx github:nekolife1984/spectra --opencode      # OpenCode commands (use --opencode-skills)
npx github:nekolife1984/spectra --gemini        # Gemini CLI commands (use --gemini-skills)
npx github:nekolife1984/spectra --qwen          # Qwen Code
```

### Advanced options

```bash
# Preview changes before applying
npx github:nekolife1984/spectra --dry-run --backup

# Custom specs directory
npx github:nekolife1984/spectra --spec-dir docs
```

## Customization

Edit templates and rules in `{{SPEC_DIR}}/settings/` to match your team's workflow.

- `templates/`: document structure for requirements, design, tasks.
- `rules/`: AI generation principles and judgment criteria.

Common use cases: PRD-style requirements, API and database schemas, approval gates, JIRA integration, domain-specific standards.

[Customization Guide](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md) has practical examples with copy-paste snippets.

## Project structure

After installation, your project gets:

```
project/
# Skills mode (recommended): one of the following is installed
├── .claude/skills/           # 17 skills (Claude Code Skills, default)
├── .agents/skills/           # 17 skills (Codex Skills)
├── .cursor/skills/           # 17 skills (Cursor Skills)
├── .github/skills/           # 17 skills (GitHub Copilot Skills)
├── .windsurf/skills/         # 17 skills (Windsurf Skills)
├── .opencode/skills/         # 17 skills (OpenCode Skills)
├── .gemini/skills/           # 17 skills (Gemini CLI Skills)
├── .agent/skills/            # 17 skills (Antigravity Skills)
# Legacy command modes (deprecated)
├── .claude/commands/spec/    # 11 slash commands (--claude)
├── .github/prompts/          # 11 prompt commands (--copilot)
├── .windsurf/workflows/      # 11 workflow files (--windsurf)
# Shared project memory and spec state
├── .spec/settings/templates/ # Shared templates (variables resolved with {{SPEC_DIR}})
├── .spec/settings/rules/     # Shared rules (used by non-skills agents)
├── .spec/specs/              # Feature specifications
├── .spec/steering/           # AI guidance documents
└── CLAUDE.md / AGENTS.md     # Project configuration (per agent)
```

Only the directories for the agent(s) you install are created. The tree above shows the full superset for reference.

## Documentation

- Skill Reference: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/skill-reference.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/skill-reference.md)
- Command Reference: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/command-reference.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/command-reference.md)
- Customization Guide: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/customization-guide.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/customization-guide.md)
- Spec-Driven Guide: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/spec-driven.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/spec-driven.md)
- Why cc-sdd?: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/why-cc-sdd.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/why-cc-sdd.md)
- Claude Subagents Guide: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/claude-subagents.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/claude-subagents.md)
- Migration Guide: [English](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/migration-guide.md) | [日本語](https://github.com/gotalab/cc-sdd/blob/main/docs/guides/ja/migration-guide.md)
- [Issues & Support](https://github.com/gotalab/cc-sdd/issues) for bug reports and questions
- [Spec IDE](https://kiro.dev)

---

**Stable Release v3.0.0.** Production-ready. [Report issues](https://github.com/gotalab/cc-sdd/issues) | MIT License

### Platform support

- Supported OS: macOS, Linux, Windows (auto-detected by default).
- Unified command templates across operating systems; `--os` override is optional for legacy automation.
