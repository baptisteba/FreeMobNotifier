const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

// Get all messages
router.get('/', messagesController.getMessages);

// Get a specific message
router.get('/:id', messagesController.getMessage);

// Send a message immediately
router.post('/send', messagesController.sendMessage);

// Schedule a message
router.post('/schedule', messagesController.scheduleMessage);

// Update a message
router.put('/:id', messagesController.updateMessage);

// Delete a message
router.delete('/:id', messagesController.deleteMessage);

// Clear all messages history
router.delete('/', messagesController.clearHistory);

module.exports = router; 