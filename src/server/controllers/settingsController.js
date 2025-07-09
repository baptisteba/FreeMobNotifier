const Setting = require('../models/Setting');
const freeMobileService = require('../services/freeMobileService');

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
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    let settings = await Setting.getSettings();
    
    settings.userId = userId;
    
    // Only update API key if it's provided
    if (apiKey) {
      settings.apiKey = apiKey;
    }
    
    settings.updatedAt = new Date();
    
    await settings.save();
    
    res.json({
      userId: settings.userId,
      hasApiKey: !!settings.apiKey,
      updatedAt: settings.updatedAt,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Test SMS configuration by sending a test notification
const testSettings = async (req, res) => {
  try {
    const testMessage = "Test de configuration Freemobnotifier Reussi";
    
    // Send the test message using the same process as "Envoyer maintenant"
    const result = await freeMobileService.sendSMS(testMessage);
    
    // Create a record of the test message
    const Message = require('../models/Message');
    const testRecord = new Message({
      content: testMessage,
      recurrence: 'none',
      status: result.success ? 'sent' : 'failed',
      error: result.success ? null : result.message,
      lastSent: result.success ? new Date() : null
    });
    
    await testRecord.save();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test notification sent successfully',
        data: testRecord
      });
    } else {
      res.status(result.status).json({
        success: false,
        message: result.message,
        data: testRecord
      });
    }
  } catch (error) {
    console.error('Error testing settings:', error);
    res.status(500).json({ error: 'Failed to test settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testSettings
}; 