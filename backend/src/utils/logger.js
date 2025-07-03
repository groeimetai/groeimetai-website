import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define which transports to use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
];

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Structured logging helpers
 */
export const log = {
  /**
   * Log an info message
   */
  info: (message, meta = {}) => {
    logger.info(message, { ...meta, timestamp: new Date().toISOString() });
  },

  /**
   * Log a warning
   */
  warn: (message, meta = {}) => {
    logger.warn(message, { ...meta, timestamp: new Date().toISOString() });
  },

  /**
   * Log an error
   */
  error: (message, error = null, meta = {}) => {
    const errorData = {
      ...meta,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      errorData.error = {
        message: error.message,
        stack: error.stack,
        ...error,
      };
    }

    logger.error(message, errorData);
  },

  /**
   * Log a debug message
   */
  debug: (message, meta = {}) => {
    logger.debug(message, { ...meta, timestamp: new Date().toISOString() });
  },

  /**
   * Log an HTTP request
   */
  http: (message, meta = {}) => {
    logger.http(message, { ...meta, timestamp: new Date().toISOString() });
  },

  /**
   * Log an API call
   */
  api: (method, endpoint, userId = null, meta = {}) => {
    logger.info('API Call', {
      method,
      endpoint,
      userId,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log a database operation
   */
  db: (operation, collection, documentId = null, meta = {}) => {
    logger.debug('Database Operation', {
      operation,
      collection,
      documentId,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log a service call
   */
  service: (service, action, meta = {}) => {
    logger.info('Service Call', {
      service,
      action,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log performance metrics
   */
  performance: (operation, duration, meta = {}) => {
    logger.info('Performance Metric', {
      operation,
      duration,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export both the logger instance and structured logging helpers
export { logger };
export default log;