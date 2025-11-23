/**
 * Environment Configuration
 * Centralized configuration management for all environment variables
 */

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: "https://api.africartz.com/api",
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS) || 3,

  // App Configuration
  APP_NAME: process.env.REACT_APP_NAME || "AfricArtz Admin Dashboard",
  APP_VERSION: process.env.REACT_APP_VERSION || "1.0.0",
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || "production",

  // Feature Flags
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === "true",
  ENABLE_PUSH_NOTIFICATIONS: process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === "true",
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === "true",

  // Notification Configuration
  NOTIFICATION_CHECK_INTERVAL: parseInt(process.env.REACT_APP_NOTIFICATION_CHECK_INTERVAL) || 30000,
  MAX_NOTIFICATIONS_DISPLAY: parseInt(process.env.REACT_APP_MAX_NOTIFICATIONS_DISPLAY) || 50,

  // Development specific
  MOCK_NOTIFICATIONS: process.env.REACT_APP_MOCK_NOTIFICATIONS === "true",
  CONSOLE_LOGS: process.env.REACT_APP_CONSOLE_LOGS === "true",

  // Push Notification Keys (for future use)
  VAPID_PUBLIC_KEY: process.env.REACT_APP_VAPID_PUBLIC_KEY,
  FCM_SENDER_ID: process.env.REACT_APP_FCM_SENDER_ID,
};

// Environment helpers
export const isDevelopment = () => ENV_CONFIG.ENVIRONMENT === "development";
export const isProduction = () => ENV_CONFIG.ENVIRONMENT === "production";
export const isStaging = () => ENV_CONFIG.ENVIRONMENT === "staging";

// Debug logger (only logs in development or when debug mode is enabled)
export const debugLog = (...args) => {
  if (ENV_CONFIG.DEBUG_MODE || ENV_CONFIG.CONSOLE_LOGS || isDevelopment()) {
    console.log("[DEBUG]", ...args);
  }
};

// Validation function to ensure required environment variables are set
export const validateEnvironment = () => {
  const required = [
    'REACT_APP_API_BASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  debugLog("Environment configuration loaded:", {
    environment: ENV_CONFIG.ENVIRONMENT,
    apiBaseUrl: ENV_CONFIG.API_BASE_URL,
    appName: ENV_CONFIG.APP_NAME,
    featuresEnabled: {
      notifications: ENV_CONFIG.ENABLE_NOTIFICATIONS,
      pushNotifications: ENV_CONFIG.ENABLE_PUSH_NOTIFICATIONS,
      debugMode: ENV_CONFIG.DEBUG_MODE
    }
  });
};

// Export default config
export default ENV_CONFIG;