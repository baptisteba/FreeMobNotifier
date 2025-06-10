const axios = require('axios');
const Setting = require('../models/Setting');

const API_URL = 'https://smsapi.free-mobile.fr/sendmsg';

/**
 * Send SMS via Free Mobile API
 * @param {string} message - Message content
 * @returns {Object} Response with status and message
 */
const sendSMS = async (message) => {
  try {
    // Get credentials from database
    const settings = await Setting.getSettings();
    
    if (!settings.userId || !settings.apiKey) {
      return {
        success: false,
        message: 'API credentials not configured',
        status: 400
      };
    }

    // Make API request
    const response = await axios.post(API_URL, {
      user: settings.userId,
      pass: settings.apiKey,
      msg: message
    });

    // Handle response
    return {
      success: true,
      message: 'SMS sent successfully',
      status: response.status
    };
  } catch (error) {
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      
      switch (statusCode) {
        case 400:
          errorMessage = 'Missing parameters';
          break;
        case 402:
          errorMessage = 'Too many SMS sent in a short time';
          break;
        case 403:
          errorMessage = 'Service not activated or invalid credentials';
          break;
        case 500:
          errorMessage = 'Server error, please try again later';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      status: statusCode,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS
}; 