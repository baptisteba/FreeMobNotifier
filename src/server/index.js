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

// Trust proxy for real IP and protocol detection when behind reverse proxy
if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors());
app.use(express.json());

// PWA-specific middleware for proper headers
app.use((req, res, next) => {
  // Set proper MIME types for PWA files
  if (req.path === '/manifest.json') {
    res.setHeader('Content-Type', 'application/manifest+json');
  }
  
  if (req.path === '/sw.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    // Prevent caching of service worker in production
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  if (req.path === '/browserconfig.xml') {
    res.setHeader('Content-Type', 'application/xml');
  }
  
  // Set security headers for PWA
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Set cache headers for static assets
  if (req.path.startsWith('/assets/') || req.path.startsWith('/icons/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  next();
});

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