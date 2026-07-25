import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// 8 agent directories under tools/spectra/templates/agents/
// 20 skill names are expected to be byte-identical across all agents
// (intentional until overlay-based deduplication lands — see CHANGELOG / v3.0.2 notes).
//
// The CLI template resolver reads each agent's `skills/<name>/SKILL.md` independently,
// so any silent drift would install different content per agent — a hard-to-diagnose
// bug. This test catches that drift in CI.

const TEMPLATES_ROOT = join(process.cwd(), 'templates', 'agents');
const EXPECTED_SKILL_NAMES = [
  'spectra-batch',
  'spectra-debug',
  'spectra-design',
  'spectra-discovery',
  'spectra-impact',
  'spectra-impl',
  'spectra-init',
  'spectra-quick',
  'spectra-requirements',
  'spectra-review',
  'spectra-status',
  'spectra-steering',
  'spectra-steering-custom',
  'spectra-tasks',
  'spectra-trace',
  'spectra-validate-boundary',
  'spectra-validate-design',
  'spectra-validate-gap',
  'spectra-validate-impl',
  'spectra-verify-completion',
];

const md5 = (bytes: Buffer): string =>
  createHash('md5').update(bytes).digest('hex');

const listSkillDirs = (agentDir: string): string[] => {
  const skillsDir = join(agentDir, 'skills');
  try {
    return readdirSync(skillsDir)
      .filter((name) => {
        const full = join(skillsDir, name);
        return statSync(full).isDirectory();
      })
      .sort();
  } catch {
    return [];
  }
};

describe('skill parity across agent templates', () => {
  it('exposes all 8 agent directories under templates/agents/', () => {
    const agents = readdirSync(TEMPLATES_ROOT).filter((name) => {
      const full = join(TEMPLATES_ROOT, name);
      return statSync(full).isDirectory();
    });
    // The 8 currently-supported agent targets.
    // Adjust this list when adding/removing supported agents.
    const expected = [
      'antigravity-skills',
      'claude-code-skills',
      'codex-skills',
      'cursor-skills',
      'gemini-cli-skills',
      'github-copilot-skills',
      'opencode-skills',
      'windsurf-skills',
    ].sort();
    expect(agents.sort()).toEqual(expected);
  });

  it('exposes all 20 expected skill names under every agent', () => {
    for (const agent of readdirSync(TEMPLATES_ROOT)) {
      const agentDir = join(TEMPLATES_ROOT, agent);
      if (!statSync(agentDir).isDirectory()) continue;
      const present = listSkillDirs(agentDir);
      expect(present, `agent ${agent} skill set`).toEqual([...EXPECTED_SKILL_NAMES].sort());
    }
  });

  it('keeps SKILL.md byte-identical across all 8 agents for every skill', () => {
    // Aggregate per-skill hashes; if any skill has >1 distinct hash across agents, fail
    // with a per-skill breakdown that pinpoints which agent(s) drifted.
    const perSkill: Record<string, Record<string, string[]>> = {};
    for (const agent of readdirSync(TEMPLATES_ROOT)) {
      const agentDir = join(TEMPLATES_ROOT, agent);
      if (!statSync(agentDir).isDirectory()) continue;
      for (const skill of EXPECTED_SKILL_NAMES) {
        const file = join(agentDir, 'skills', skill, 'SKILL.md');
        let bytes: Buffer;
        try {
          bytes = readFileSync(file);
        } catch (err) {
          throw new Error(`missing ${relative(process.cwd(), file)}: ${(err as Error).message}`);
        }
        const hash = md5(bytes);
        perSkill[skill] ??= {};
        perSkill[skill][hash] ??= [];
        perSkill[skill][hash].push(agent);
      }
    }

    const drift: Array<{ skill: string; byHash: Record<string, string[]> }> = [];
    for (const [skill, byHash] of Object.entries(perSkill)) {
      if (Object.keys(byHash).length > 1) {
        drift.push({ skill, byHash });
      }
    }
    if (drift.length > 0) {
      const lines = drift.map(
        (d) =>
          `  - ${d.skill}:\n` +
          Object.entries(d.byHash)
            .map(([h, agents]) => `      md5=${h.slice(0, 8)}…  agents=[${agents.join(', ')}]`)
            .join('\n'),
      );
      throw new Error(
        'Skill content drifted across agent templates. Update all 8 copies or migrate to a ' +
          'shared overlay model. Per-skill breakdown:\n' +
          lines.join('\n'),
      );
    }
  });
});
