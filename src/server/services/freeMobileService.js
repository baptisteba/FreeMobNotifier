const axios = require('axios');
const Setting = require('../models/Setting');

const API_URL = 'https://smsapi.free-mobile.fr/sendmsg';
const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 2000; // 2 seconds base delay

/**
 * Sanitize message content for Free Mobile API
 * Removes or replaces special characters that might cause issues
 * @param {string} message - Original message
 * @returns {string} Sanitized message
 */
const sanitizeMessage = (message) => {
  if (!message) return '';

  // Map of accented characters to their ASCII equivalents
  // Using Unicode escape sequences to avoid encoding issues
  const accentMap = {
    '\u00e0': 'a', '\u00e1': 'a', '\u00e2': 'a', '\u00e3': 'a', '\u00e4': 'a', '\u00e5': 'a', '\u00e6': 'ae',
    '\u00e7': 'c',
    '\u00e8': 'e', '\u00e9': 'e', '\u00ea': 'e', '\u00eb': 'e',
    '\u00ec': 'i', '\u00ed': 'i', '\u00ee': 'i', '\u00ef': 'i',
    '\u00f1': 'n',
    '\u00f2': 'o', '\u00f3': 'o', '\u00f4': 'o', '\u00f5': 'o', '\u00f6': 'o', '\u00f8': 'o', '\u0153': 'oe',
    '\u00f9': 'u', '\u00fa': 'u', '\u00fb': 'u', '\u00fc': 'u',
    '\u00fd': 'y', '\u00ff': 'y',
    '\u00c0': 'A', '\u00c1': 'A', '\u00c2': 'A', '\u00c3': 'A', '\u00c4': 'A', '\u00c5': 'A', '\u00c6': 'AE',
    '\u00c7': 'C',
    '\u00c8': 'E', '\u00c9': 'E', '\u00ca': 'E', '\u00cb': 'E',
    '\u00cc': 'I', '\u00cd': 'I', '\u00ce': 'I', '\u00cf': 'I',
    '\u00d1': 'N',
    '\u00d2': 'O', '\u00d3': 'O', '\u00d4': 'O', '\u00d5': 'O', '\u00d6': 'O', '\u00d8': 'O', '\u0152': 'OE',
    '\u00d9': 'U', '\u00da': 'U', '\u00db': 'U', '\u00dc': 'U',
    '\u00dd': 'Y', '\u0178': 'Y',
    // Special quotes and punctuation
    '\u201c': '"', '\u201d': '"', '\u00ab': '"', '\u00bb': '"',
    '\u2018': "'", '\u2019': "'", '\u0060': "'",
    '\u2026': '...',
    '\u2013': '-', '\u2014': '-',
    '\u00A0': ' ', // Non-breaking space
  };

  let sanitized = message;

  // Replace accented characters
  for (const [accent, replacement] of Object.entries(accentMap)) {
    sanitized = sanitized.split(accent).join(replacement);
  }

  // Remove any remaining non-ASCII characters that might cause issues
  // Keep only printable ASCII characters (space to tilde)
  sanitized = sanitized.replace(/[^\x20-\x7E\n\r]/g, '');

  return sanitized.trim();
};

/**
 * Wait for a specified delay
 * @param {number} ms - Milliseconds to wait
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determine if an error is retryable
 * @param {number} statusCode - HTTP status code
 * @returns {boolean} Whether the error is retryable
 */
const isRetryableError = (statusCode) => {
  // 500 - Server error (retryable)
  // 402 - Rate limit (retryable after delay)
  // Network errors are also retryable
  return statusCode === 500 || statusCode === 402 || statusCode === 0;
};

/**
 * Get error message for status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Human-readable error message
 */
const getErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 400:
      return 'Missing parameters or invalid message content';
    case 402:
      return 'Too many SMS sent in a short time (rate limited)';
    case 403:
      return 'Service not activated or invalid credentials';
    case 500:
      return 'Server error, please try again later';
    default:
      return `Unknown error (status: ${statusCode})`;
  }
};

