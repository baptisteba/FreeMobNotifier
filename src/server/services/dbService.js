const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

// Define the database directory
const dbDir = path.join(process.cwd(), 'data');

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database collections
const db = {
  settings: new Datastore({ filename: path.join(dbDir, 'settings.db'), autoload: true }),
  messages: new Datastore({ filename: path.join(dbDir, 'messages.db'), autoload: true })
};

// Add timestamps to all documents
db.settings.ensureIndex({ fieldName: 'createdAt' });
db.messages.ensureIndex({ fieldName: 'createdAt' });
db.messages.ensureIndex({ fieldName: 'sendAt' });

/**
 * Database service to wrap @seald-io/nedb operations with promises
 */
const dbService = {
  // Settings operations
  settings: {
    findOne: (query = {}) => {
      return new Promise((resolve, reject) => {
        db.settings.findOne(query, (err, doc) => {
          if (err) return reject(err);
          resolve(doc);
        });
      });
    },
    
    insert: (doc) => {
      doc.createdAt = new Date();
      doc.updatedAt = new Date();
      
      return new Promise((resolve, reject) => {
        db.settings.insert(doc, (err, newDoc) => {
          if (err) return reject(err);
          resolve(newDoc);
        });
      });
    },
    
    update: (query, update, options = {}) => {
      update.$set = update.$set || {};
      update.$set.updatedAt = new Date();
      
      return new Promise((resolve, reject) => {
        db.settings.update(query, update, options, (err, numAffected) => {
          if (err) return reject(err);
          resolve(numAffected);
        });
      });
    }
  },
  
  // Messages operations
  messages: {
    find: (query = {}) => {
      return new Promise((resolve, reject) => {
        db.messages.find(query, (err, docs) => {
          if (err) return reject(err);
          
          // Sort messages by actual send time (lastSent) or creation time, newest first
          docs.sort((a, b) => {
            const timeA = a.lastSent || a.createdAt;
            const timeB = b.lastSent || b.createdAt;
            return new Date(timeB) - new Date(timeA);
          });
          
          resolve(docs);
        });
      });
    },
    
    findOne: (query) => {
      return new Promise((resolve, reject) => {
        db.messages.findOne(query, (err, doc) => {
          if (err) return reject(err);
          resolve(doc);
        });
      });
    },
    
    findById: (id) => {
      return new Promise((resolve, reject) => {
        db.messages.findOne({ _id: id }, (err, doc) => {
          if (err) return reject(err);
          resolve(doc);
        });
      });
    },
    
    insert: (doc) => {
      // Only set timestamps if they weren't explicitly provided
      if (!doc.createdAt) {
        doc.createdAt = new Date();
      }
      if (!doc.updatedAt) {
        doc.updatedAt = new Date();
      }
      
      return new Promise((resolve, reject) => {
        db.messages.insert(doc, (err, newDoc) => {
          if (err) return reject(err);
          resolve(newDoc);
        });
      });
    },
    
    update: (query, update, options = {}) => {
      update.$set = update.$set || {};
      update.$set.updatedAt = new Date();
      
      return new Promise((resolve, reject) => {
        db.messages.update(query, update, options, (err, numAffected) => {
          if (err) return reject(err);
          resolve(numAffected);
        });
      });
    },
    
    remove: (query, options = {}) => {
      return new Promise((resolve, reject) => {
        db.messages.remove(query, options, (err, numRemoved) => {
          if (err) return reject(err);
          resolve(numRemoved);
        });
      });
    }
  }
};

module.exports = dbService; 