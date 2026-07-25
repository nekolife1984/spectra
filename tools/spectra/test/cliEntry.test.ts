import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index';

const runtime = { platform: 'darwin' } as const;

const makeIO = () => {
  const logs: string[] = [];
  const errs: string[] = [];
  let exitCode: number | null = null;
  return {
    io: {
      log: (m: string) => logs.push(m),
      error: (m: string) => errs.push(m),
      exit: (c: number) => {
        exitCode = c;
      },
    },
    get logs() {
      return logs;
    },
    get errs() {
      return errs;
    },
    get exitCode() {
      return exitCode;
    },
  };
};

describe('CLI entry', () => {
  it('shows help', async () => {
    const ctx = makeIO();
    const code = await runCli(['--help'], runtime, ctx.io, {});
    expect(code).toBe(0);
    expect(ctx.logs.join('\n')).toMatch(/Usage: spectra/);
  });

  it('shows version', async () => {
    const ctx = makeIO();
    const code = await runCli(['--version'], runtime, ctx.io, {});
    expect(code).toBe(0);
    expect(ctx.logs.join('\n')).toMatch(/spectra v/);
  });

  it('prints plan on --dry-run', async () => {
    // v3.0: --agent gemini-cli was renamed to --agent gemini-cli-skills.
    const ctx = makeIO();
    const code = await runCli(['--dry-run', '--agent', 'gemini-cli-skills', '--os', 'mac'], runtime, ctx.io, {});
    expect(code).toBe(0);
    const out = ctx.logs.join('\n');
    expect(out).toMatch(/Plan \(dry-run\)/);
    expect(out).toMatch(/Total: \d+/);
    expect(out).toMatch(/templateDir.*templates\/agents\/gemini-cli-skills/);
  });

  it('shows error on invalid flag', async () => {
    const ctx = makeIO();
    const code = await runCli(['--unknown'], runtime, ctx.io, {});
    expect(code).toBe(1);
    expect(ctx.errs.join('\n')).toMatch(/Unknown flag/);
  });
});
