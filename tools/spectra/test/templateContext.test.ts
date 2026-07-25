import { describe, it, expect } from 'vitest';
import { buildTemplateContext } from '../src/template/context';
import type { AgentType, CCSddConfig } from '../src/resolvers/agentLayout';

// v3.0 renamed all command-based agent installs to --*-skills.
// Update from the v1.x names 'claude-code' / 'claude-code-agent'.
describe('buildTemplateContext', () => {
  it('includes LANG_CODE and SPECTRA_DIR (default)', () => {
    const ctx = buildTemplateContext({ agent: 'claude-code-skills', lang: 'ja' });
    expect(ctx.LANG_CODE).toBe('ja');
    expect(ctx.SPECTRA_DIR).toBe('.spectra');
    expect(ctx.DEV_GUIDELINES).toBe(
      '- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).',
    );
  });

  it('uses spectra-dir flag when provided', () => {
    const ctx = buildTemplateContext({ agent: 'claude-code-skills', lang: 'en', spectraDir: { flag: 'docs/spectra' } });
    expect(ctx.SPECTRA_DIR).toBe('docs/spectra');
  });

  it('includes agent layout variables for claude-code-skills', () => {
    const ctx = buildTemplateContext({ agent: 'claude-code-skills', lang: 'en' });
    expect(ctx.AGENT_DIR).toBe('.claude');
    expect(ctx.AGENT_DOC).toBe('CLAUDE.md');
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.claude/skills');
  });

  it('respects agentLayouts override', () => {
    const config: CCSddConfig = {
      agentLayouts: {
        'claude-code-skills': { commandsDir: '.custom/commands' }
      }
    };
    const ctx = buildTemplateContext({ agent: 'claude-code-skills', lang: 'en', config });
    expect(ctx.AGENT_COMMANDS_DIR).toBe('.custom/commands');
    // other values fall back to defaults
    expect(ctx.AGENT_DIR).toBe('.claude');
    expect(ctx.AGENT_DOC).toBe('CLAUDE.md');
  });

  it('provides guidelines for all supported languages', () => {
    const langs = ['en', 'ja', 'zh-TW', 'zh', 'es', 'pt', 'de', 'fr', 'ru', 'it', 'ko', 'ar', 'el'] as const;
    for (const lang of langs) {
      const ctx = buildTemplateContext({ agent: 'claude-code-skills', lang });
      expect(ctx.DEV_GUIDELINES.length).toBeGreaterThan(0);
    }
  });
});
