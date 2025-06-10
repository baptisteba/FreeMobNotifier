const Setting = require('../models/Setting');

// Get current settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    
    // Don't send the actual API key for security, just whether it's set
    const hasApiKey = !!settings.apiKey;
    
    res.json({
      userId: settings.userId,
      hasApiKey,
      updatedAt: settings.updatedAt
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const { userId, apiKey } = req.body;
    
    if (!userId || !apiKey) {
      return res.status(400).json({ error: 'User ID and API key are required' });
    }
    
    let settings = await Setting.getSettings();
    
    settings.userId = userId;
    settings.apiKey = apiKey;
    settings.updatedAt = new Date();
    
    await settings.save();
    
    res.json({
      userId: settings.userId,
      hasApiKey: true,
      updatedAt: settings.updatedAt,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
}; 