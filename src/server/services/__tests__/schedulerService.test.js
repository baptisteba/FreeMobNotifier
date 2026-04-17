import { describe, it, expect } from 'vitest';
import schedulerService from '../schedulerService.js';

const { shouldSendRecurringMessage, resolveInTimezone } = schedulerService;

const atLocal = (y, mo, d, h, mi) => new Date(y, mo, d, h, mi, 0, 0);

describe('shouldSendRecurringMessage', () => {
  it('returns false if hour/minute do not match', () => {
    const msg = {
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0 },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, atLocal(2026, 3, 18, 10, 0))).toBe(false);
  });

  it('daily: sends when hour and minute match', () => {
    const msg = {
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0 },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, atLocal(2026, 3, 18, 9, 0))).toBe(true);
  });

  it('daily: blocks re-send within 60-minute lastSent guard', () => {
    const now = atLocal(2026, 3, 18, 9, 0);
    const msg = {
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0 },
      lastSent: new Date(now.getTime() - 30 * 60 * 1000)
    };
    expect(shouldSendRecurringMessage(msg, now)).toBe(false);
  });

  it('daily: allows send once guard expires', () => {
    const now = atLocal(2026, 3, 18, 9, 0);
    const msg = {
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0 },
      lastSent: new Date(now.getTime() - 120 * 60 * 1000)
    };
    expect(shouldSendRecurringMessage(msg, now)).toBe(true);
  });

  it('weekly: respects daysOfWeek', () => {
    const wednesday = atLocal(2026, 3, 15, 9, 0);
    const thursday = atLocal(2026, 3, 16, 9, 0);
    const msg = {
      recurrence: 'weekly',
      recurrenceConfig: { hour: 9, minute: 0, daysOfWeek: [3] },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, wednesday)).toBe(true);
    expect(shouldSendRecurringMessage(msg, thursday)).toBe(false);
  });

  it('monthly: respects dayOfMonth', () => {
    const msg = {
      recurrence: 'monthly',
      recurrenceConfig: { hour: 9, minute: 0, dayOfMonth: 15 },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, atLocal(2026, 3, 15, 9, 0))).toBe(true);
    expect(shouldSendRecurringMessage(msg, atLocal(2026, 3, 16, 9, 0))).toBe(false);
  });

  it('returns false for unknown recurrence', () => {
    const msg = {
      recurrence: 'yearly',
      recurrenceConfig: { hour: 9, minute: 0 },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, atLocal(2026, 3, 15, 9, 0))).toBe(false);
  });

  it('timezone: fires at 09:00 in the message TZ regardless of server TZ', () => {
    // 2026-06-01 07:00 UTC is 09:00 Europe/Paris (CEST, UTC+2)
    const now = new Date(Date.UTC(2026, 5, 1, 7, 0, 0));
    const msg = {
      recurrence: 'daily',
      recurrenceConfig: { hour: 9, minute: 0, timezone: 'Europe/Paris' },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, now)).toBe(true);
  });

  it('timezone: weekday resolves in the message TZ', () => {
    // 2026-06-01 (Monday) 23:00 Europe/Paris = 21:00 UTC
    // In UTC the weekday is still Monday; this mainly checks that the resolver
    // pulls weekday from the formatted parts, not from getDay().
    const now = new Date(Date.UTC(2026, 5, 1, 21, 0, 0));
    const msg = {
      recurrence: 'weekly',
      recurrenceConfig: { hour: 23, minute: 0, daysOfWeek: [1], timezone: 'Europe/Paris' },
      lastSent: null
    };
    expect(shouldSendRecurringMessage(msg, now)).toBe(true);
  });
});

describe('resolveInTimezone', () => {
  it('falls back to local when tz missing', () => {
    const d = new Date(2026, 5, 1, 9, 30, 0);
    const r = resolveInTimezone(d, undefined);
    expect(r.hour).toBe(9);
    expect(r.minute).toBe(30);
  });

  it('UTC zone produces UTC hour', () => {
    const d = new Date(Date.UTC(2026, 5, 1, 15, 0, 0));
    expect(resolveInTimezone(d, 'UTC').hour).toBe(15);
  });

  it('Europe/Paris in summer is UTC+2', () => {
    const d = new Date(Date.UTC(2026, 5, 1, 7, 0, 0)); // July = CEST
    expect(resolveInTimezone(d, 'Europe/Paris').hour).toBe(9);
  });

  it('falls back silently on bogus timezone', () => {
    const d = new Date(2026, 5, 1, 9, 30, 0);
    const r = resolveInTimezone(d, 'Not/A/Zone');
    expect(r.hour).toBe(9);
    expect(r.minute).toBe(30);
  });
});
