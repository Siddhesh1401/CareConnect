/**
 * Simple logger utility to control verbosity based on environment
 */

interface LoggerConfig {
  enableVerbose: boolean;
  enableEmailLogs: boolean;
  enableRequestLogs: boolean;
}

const config: LoggerConfig = {
  enableVerbose: process.env.NODE_ENV === 'development',
  enableEmailLogs: process.env.NODE_ENV === 'development',
  enableRequestLogs: process.env.NODE_ENV === 'development'
};

// Override with environment variables if set
if (process.env.LOG_VERBOSE !== undefined) {
  config.enableVerbose = process.env.LOG_VERBOSE === 'true';
}
if (process.env.LOG_EMAIL !== undefined) {
  config.enableEmailLogs = process.env.LOG_EMAIL === 'true';
}
if (process.env.LOG_REQUESTS !== undefined) {
  config.enableRequestLogs = process.env.LOG_REQUESTS === 'true';
}

export const logger = {
  // Basic logging (always enabled)
  info: (message: string, ...args: any[]) => {
    console.log(`ℹ️ ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },

  success: (message: string, ...args: any[]) => {
    console.log(`✅ ${message}`, ...args);
  },

  // Verbose logging (only in development or when enabled)
  verbose: (message: string, ...args: any[]) => {
    if (config.enableVerbose) {
      console.log(`🔍 ${message}`, ...args);
    }
  },

  // Email-specific logging
  email: (message: string, ...args: any[]) => {
    if (config.enableEmailLogs) {
      console.log(`📧 ${message}`, ...args);
    }
  },

  // Request logging
  request: (message: string, ...args: any[]) => {
    if (config.enableRequestLogs) {
      console.log(`🌐 ${message}`, ...args);
    }
  },

  // Debug logging (only in development)
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, ...args);
    }
  }
};

export default logger;