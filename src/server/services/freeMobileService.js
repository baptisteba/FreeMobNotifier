const axios = require('axios');
const Setting = require('../models/Setting');
const { sanitizeMessage, MAX_SMS_LENGTH } = require('../../shared/sanitize');

const API_URL = 'https://smsapi.free-mobile.fr/sendmsg';
const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 2000; // 2 seconds base delay

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
 * Compute the next retry delay (ms) for a given failure.
 * 402 (rate-limit) needs a much longer window than 500/network errors.
 */
const computeBackoffMs = (statusCode, retryCount) => {
  if (statusCode === 402) {
    return 60_000 + Math.floor(Math.random() * 60_000);
  }
  const jitter = Math.floor(Math.random() * 1000);
  return RETRY_DELAY_BASE * Math.pow(2, retryCount) + jitter;
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

    if (sanitizedMessage.length > MAX_SMS_LENGTH) {
      return {
        success: false,
        message: `Message exceeds ${MAX_SMS_LENGTH} characters after sanitization (${sanitizedMessage.length}). Shorten it before sending.`,
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
      const retryDelay = computeBackoffMs(statusCode, retryCount);
      console.log(`SMS send failed (status ${statusCode}, attempt ${retryCount + 1}/${MAX_RETRIES + 1}), retrying in ${retryDelay}ms...`);

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

    if (sanitizedMessage.length > MAX_SMS_LENGTH) {
      return {
        success: false,
        message: `Message exceeds ${MAX_SMS_LENGTH} characters after sanitization (${sanitizedMessage.length}).`,
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
  isRetryableError,
  computeBackoffMs,
  MAX_RETRIES
};
