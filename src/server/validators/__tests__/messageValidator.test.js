import { describe, it, expect } from 'vitest';
import validator from '../messageValidator.js';

const { validateMessagePayload, isValidTimezone } = validator;

describe('validateMessagePayload', () => {
  it('accepts valid one-time message', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'none',
      sendAt: new Date(Date.now() + 60000).toISOString()
    })).toBeNull();
  });

  it('rejects missing content', () => {
    expect(validateMessagePayload({ recurrence: 'none', sendAt: new Date().toISOString() }))
      .toMatch(/content/i);
  });

  it('rejects empty content', () => {
    expect(validateMessagePayload({ content: '   ', recurrence: 'none', sendAt: new Date().toISOString() }))
      .toMatch(/content/i);
  });

  it('rejects content above 800 chars', () => {
    expect(validateMessagePayload({
      content: 'a'.repeat(801),
      recurrence: 'none',
      sendAt: new Date().toISOString()
    })).toMatch(/800/);
  });

  it('rejects sanitized length above 160', () => {
    expect(validateMessagePayload({
      content: 'a'.repeat(161),
      recurrence: 'none',
      sendAt: new Date().toISOString()
    })).toMatch(/160/);
  });

  it('rejects when accent expansion pushes sanitized past 160', () => {
    // 159 "a" + "œ" (expands to "oe") = 161 sanitized
    expect(validateMessagePayload({
      content: 'a'.repeat(159) + 'œ',
      recurrence: 'none',
      sendAt: new Date().toISOString()
    })).toMatch(/160/);
  });

  it('rejects when emoji-only content sanitizes to empty', () => {
    expect(validateMessagePayload({
      content: '🎉🎂🎈',
      recurrence: 'none',
      sendAt: new Date().toISOString()
    })).toMatch(/empty/i);
  });

  it('rejects invalid recurrence', () => {
    expect(validateMessagePayload({ content: 'hi', recurrence: 'yearly' }))
      .toMatch(/recurrence/i);
  });

  it('rejects missing sendAt for one-time', () => {
    expect(validateMessagePayload({ content: 'hi', recurrence: 'none' }))
      .toMatch(/send date/i);
  });

  it('rejects invalid sendAt', () => {
    expect(validateMessagePayload({ content: 'hi', recurrence: 'none', sendAt: 'not-a-date' }))
      .toMatch(/sendAt/i);
  });

  it('daily: rejects out-of-range hour', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'daily',
      recurrenceConfig: { hour: 25, minute: 0 }
    })).toMatch(/hour/i);
  });

  it('daily: rejects out-of-range minute', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 60 }
    })).toMatch(/minute/i);
  });

  it('weekly: requires non-empty daysOfWeek', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'weekly',
      recurrenceConfig: { hour: 9, minute: 0, daysOfWeek: [] }
    })).toMatch(/daysOfWeek/);
  });

  it('weekly: rejects out-of-range day', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'weekly',
      recurrenceConfig: { hour: 9, minute: 0, daysOfWeek: [7] }
    })).toMatch(/daysOfWeek/);
  });

  it('monthly: rejects out-of-range dayOfMonth', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'monthly',
      recurrenceConfig: { hour: 9, minute: 0, dayOfMonth: 32 }
    })).toMatch(/dayOfMonth/);
  });

  it('accepts valid IANA timezone', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0, timezone: 'Europe/Paris' }
    })).toBeNull();
  });

  it('rejects invalid timezone', () => {
    expect(validateMessagePayload({
      content: 'hi',
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0, timezone: 'Middle/Earth' }
    })).toMatch(/timezone/i);
  });

  it('partial update: no content is fine if not provided', () => {
    expect(validateMessagePayload(
      { sendAt: new Date(Date.now() + 60000).toISOString() },
      { partial: true }
    )).toBeNull();
  });
});

describe('isValidTimezone', () => {
  it('accepts common zones', () => {
    expect(isValidTimezone('UTC')).toBe(true);
    expect(isValidTimezone('Europe/Paris')).toBe(true);
    expect(isValidTimezone('America/New_York')).toBe(true);
  });
  it('rejects bogus', () => {
    expect(isValidTimezone('Foo/Bar')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
  });
});
