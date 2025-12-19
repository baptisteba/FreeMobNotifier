const db = require('../services/dbService');

/**
 * Message model for storing scheduled messages
 */
class Message {
  constructor(data = {}) {
    this.content = data.content || '';
    this.sendAt = data.sendAt || null;
    this.recurrence = data.recurrence || 'none';
    this.recurrenceConfig = data.recurrenceConfig || {};
    this.status = data.status || 'pending'; // pending, sent, failed, error
    this.lastSent = data.lastSent || null;
    this.error = data.error || null;
    this.retryCount = data.retryCount || 0; // Track retry attempts (max 5)
    this.originalRecurringMessageId = data.originalRecurringMessageId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this._id = data._id || null;
  }

  /**
   * Find all messages with optional query
   */
  static async find(query = {}) {
    try {
      const messages = await db.messages.find(query);
      return messages.map(doc => new Message(doc));
    } catch (error) {
      console.error('Error finding messages:', error);
      throw error;
    }
  }

  /**
   * Find a message by ID
   */
  static async findById(id) {
    try {
      const message = await db.messages.findById(id);
      return message ? new Message(message) : null;
    } catch (error) {
      console.error(`Error finding message by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find and delete a message by ID
   */
  static async findByIdAndDelete(id) {
    try {
      const message = await db.messages.findById(id);
      if (!message) return null;
      
      await db.messages.remove({ _id: id }, { multi: false });
      return new Message(message);
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple messages
   */
  static async deleteMany(query) {
    try {
      const result = await db.messages.remove(query, { multi: true });
      return result;
    } catch (error) {
      console.error('Error deleting messages:', error);
      throw error;
    }
  }

  /**
   * Save the current message
   */
  async save() {
    try {
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing message
        const query = { _id: this._id };
        const update = {
          $set: {
            content: this.content,
            sendAt: this.sendAt,
            recurrence: this.recurrence,
            recurrenceConfig: this.recurrenceConfig,
            status: this.status,
            lastSent: this.lastSent,
            error: this.error,
            retryCount: this.retryCount,
            originalRecurringMessageId: this.originalRecurringMessageId,
            updatedAt: this.updatedAt
          }
        };
        
        await db.messages.update(query, update, { upsert: true });
        return this;
      } else {
        // Create new message
        const data = {
          content: this.content,
          sendAt: this.sendAt,
          recurrence: this.recurrence,
          recurrenceConfig: this.recurrenceConfig,
          status: this.status,
          lastSent: this.lastSent,
          error: this.error,
          retryCount: this.retryCount,
          originalRecurringMessageId: this.originalRecurringMessageId,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
        
        const newMessage = await db.messages.insert(data);
        this._id = newMessage._id;
        // Only update timestamps if they weren't explicitly provided
        if (!data.createdAt) {
          this.createdAt = newMessage.createdAt;
        }
        if (!data.updatedAt) {
          this.updatedAt = newMessage.updatedAt;
        }
        return this;
      }
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }
}

module.exports = Message; 