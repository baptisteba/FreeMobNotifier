const cron = require('node-cron');
const Message = require('../models/Message');
const freeMobileService = require('./freeMobileService');

// Check for messages to send every minute
const SCHEDULER_INTERVAL = '* * * * *';

// Retry check interval (every 5 minutes)
const RETRY_INTERVAL = '*/5 * * * *';

// Initialize the scheduler
const initScheduler = () => {
  console.log('Starting message scheduler...');

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
      try {
        // For recurring messages, check if it's time to send
        if (message.recurrence !== 'none') {
          if (!shouldSendRecurringMessage(message, now)) {
            continue;
          }
        }

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
            console.log(`Message ${message._id} marked as error after ${message.retryCount} attempts`);
          } else if (result.retryable) {
            // Retryable error - keep as failed for retry scheduler
            message.status = 'failed';
            console.log(`Message ${message._id} failed (attempt ${message.retryCount}/${freeMobileService.MAX_RETRIES}), will retry`);
          } else {
            // Non-retryable error (e.g., 400, 403) - mark as permanent error immediately
            message.status = 'error';
            console.log(`Message ${message._id} failed with non-retryable error: ${result.message}`);
          }
        }

        await message.save();
      } catch (error) {
        console.error(`Error processing message ${message._id}:`, error);
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
    const failedMessages = await Message.find({
      status: 'failed',
      retryCount: { $lt: freeMobileService.MAX_RETRIES }
    });

    if (failedMessages.length > 0) {
      console.log(`Found ${failedMessages.length} failed messages to retry`);
    }

    for (const message of failedMessages) {
      try {
        const result = await freeMobileService.sendSMSOnce(message.content);
        const now = new Date();

        if (result.success) {
          message.status = 'sent';
          message.lastSent = now;
          message.error = null;
          console.log(`Message ${message._id} sent successfully on retry`);
        } else {
          message.retryCount = (message.retryCount || 0) + 1;
          message.error = result.message;

          if (message.retryCount >= freeMobileService.MAX_RETRIES) {
            message.status = 'error';
            console.log(`Message ${message._id} marked as error after ${message.retryCount} retry attempts`);
          } else if (!result.retryable) {
            // Non-retryable error
            message.status = 'error';
            console.log(`Message ${message._id} failed with non-retryable error on retry`);
          } else {
            console.log(`Message ${message._id} retry failed (attempt ${message.retryCount}/${freeMobileService.MAX_RETRIES})`);
          }
        }

        await message.save();
      } catch (error) {
        console.error(`Error retrying message ${message._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing failed messages:', error);
  }
};

// Check if a recurring message should be sent now
const shouldSendRecurringMessage = (message, now) => {
  // If it was sent recently (within last hour), don't send again
  if (message.lastSent &&
    (now - message.lastSent) < (60 * 60 * 1000)) {
    return false;
  }

  const config = message.recurrenceConfig;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDayOfWeek = now.getDay(); // 0-6 (Sun-Sat)
  const currentDayOfMonth = now.getDate(); // 1-31

  // Check time (all recurrence patterns require matching hour/minute)
  if (config.hour !== currentHour || config.minute !== currentMinute) {
    return false;
  }

  switch (message.recurrence) {
    case 'daily':
      return true;

    case 'weekly':
      // Check if current day of week is in the specified days
      return config.daysOfWeek && config.daysOfWeek.includes(currentDayOfWeek);

    case 'monthly':
      // Check if current day of month matches
      return config.dayOfMonth === currentDayOfMonth;

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
  processFailedMessages
};
