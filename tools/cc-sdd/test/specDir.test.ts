import { describe, it, expect } from 'vitest';
import { resolveSpecDir, defaultSpecDir } from '../src/resolvers/specDir';

describe('resolveSpecDir', () => {
  it('returns default when neither flag nor config is set', () => {
    expect(resolveSpecDir({})).toBe(defaultSpecDir);
  });

  it('prefers config over default', () => {
    expect(resolveSpecDir({ config: 'docs/spec' })).toBe('docs/spec');
  });

  it('prefers flag over config', () => {
    expect(resolveSpecDir({ flag: '.work/spec', config: 'docs/spec' })).toBe('.work/spec');
  });

  it('trims trailing slashes', () => {
    expect(resolveSpecDir({ flag: 'docs/spec/' })).toBe('docs/spec');
  });

  it('deduplicates consecutive slashes', () => {
    expect(resolveSpecDir({ flag: '.spec//specs//' })).toBe('.spec/specs');
  });

  it('rejects absolute path', () => {
    expect(() => resolveSpecDir({ flag: '/abs/path' })).toThrow();
  });

  it('rejects parent traversal', () => {
    expect(() => resolveSpecDir({ flag: '../up' })).toThrow();
  });

  it('rejects disallowed characters', () => {
    expect(() => resolveSpecDir({ flag: 'spec bad' })).toThrow();
  });
});
