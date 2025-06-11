const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const settingsRoutes = require('./routes/settings');
const messagesRoutes = require('./routes/messages');
const schedulerService = require('./services/schedulerService');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Starting FreeMobNotifier with local database (@seald-io/nedb)');
console.log('Database files will be stored in the ./data directory');

// API Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', messagesRoutes);

// Serve static files from the Vue app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle any requests that don't match the ones above
// Using a simple '*' route pattern to avoid path-to-regexp issues
app.get('*', (req, res) => {
  // Only serve the index.html for paths that don't start with /api
  if (!req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
  res.status(404).json({ error: 'Not found' });
});

// Initialize the scheduler
schedulerService.initScheduler();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server API available at: http://localhost:${PORT}/api`);
  console.log(`Frontend client available at: http://localhost:${PORT}`);
});

module.exports = app; 