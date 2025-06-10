const cron = require('node-cron');
const Message = require('../models/Message');
const freeMobileService = require('./freeMobileService');

// Check for messages to send every minute
const SCHEDULER_INTERVAL = '* * * * *';

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
  
  // Daily maintenance task - clean up old non-recurring messages
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await Message.deleteMany({
        status: 'sent',
        recurrence: 'none',
        updatedAt: { $lt: thirtyDaysAgo }
      });
      
      console.log('Cleaned up old sent messages');
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
        
        // Send the message
        const result = await freeMobileService.sendSMS(message.content);
        
        if (result.success) {
          // Update message status
          message.status = 'sent';
          message.lastSent = now;
          message.error = null;
          
          // For recurring messages, set status back to pending for next time
          if (message.recurrence !== 'none') {
            message.status = 'pending';
          }
        } else {
          message.status = 'failed';
          message.error = result.message;
          
          // Retry failed messages after a delay, but not for recurring ones
          if (message.recurrence === 'none') {
            setTimeout(async () => {
              message.status = 'pending';
              await message.save();
            }, 60 * 60 * 1000); // Retry after 1 hour
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
      } else {
        message.status = 'failed';
        message.error = result.message;
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
  processScheduledMessages
}; 