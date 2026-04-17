const cron = require('node-cron');
const Message = require('../models/Message');
const freeMobileService = require('./freeMobileService');

// Check for messages to send every minute
const SCHEDULER_INTERVAL = '* * * * *';

// Retry check interval (every 5 minutes)
const RETRY_INTERVAL = '*/5 * * * *';

// Guards against the 1-min and 5-min cron overlapping on the same message
// when a send takes longer than the tick interval.
const inFlight = new Set();

// Initialize the scheduler
const initScheduler = async () => {
  console.log('Starting message scheduler...');

  // Startup catch-up: send any one-time messages whose sendAt passed while the
  // server was down. Recurring messages with an exact hour+minute match in the
  // last minute also get a chance to fire via processScheduledMessages.
  try {
    console.log('[scheduler] startup catch-up');
    await processScheduledMessages();
  } catch (error) {
    console.error('Error in startup catch-up:', error);
  }

  // Schedule immediate messages check
  cron.schedule(SCHEDULER_INTERVAL, async () => {
    try {
      await processScheduledMessages();
    } catch (error) {
      console.error('Error in scheduler:', error);
    }
  });

  // Schedule retry check for failed messages
  cron.schedule(RETRY_INTERVAL, async () => {
    try {
      await processFailedMessages();
    } catch (error) {
      console.error('Error in retry scheduler:', error);
    }
  });

  // Daily maintenance task - clean up old non-recurring messages
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Message.deleteMany({
        status: { $in: ['sent', 'error'] },
        recurrence: 'none',
        updatedAt: { $lt: thirtyDaysAgo }
      });

      console.log('Cleaned up old sent/error messages');
    } catch (error) {
      console.error('Error in cleanup task:', error);
    }
  });

  console.log('Message scheduler initialized successfully');
};

// Process messages that need to be sent
const processScheduledMessages = async () => {
  const now = new Date();

  try {
    // Find messages scheduled for now or earlier
    const messagesToSend = await Message.find({
      $or: [
        // One-time messages due now
        {
          sendAt: { $lte: now },
          status: 'pending',
          recurrence: 'none'
        },
        // Recurring messages
        {
          recurrence: { $ne: 'none' },
          status: 'pending'
        }
      ]
    });

    if (messagesToSend.length > 0) {
      console.log(`Found ${messagesToSend.length} messages to process`);
    }

    for (const message of messagesToSend) {
      const msgKey = String(message._id);
      if (inFlight.has(msgKey)) continue;
      try {
        // For recurring messages, check if it's time to send
        if (message.recurrence !== 'none') {
          if (!shouldSendRecurringMessage(message, now)) {
            continue;
          }
        }

        inFlight.add(msgKey);
        // Send the message (single attempt, scheduler handles retries)
        const result = await freeMobileService.sendSMSOnce(message.content);

        if (result.success) {
          if (message.recurrence !== 'none') {
            // For recurring messages, create a separate history entry for each sent message
            const sentMessageHistory = new Message({
              content: message.content,
              sendAt: null,
              recurrence: 'none',
              recurrenceConfig: {},
              status: 'sent',
              lastSent: now,
              error: null,
              retryCount: 0,
              createdAt: now,
              updatedAt: now,
              originalRecurringMessageId: message._id
            });
            await sentMessageHistory.save();

            // Update the recurring message to track last sent time but keep it pending
            message.lastSent = now;
            message.error = null;
            message.retryCount = 0;
            // Keep status as 'pending' for next occurrence
          } else {
            // For one-time messages, update the original message
            message.status = 'sent';
            message.lastSent = now;
            message.error = null;
            message.retryCount = 0;
          }
          console.log(`Message ${message._id} sent successfully`);
        } else {
          // Handle failure
          message.retryCount = (message.retryCount || 0) + 1;
          message.error = result.message;

          if (message.retryCount >= freeMobileService.MAX_RETRIES) {
            // Max retries reached - mark as permanent error
            message.status = 'error';
            message.retryAfter = null;
            console.log(`Message ${message._id} marked as error after ${message.retryCount} attempts`);
          } else if (result.retryable) {
            // Retryable error - keep as failed for retry scheduler
            message.status = 'failed';
            const backoff = freeMobileService.computeBackoffMs(result.status, message.retryCount);
            message.retryAfter = new Date(Date.now() + backoff);
            console.log(`Message ${message._id} failed (attempt ${message.retryCount}/${freeMobileService.MAX_RETRIES}), will retry after ${message.retryAfter.toISOString()}`);
          } else {
            // Non-retryable error (e.g., 400, 403) - mark as permanent error immediately
            message.status = 'error';
            message.retryAfter = null;
            console.log(`Message ${message._id} failed with non-retryable error: ${result.message}`);
          }
        }

        await message.save();
      } catch (error) {
        console.error(`Error processing message ${message._id}:`, error);
      } finally {
        inFlight.delete(msgKey);
      }
    }
  } catch (error) {
    console.error('Error processing scheduled messages:', error);
  }
};

