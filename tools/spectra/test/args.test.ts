import { describe, it, expect } from 'vitest';
import { parseArgs, type ParsedArgs } from '../src/cli/args';

describe('parseArgs', () => {
  it('parses basic flags with explicit values', () => {
    const args = parseArgs([
      '--agent', 'claude-code-skills',
      '--lang', 'ja',
      '--os', 'auto',
      '--overwrite', 'prompt',
      '--spectra-dir', '.spectra',
    ]);
    const expected: ParsedArgs = {
      agent: 'claude-code-skills',
      lang: 'ja',
      os: 'auto',
      overwrite: 'prompt',
      spectraDir: '.spectra',
    };
    expect(args).toEqual(expected);
  });

  it('supports boolean flags and short aliases', () => {
    const args = parseArgs(['--dry-run', '-y']);
    expect(args.dryRun).toBe(true);
    expect(args.yes).toBe(true);
  });

  it('parses additional languages', () => {
    expect(parseArgs(['--lang', 'es']).lang).toBe('es');
    expect(parseArgs(['--lang', 'ko']).lang).toBe('ko');
  });

  it('parses backup with and without value', () => {
    expect(parseArgs(['--backup']).backup).toBe(true);
    expect(parseArgs(['--backup', '.spectra.backup']).backup).toBe('.spectra.backup');
    expect(parseArgs(['--backup=.spectra.backup/custom']).backup).toBe('.spectra.backup/custom');
  });

  it('supports agent alias flags and detects conflicts', () => {
    // v3.0 renamed all command-based agent installs to --*-skills.
    // The legacy bare aliases (--gemini-cli, --claude-code) were deprecated
    // in v3.0.0 and are no longer registered. Tests target the current names.
    expect(parseArgs(['--gemini-skills']).agent).toBe('gemini-cli-skills');
    expect(parseArgs(['--qwen-code']).agent).toBe('qwen-code');
    expect(parseArgs(['--claude-code-skills']).agent).toBe('claude-code-skills');
    expect(parseArgs(['--codex-skills']).agent).toBe('codex-skills');
    expect(parseArgs(['--windsurf-skills']).agent).toBe('windsurf-skills');

    expect(() => parseArgs(['--agent', 'qwen-code', '--gemini-skills'])).toThrowError(/agent.*conflict/i);
    expect(() => parseArgs(['--gemini-skills', '--qwen-code'])).toThrowError(/agent.*conflict/i);
  });

  it('validates enum values for os/lang/overwrite/agent', () => {
    expect(() => parseArgs(['--os', 'macos'])).toThrowError(/os.*invalid/i);
    expect(() => parseArgs(['--lang', 'jp'])).toThrowError(/lang.*invalid/i);
    expect(() => parseArgs(['--overwrite', 'replace'])).toThrowError(/overwrite.*invalid/i);
    expect(() => parseArgs(['--agent', 'unknown'])).toThrowError(/agent.*invalid/i);
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--unknown-flag'])).toThrowError(/unknown flag/i);
  });
});
