const Message = require('../models/Message');
const schedulerService = require('../services/schedulerService');
const freeMobileService = require('../services/freeMobileService');

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

// Get a specific message
const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: 'Failed to retrieve message' });
  }
};

// Send a message immediately
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Send the message
    const result = await freeMobileService.sendSMS(content);
    
    // Create a record of the message
    const message = new Message({
      content,
      recurrence: 'none',
      status: result.success ? 'sent' : 'failed',
      error: result.success ? null : result.message,
      lastSent: result.success ? new Date() : null
    });
    
    await message.save();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } else {
      res.status(result.status).json({
        success: false,
        message: result.message,
        data: message
      });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Schedule a message for later
const scheduleMessage = async (req, res) => {
  try {
    const { content, sendAt, recurrence, recurrenceConfig } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // For one-time messages, sendAt is required
    if (recurrence === 'none' && !sendAt) {
      return res.status(400).json({ error: 'Send date is required for one-time messages' });
    }
    
    // For recurring messages, check if recurrenceConfig is valid
    if (recurrence !== 'none') {
      if (!recurrenceConfig) {
        return res.status(400).json({ error: 'Recurrence configuration is required' });
      }
      
      // Validate configuration based on recurrence type
      switch (recurrence) {
        case 'daily':
          if (recurrenceConfig.hour === undefined || recurrenceConfig.minute === undefined) {
            return res.status(400).json({ error: 'Hour and minute are required for daily recurrence' });
          }
          break;
          
        case 'weekly':
          if (!recurrenceConfig.daysOfWeek || !recurrenceConfig.daysOfWeek.length || 
              recurrenceConfig.hour === undefined || recurrenceConfig.minute === undefined) {
            return res.status(400).json({ error: 'Days of week, hour, and minute are required for weekly recurrence' });
          }
          break;
          
        case 'monthly':
          if (recurrenceConfig.dayOfMonth === undefined || 
              recurrenceConfig.hour === undefined || recurrenceConfig.minute === undefined) {
            return res.status(400).json({ error: 'Day of month, hour, and minute are required for monthly recurrence' });
          }
          break;
      }
    }
    
    // Create the message
    const messageData = {
      content,
      sendAt: sendAt ? new Date(sendAt) : null,
      recurrence: recurrence || 'none',
      recurrenceConfig: recurrenceConfig || {},
      status: 'pending'
    };
    
    const message = await schedulerService.scheduleMessage(messageData);
    
    res.status(201).json({
      success: true,
      message: 'Message scheduled successfully',
      data: message
    });
  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({ error: 'Failed to schedule message' });
  }
};

// Update a message
const updateMessage = async (req, res) => {
  try {
    const { content, sendAt, recurrence, recurrenceConfig, status } = req.body;
    
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Only update fields that are provided
    if (content) message.content = content;
    if (sendAt) message.sendAt = new Date(sendAt);
    if (recurrence) message.recurrence = recurrence;
    if (recurrenceConfig) message.recurrenceConfig = recurrenceConfig;
    if (status) message.status = status;
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Clear messages history with options
const clearHistory = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    let query = {};
    let messageType = '';
    
    switch (type) {
      case 'sent':
        query = { status: { $in: ['sent', 'failed'] } };
        messageType = 'historique des messages envoyés';
        break;
      case 'scheduled':
        query = { status: 'pending' };
        messageType = 'messages programmés';
        break;
      case 'all':
      default:
        query = {};
        messageType = 'historique complet';
        break;
    }
    
    const result = await Message.deleteMany(query);
    
    res.json({
      success: true,
      message: `${messageType} vidé avec succès`,
      deletedCount: result.deletedCount,
      type: type
    });
  } catch (error) {
    console.error('Error clearing message history:', error);
    res.status(500).json({ error: 'Failed to clear message history' });
  }
};

module.exports = {
  getMessages,
  getMessage,
  sendMessage,
  scheduleMessage,
  updateMessage,
  deleteMessage,
  clearHistory
}; 