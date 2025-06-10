const db = require('../services/dbService');

/**
 * Setting model for API credentials
 */
class Setting {
  constructor(data = {}) {
    this.userId = data.userId || '';
    this.apiKey = data.apiKey || '';
    this.updatedAt = data.updatedAt || new Date();
    this.createdAt = data.createdAt || new Date();
    this._id = data._id || null;
  }

  /**
   * Get the settings, creating default if none exist
   */
  static async getSettings() {
    try {
      let settings = await db.settings.findOne({});
      
      if (!settings) {
        settings = await db.settings.insert({
          userId: '',
          apiKey: ''
        });
      }
      
      return new Setting(settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  /**
   * Save the current settings
   */
  async save() {
    try {
      if (this._id) {
        // Update existing settings
        const query = { _id: this._id };
        const update = {
          $set: {
            userId: this.userId,
            apiKey: this.apiKey,
            updatedAt: new Date()
          }
        };
        
        await db.settings.update(query, update, { upsert: true });
        return this;
      } else {
        // Create new settings
        const data = {
          userId: this.userId,
          apiKey: this.apiKey,
          updatedAt: new Date()
        };
        
        const newSettings = await db.settings.insert(data);
        this._id = newSettings._id;
        return this;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
}

module.exports = Setting; 