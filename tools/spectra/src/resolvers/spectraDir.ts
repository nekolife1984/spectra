import path from 'node:path';

export type SpectraDirOptions = {
  flag?: string;
  config?: string;
};

export const defaultSpecDir = '.spectra';

export const resolveSpecDir = (opts: SpectraDirOptions = {}): string => {
  const candidate = opts.flag ?? opts.config ?? defaultSpecDir;

  if (!candidate || typeof candidate !== 'string') {
    throw new Error('spectraDir must be a non-empty string');
  }

  // Reject absolute paths
  if (path.isAbsolute(candidate)) {
    throw new Error('spectraDir must be a repository-relative path');
  }

  // Allowed characters: alphanumeric, dot, underscore, hyphen, slash
  // No spaces or other special characters
  const allowed = /^[A-Za-z0-9._\/-]+$/;
  if (!allowed.test(candidate)) {
    throw new Error('spectraDir contains disallowed characters');
  }

  // Reject parent directory traversal
  const segments = candidate.split(/[\\/]+/);
  if (segments.some((s) => s === '..')) {
    throw new Error('spectraDir must not contain parent traversal (..)');
  }

  const trimmed = candidate.replace(/[\\/]+$/, '');

  const normalized = trimmed.replace(/\/{2,}/g, '/');

  if (!normalized) {
    throw new Error('spectraDir must be a non-empty string');
  }

  return normalized;
};