/**
 * Send SMS via Free Mobile API with retry logic
 * @param {string} message - Message content
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Object} Response with status, message, and retry info
 */
const sendSMS = async (message, retryCount = 0) => {
  try {
    // Get credentials from database
    const settings = await Setting.getSettings();

    if (!settings.userId || !settings.apiKey) {
      return {
        success: false,
        message: 'API credentials not configured',
        status: 400,
        retryable: false,
        retryCount: retryCount
      };
    }

    // Sanitize the message
    const sanitizedMessage = sanitizeMessage(message);

    if (!sanitizedMessage) {
      return {
        success: false,
        message: 'Message is empty after sanitization',
        status: 400,
        retryable: false,
        retryCount: retryCount
      };
    }

    // Use GET request with URL-encoded parameters (more reliable with special chars)
    const params = new URLSearchParams({
      user: settings.userId,
      pass: settings.apiKey,
      msg: sanitizedMessage
    });

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      timeout: 30000 // 30 second timeout
    });

    // Success - API returns 200 with empty body
    return {
      success: true,
      message: 'SMS sent successfully',
      status: response.status,
      retryable: false,
      retryCount: retryCount,
      sanitizedMessage: sanitizedMessage
    };

  } catch (error) {
    let statusCode = 0;
    let errorMessage = 'Unknown error occurred';

    if (error.response) {
      statusCode = error.response.status;
      errorMessage = getErrorMessage(statusCode);
    } else if (error.request) {
      errorMessage = 'No response from server (network error)';
      statusCode = 0; // Network error
    } else {
      errorMessage = error.message;
    }

    // Check if we should retry
    const canRetry = isRetryableError(statusCode) && retryCount < MAX_RETRIES;

    if (canRetry) {
      // Calculate exponential backoff delay
      const retryDelay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      console.log(`SMS send failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}), retrying in ${retryDelay}ms...`);

      await delay(retryDelay);
      return sendSMS(message, retryCount + 1);
    }

    // All retries exhausted or non-retryable error
    return {
      success: false,
      message: errorMessage,
      status: statusCode,
      error: error.message,
      retryable: isRetryableError(statusCode),
      retryCount: retryCount,
      maxRetriesReached: retryCount >= MAX_RETRIES
    };
  }
};

/**
 * Send SMS without internal retries (for scheduler to handle retries)
 * @param {string} message - Message content
 * @returns {Object} Response with status and retry info
 */
const sendSMSOnce = async (message) => {
  try {
    const settings = await Setting.getSettings();

    if (!settings.userId || !settings.apiKey) {
      return {
        success: false,
        message: 'API credentials not configured',
        status: 400,
        retryable: false
      };
    }

    const sanitizedMessage = sanitizeMessage(message);

    if (!sanitizedMessage) {
      return {
        success: false,
        message: 'Message is empty after sanitization',
        status: 400,
        retryable: false
      };
    }

    const params = new URLSearchParams({
      user: settings.userId,
      pass: settings.apiKey,
      msg: sanitizedMessage
    });

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      timeout: 30000
    });

    return {
      success: true,
      message: 'SMS sent successfully',
      status: response.status,
      retryable: false,
      sanitizedMessage: sanitizedMessage
    };

  } catch (error) {
    let statusCode = 0;
    let errorMessage = 'Unknown error occurred';

    if (error.response) {
      statusCode = error.response.status;
      errorMessage = getErrorMessage(statusCode);
    } else if (error.request) {
      errorMessage = 'No response from server (network error)';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      status: statusCode,
      error: error.message,
      retryable: isRetryableError(statusCode)
    };
  }
};

module.exports = {
  sendSMS,
  sendSMSOnce,
  sanitizeMessage,
  MAX_RETRIES
};
