const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Get settings
router.get('/', settingsController.getSettings);

// Update settings
router.put('/', settingsController.updateSettings);

// Test settings configuration by sending a test SMS
router.post('/test', settingsController.testSettings);

module.exports = router; 