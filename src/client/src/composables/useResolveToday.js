/**
 * Resolve the datetimes at which scheduled messages should fire today,
 * in the browser's local timezone (which is also what the client sends
 * when scheduling recurring messages). Mirrors the server's
 * shouldSendRecurringMessage / resolveInTimezone logic.
 */

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const resolveInTimezone = (date, tz) => {
  if (!tz) {
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      dayOfWeek: date.getDay()
    };
  }
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    }).formatToParts(date);
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return {
      year: parseInt(get('year'), 10),
      month: parseInt(get('month'), 10) - 1,
      day: parseInt(get('day'), 10),
      hour: parseInt(get('hour'), 10) % 24,
      minute: parseInt(get('minute'), 10),
      dayOfWeek: WEEKDAY_INDEX[get('weekday')] ?? date.getDay()
    };
  } catch {
    return resolveInTimezone(date, null);
  }
};

const buildFireTimeForToday = (cfg, referenceDate = new Date()) => {
  // Schedule at the message's (hour, minute) in the browser's local timezone.
  // The server will do the authoritative match using the stored `timezone`,
  // so this is purely a display helper.
  const fire = new Date(referenceDate);
  fire.setHours(cfg.hour ?? 0, cfg.minute ?? 0, 0, 0);
  return fire;
};

const sameLocalDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * @param {Array} messages
 * @param {Date} now
 * @returns {Array<{message, fireAt, status: 'upcoming' | 'past'}>}
 */
export const resolveToday = (messages, now = new Date()) => {
  const out = [];

  for (const msg of messages || []) {
    if (msg.status !== 'pending') continue;

    if (!msg.recurrence || msg.recurrence === 'none') {
      if (!msg.sendAt) continue;
      const sendAt = new Date(msg.sendAt);
      if (!sameLocalDay(sendAt, now)) continue;
      out.push({
        message: msg,
        fireAt: sendAt,
        status: sendAt < now ? 'past' : 'upcoming'
      });
      continue;
    }

    const cfg = msg.recurrenceConfig || {};
    const tz = cfg.timezone;
    const nowLocal = resolveInTimezone(now, tz);
    const fire = buildFireTimeForToday(cfg, now);

    // Check it fires today based on recurrence rules:
    let firesToday = false;
    if (msg.recurrence === 'daily') {
      firesToday = true;
    } else if (msg.recurrence === 'weekly') {
      firesToday = Array.isArray(cfg.daysOfWeek) && cfg.daysOfWeek.includes(nowLocal.dayOfWeek);
    } else if (msg.recurrence === 'monthly') {
      firesToday = cfg.dayOfMonth === nowLocal.day;
    }
    if (!firesToday) continue;

    out.push({
      message: msg,
      fireAt: fire,
      status: fire < now ? 'past' : 'upcoming'
    });
  }

  out.sort((a, b) => a.fireAt - b.fireAt);
  return out;
};

/**
 * Format a fire time relative to now in French.
 */
export const formatRelative = (fireAt, now = new Date()) => {
  const diffMin = Math.round((fireAt - now) / 60000);
  if (Math.abs(diffMin) < 1) return 'maintenant';
  if (diffMin > 0) {
    if (diffMin < 60) return `dans ${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m ? `dans ${h} h ${m}` : `dans ${h} h`;
  }
  const abs = -diffMin;
  if (abs < 60) return `il y a ${abs} min`;
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m ? `il y a ${h} h ${m}` : `il y a ${h} h`;
};
