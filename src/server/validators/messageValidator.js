const { sanitizeMessage, MAX_SMS_LENGTH } = require('../../shared/sanitize');

const VALID_RECURRENCES = ['none', 'daily', 'weekly', 'monthly'];
const MAX_CONTENT_LENGTH = 800;

const isValidTimezone = (tz) => {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const isInt = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;

/**
 * Validate a schedule/update payload.
 * Returns null on success, or an error string.
 */
const validateMessagePayload = (body, { partial = false } = {}) => {
  const { content, sendAt, recurrence, recurrenceConfig } = body;

  if (!partial || content !== undefined) {
    if (typeof content !== 'string' || !content.trim()) {
      return 'Message content is required';
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return `Message content exceeds ${MAX_CONTENT_LENGTH} characters`;
    }
    // SMS limit applies to the sanitized (ASCII) form, since that's what we
    // actually POST to the Free Mobile API. Sanitization can expand (œ→oe,
    // …→...) or shrink (emoji dropped).
    const sanitizedLen = sanitizeMessage(content).length;
    if (sanitizedLen > MAX_SMS_LENGTH) {
      return `Message exceeds ${MAX_SMS_LENGTH} characters after sanitization (${sanitizedLen})`;
    }
    if (sanitizedLen === 0) {
      return 'Message is empty after sanitization';
    }
  }

  if (!partial || recurrence !== undefined) {
    if (recurrence !== undefined && !VALID_RECURRENCES.includes(recurrence)) {
      return `Invalid recurrence (allowed: ${VALID_RECURRENCES.join(', ')})`;
    }
  }

  const effectiveRecurrence = recurrence ?? 'none';

  if (effectiveRecurrence === 'none') {
    if (!partial && !sendAt) {
      return 'Send date is required for one-time messages';
    }
    if (sendAt !== undefined && sendAt !== null) {
      const parsed = new Date(sendAt);
      if (Number.isNaN(parsed.getTime())) {
        return 'Invalid sendAt date';
      }
    }
  } else {
    if (!recurrenceConfig || typeof recurrenceConfig !== 'object') {
      if (!partial) return 'Recurrence configuration is required';
    } else {
      const { hour, minute, daysOfWeek, dayOfMonth, timezone } = recurrenceConfig;

      if (!isInt(hour, 0, 23)) return 'Invalid hour (0-23)';
      if (!isInt(minute, 0, 59)) return 'Invalid minute (0-59)';

      if (effectiveRecurrence === 'weekly') {
        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
          return 'daysOfWeek must be a non-empty array';
        }
        if (!daysOfWeek.every((d) => isInt(d, 0, 6))) {
          return 'daysOfWeek entries must be 0..6';
        }
      }

      if (effectiveRecurrence === 'monthly') {
        if (!isInt(dayOfMonth, 1, 31)) {
          return 'dayOfMonth must be 1..31';
        }
      }

      if (timezone !== undefined && !isValidTimezone(timezone)) {
        return 'Invalid timezone (must be an IANA zone)';
      }
    }
  }

  return null;
};

module.exports = {
  validateMessagePayload,
  isValidTimezone,
  MAX_CONTENT_LENGTH,
  VALID_RECURRENCES
};
