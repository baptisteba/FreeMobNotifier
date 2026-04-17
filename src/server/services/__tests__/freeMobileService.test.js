import { describe, it, expect } from 'vitest';
import freeMobileService from '../freeMobileService.js';

const { sanitizeMessage, isRetryableError, computeBackoffMs } = freeMobileService;

describe('sanitizeMessage', () => {
  it('strips French accents', () => {
    expect(sanitizeMessage('Café à emporter')).toBe('Cafe a emporter');
    expect(sanitizeMessage('Noël très joyeux')).toBe('Noel tres joyeux');
    expect(sanitizeMessage('œuf cœur')).toBe('oeuf coeur');
  });

  it('preserves ASCII', () => {
    expect(sanitizeMessage('Hello, World! 123')).toBe('Hello, World! 123');
  });

  it('drops non-ASCII that have no mapping', () => {
    expect(sanitizeMessage('emoji 🎉 here')).toBe('emoji  here');
  });

  it('normalizes smart quotes and dashes', () => {
    expect(sanitizeMessage('\u201chi\u201d \u2014 \u2018bye\u2019')).toBe('"hi" - \'bye\'');
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(sanitizeMessage('')).toBe('');
    expect(sanitizeMessage(null)).toBe('');
    expect(sanitizeMessage(undefined)).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeMessage('  hi  ')).toBe('hi');
  });
});

describe('isRetryableError', () => {
  it('500, 402, 0 are retryable', () => {
    expect(isRetryableError(500)).toBe(true);
    expect(isRetryableError(402)).toBe(true);
    expect(isRetryableError(0)).toBe(true);
  });
  it('400 and 403 are not retryable', () => {
    expect(isRetryableError(400)).toBe(false);
    expect(isRetryableError(403)).toBe(false);
  });
});

describe('computeBackoffMs', () => {
  it('402 waits at least 60s', () => {
    for (let i = 0; i < 10; i++) {
      const ms = computeBackoffMs(402, 0);
      expect(ms).toBeGreaterThanOrEqual(60_000);
      expect(ms).toBeLessThanOrEqual(120_000);
    }
  });
  it('500 exponential starts near base 2s with jitter', () => {
    const ms0 = computeBackoffMs(500, 0);
    expect(ms0).toBeGreaterThanOrEqual(2000);
    expect(ms0).toBeLessThanOrEqual(3000);
    const ms2 = computeBackoffMs(500, 2);
    expect(ms2).toBeGreaterThanOrEqual(8000);
    expect(ms2).toBeLessThanOrEqual(9000);
  });
});
