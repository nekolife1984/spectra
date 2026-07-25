import { describe, it, expect } from 'vitest';
import { resolveSpecDir, defaultSpecDir } from '../src/resolvers/spectraDir';

describe('resolveSpecDir', () => {
  it('returns default when neither flag nor config is set', () => {
    expect(resolveSpecDir({})).toBe(defaultSpecDir);
  });

  it('prefers config over default', () => {
    expect(resolveSpecDir({ config: 'docs/spectra' })).toBe('docs/spectra');
  });

  it('prefers flag over config', () => {
    expect(resolveSpecDir({ flag: '.work/spectra', config: 'docs/spectra' })).toBe('.work/spectra');
  });

  it('trims trailing slashes', () => {
    expect(resolveSpecDir({ flag: 'docs/spec/' })).toBe('docs/spectra');
  });

  it('deduplicates consecutive slashes', () => {
    expect(resolveSpecDir({ flag: '.spectra//specs//' })).toBe('.spectra/specs');
  });

  it('rejects absolute path', () => {
    expect(() => resolveSpecDir({ flag: '/abs/path' })).toThrow();
  });

  it('rejects parent traversal', () => {
    expect(() => resolveSpecDir({ flag: '../up' })).toThrow();
  });

  it('rejects disallowed characters', () => {
    expect(() => resolveSpecDir({ flag: 'spectra bad' })).toThrow();
  });
});
