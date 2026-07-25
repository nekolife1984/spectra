export interface AgentLayoutDefaults {
  commandsDir: string;
  agentDir: string;
  docFile: string;
}

export interface AgentCommandHints {
  spec: string;
  steering: string;
  steeringCustom: string;
}

export interface AgentCompletionGuide {
  prependSteps?: string[];
  appendSteps?: string[];
}

export interface AgentDefinition {
  label: string;
  description: string;
  aliasFlags: string[];
  recommendedModels?: string[];
  layout: AgentLayoutDefaults;
  commands: AgentCommandHints;
  manifestId?: string;
  completionGuide?: AgentCompletionGuide;
  templateFallbacks?: Record<string, string>;
}

export const agentDefinitions = {
  'claude-code-skills': {
    label: 'Claude Code Skills',
    description:
      'Installs spec skills in `.claude/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and a CLAUDE.md quickstart.',
    aliasFlags: ['--claude-code-skills', '--claude-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer', 'Implementation: Claude Sonnet 4.6 or newer'],
    layout: {
      commandsDir: '.claude/skills',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    templateFallbacks: {
      'CLAUDE.md': '../../CLAUDE.md',
    },
    manifestId: 'claude-code-skills',
  },
  'codex-skills': {
    label: 'Codex Skills',
    description:
      'Installs spec skills in `.agents/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--codex-skills'],
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
    layout: {
      commandsDir: '.agents/skills',
      agentDir: '.agents',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`$spectra-init <what-to-build>`',
      steering: '`$spectra-steering`',
      steeringCustom: '`$spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `$spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `$spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'codex-skills',
  },
  'cursor-skills': {
    label: 'Cursor Skills',
    description:
      'Installs spec skills in `.cursor/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--cursor-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4 / Composer 2'],
    layout: {
      commandsDir: '.cursor/skills',
      agentDir: '.cursor',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'cursor-skills',
  },
  'github-copilot-skills': {
    label: 'GitHub Copilot Skills',
    description:
      'Installs spec skills in `.github/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--copilot-skills', '--github-copilot-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4'],
    layout: {
      commandsDir: '.github/skills',
      agentDir: '.github',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'github-copilot-skills',
  },
  'gemini-cli-skills': {
    label: 'Gemini CLI Skills',
    description:
      'Installs spec skills in `.gemini/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and a GEMINI.md quickstart.',
    aliasFlags: ['--gemini-cli-skills', '--gemini-skills'],
    recommendedModels: ['Planning / review: Gemini 3.1 Pro or newer', 'Implementation: Gemini 3 Flash or newer'],
    layout: {
      commandsDir: '.gemini/skills',
      agentDir: '.gemini',
      docFile: 'GEMINI.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'gemini-cli-skills',
  },
  'windsurf-skills': {
    label: 'Windsurf Skills',
    description:
      'Installs spec skills in `.windsurf/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--windsurf-skills'],
    recommendedModels: ['Planning / review: Claude Opus 4.6 or newer / gpt-5.4 high', 'Implementation: Claude Sonnet 4.6 or newer / gpt-5.4'],
    layout: {
      commandsDir: '.windsurf/skills',
      agentDir: '.windsurf',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`@spectra-init <what-to-build>`',
      steering: '`@spectra-steering`',
      steeringCustom: '`@spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `@spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `@spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'windsurf-skills',
  },
  'opencode-skills': {
    label: 'OpenCode Skills',
    description:
      'Installs spec skills in `.opencode/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--opencode-skills'],
    recommendedModels: ['Planning / review: gpt-5.4 high or xhigh', 'Implementation: gpt-5.4'],
    layout: {
      commandsDir: '.opencode/skills',
      agentDir: '.opencode',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'opencode-skills',
  },
  'antigravity-skills': {
    label: 'Antigravity Skills',
    description:
      'Installs spec skills in `.agent/skills/spectra-*/`, shared settings in `{{SPECTRA_DIR}}/settings/`, and an AGENTS.md quickstart.',
    aliasFlags: ['--antigravity-skills', '--antigravity'],
    layout: {
      commandsDir: '.agent/skills',
      agentDir: '.agent',
      docFile: 'AGENTS.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      prependSteps: [
        'If you are not sure whether the work should become one spec, many specs, or no spec at all, start with `/spectra-discovery <idea>`.',
      ],
      appendSteps: [
        'Use `/spectra-quick <what-to-build> [--auto]` only when you intentionally want the fast path for a single spec.',
      ],
    },
    manifestId: 'antigravity-skills',
  },
  // qwen-code is a legacy agent (added in v1.1.5). It has no skills-mode
  // manifest — only the legacy `.qwen/commands/spec` layout, sharing
  // gemini-cli templates. CHANGELOG v1.1.5: "Qwen Code support - Reuse
  // gemini-cli templates to minimize code duplication".
  'qwen-code': {
    label: 'Qwen Code (legacy)',
    description:
      'Legacy Qwen Code agent using `.qwen/commands/spec/` and shared gemini-cli templates. New installs should pick a skills-mode target instead.',
    aliasFlags: ['--qwen-code', '--qwen'],
    layout: {
      commandsDir: '.qwen/commands/spec',
      agentDir: '.qwen',
      docFile: 'QWEN.md',
    },
    commands: {
      spec: '`/spectra-init <what-to-build>`',
      steering: '`/spectra-steering`',
      steeringCustom: '`/spectra-steering-custom <what-to-create-custom-steering-document>`',
    },
    completionGuide: {
      appendSteps: [
        'qwen-code is a legacy target. Consider switching to a skills-mode agent (e.g. `claude-code-skills`, `codex-skills`).',
      ],
    },
  },
} as const satisfies Record<string, AgentDefinition>;

export type AgentType = keyof typeof agentDefinitions;

export const getAgentDefinition = (agent: AgentType): AgentDefinition => {
  const definition = agentDefinitions[agent];
  if (!definition) {
    throw new Error(`Unknown agent: ${agent as string}`);
  }
  return definition as AgentDefinition;
};

export const agentList = Object.keys(agentDefinitions) as AgentType[];
