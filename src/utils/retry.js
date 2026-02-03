import axios from "axios";
/**
 * Retries an axios request with exponential backoff.
 * @param {Function} requestFn - The axios request function to retry.
 * @param {number} maxRetries - Maximum number of retries (default: 3).
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000).
 * @returns {Promise} - The response from the successful request.
 */
export const retryRequest = async (
  requestFn,
  maxRetries = 3,
  initialDelay = 1000,
) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (error.response && error.response.status === 404) {
        throw error;
      }
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt); 
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};
/**
 * Enhances error messages based on the error type.
 * @param {Error} error - The error object from axios.
 * @returns {string} - A user-friendly error message.
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return "Bad request: Please check the input data.";
      case 401:
        return "Unauthorized: Invalid API key.";
      case 403:
        return "Forbidden: Access denied.";
      case 404:
        return "Not found: Location not found. Please check the spelling.";
      case 429:
        return "Too many requests: Please try again later.";
      case 500:
        return "Server error: Please try again later.";
      default:
        return `API error (${status}): ${error.response.data?.message || "Unknown error"}`;
    }
  } else if (error.request) {
    return "Network error: Unable to connect. Please check your internet connection.";
  } else {
    return `Unexpected error: ${error.message}`;
  }
};