// Process failed messages for retry
const processFailedMessages = async () => {
  try {
    // Find failed messages that can still be retried
    const now = new Date();
    const failedMessages = await Message.find({
      status: 'failed',
      retryCount: { $lt: freeMobileService.MAX_RETRIES }
    });

    const dueMessages = failedMessages.filter(
      (m) => !m.retryAfter || new Date(m.retryAfter) <= now
    );

    if (dueMessages.length > 0) {
      console.log(`Found ${dueMessages.length} failed messages to retry`);
    }

    for (const message of dueMessages) {
      const msgKey = String(message._id);
      if (inFlight.has(msgKey)) continue;
      inFlight.add(msgKey);
      try {
        const result = await freeMobileService.sendSMSOnce(message.content);
        const now = new Date();

        if (result.success) {
          message.status = 'sent';
          message.lastSent = now;
          message.error = null;
          message.retryAfter = null;
          console.log(`Message ${message._id} sent successfully on retry`);
        } else {
          message.retryCount = (message.retryCount || 0) + 1;
          message.error = result.message;

          if (message.retryCount >= freeMobileService.MAX_RETRIES) {
            message.status = 'error';
            message.retryAfter = null;
            console.log(`Message ${message._id} marked as error after ${message.retryCount} retry attempts`);
          } else if (!result.retryable) {
            // Non-retryable error
            message.status = 'error';
            message.retryAfter = null;
            console.log(`Message ${message._id} failed with non-retryable error on retry`);
          } else {
            const backoff = freeMobileService.computeBackoffMs(result.status, message.retryCount);
            message.retryAfter = new Date(now.getTime() + backoff);
            console.log(`Message ${message._id} retry failed (attempt ${message.retryCount}/${freeMobileService.MAX_RETRIES}), next retry after ${message.retryAfter.toISOString()}`);
          }
        }

        await message.save();
      } catch (error) {
        console.error(`Error retrying message ${message._id}:`, error);
      } finally {
        inFlight.delete(msgKey);
      }
    }
  } catch (error) {
    console.error('Error processing failed messages:', error);
  }
};

// Short-weekday ("Sun"..."Sat") to 0..6 index
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/**
 * Resolve now into {hour, minute, dayOfWeek, dayOfMonth} for the
 * given IANA timezone. Falls back to the server's local time if tz is
 * missing or invalid (preserves pre-A1 behavior for older records).
 */
const resolveInTimezone = (now, tz) => {
  if (!tz) {
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      dayOfWeek: now.getDay(),
      dayOfMonth: now.getDate()
    };
  }
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      day: '2-digit'
    }).formatToParts(now);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    const hour = parseInt(get('hour'), 10) % 24; // "24" → 0 in some locales
    const minute = parseInt(get('minute'), 10);
    const dayOfMonth = parseInt(get('day'), 10);
    const dayOfWeek = WEEKDAY_INDEX[get('weekday')] ?? now.getDay();
    return { hour, minute, dayOfWeek, dayOfMonth };
  } catch {
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      dayOfWeek: now.getDay(),
      dayOfMonth: now.getDate()
    };
  }
};

// Check if a recurring message should be sent now
const shouldSendRecurringMessage = (message, now) => {
  // If it was sent recently (within last hour), don't send again
  if (message.lastSent &&
    (now - message.lastSent) < (60 * 60 * 1000)) {
    return false;
  }

  const config = message.recurrenceConfig || {};
  const { hour, minute, dayOfWeek, dayOfMonth } = resolveInTimezone(now, config.timezone);

  // Check time (all recurrence patterns require matching hour/minute)
  if (config.hour !== hour || config.minute !== minute) {
    return false;
  }

  switch (message.recurrence) {
    case 'daily':
      return true;

    case 'weekly':
      // Check if current day of week is in the specified days
      return config.daysOfWeek && config.daysOfWeek.includes(dayOfWeek);

    case 'monthly':
      // Check if current day of month matches
      return config.dayOfMonth === dayOfMonth;

    default:
      return false;
  }
};

// Schedule a new message
const scheduleMessage = async (messageData) => {
  try {
    const message = new Message(messageData);

    // For immediate sending
    if (!message.sendAt && message.recurrence === 'none') {
      const result = await freeMobileService.sendSMS(message.content);

      if (result.success) {
        message.status = 'sent';
        message.lastSent = new Date();
        message.retryCount = result.retryCount || 0;
      } else {
        if (result.maxRetriesReached || !result.retryable) {
          message.status = 'error';
        } else {
          message.status = 'failed';
        }
        message.error = result.message;
        message.retryCount = result.retryCount || 0;
      }
    }

    await message.save();
    return message;
  } catch (error) {
    console.error('Error scheduling message:', error);
    throw error;
  }
};

module.exports = {
  initScheduler,
  scheduleMessage,
  processScheduledMessages,
  processFailedMessages,
  shouldSendRecurringMessage,
  resolveInTimezone
};
