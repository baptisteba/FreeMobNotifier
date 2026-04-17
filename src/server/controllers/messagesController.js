const Message = require('../models/Message');
const schedulerService = require('../services/schedulerService');
const freeMobileService = require('../services/freeMobileService');
const { validateMessagePayload } = require('../validators/messageValidator');

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

    const validationError = validateMessagePayload(
      { content, recurrence: 'none', sendAt: new Date().toISOString() }
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Send the message (with automatic retries)
    const result = await freeMobileService.sendSMS(content);

    // Determine final status based on result
    let status = 'sent';
    if (!result.success) {
      if (result.maxRetriesReached || !result.retryable) {
        status = 'error';
      } else {
        status = 'failed';
      }
    }

    // Create a record of the message
    const message = new Message({
      content,
      recurrence: 'none',
      status: status,
      error: result.success ? null : result.message,
      lastSent: result.success ? new Date() : null,
      retryCount: result.retryCount || 0
    });

    await message.save();

    if (result.success) {
      res.json({
        success: true,
        message: 'Message sent successfully',
        data: message,
        retryCount: result.retryCount || 0
      });
    } else {
      res.status(result.status || 500).json({
        success: false,
        message: result.message,
        data: message,
        retryCount: result.retryCount || 0,
        maxRetriesReached: result.maxRetriesReached || false
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

    const validationError = validateMessagePayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

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

    if (message.status !== 'pending') {
      return res.status(409).json({
        error: 'Only pending messages can be edited'
      });
    }

    const validationError = validateMessagePayload(req.body, { partial: true });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (content !== undefined) message.content = content;
    if (sendAt !== undefined) message.sendAt = sendAt ? new Date(sendAt) : null;
    if (recurrence !== undefined) message.recurrence = recurrence;
    if (recurrenceConfig !== undefined) message.recurrenceConfig = recurrenceConfig;
    if (status !== undefined) message.status = status;

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