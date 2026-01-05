/**
 * Structured Logger for GroeimetAI
 *
 * Provides consistent logging with:
 * - Log levels (debug, info, warn, error)
 * - Request IDs for tracing
 * - PII redaction
 * - Structured JSON output in production
 * - Pretty output in development
 */

import * as Sentry from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  component?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Sensitive keys to redact from logs
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'auth',
  'api_key',
  'apiKey',
  'private_key',
  'privateKey',
  'credit_card',
  'creditCard',
  'ssn',
  'email',
  'phone',
  'telefoon',
  'wachtwoord',
];

/**
 * Redact sensitive data from objects
 */
function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact email addresses
    return data.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL_REDACTED]'
    );
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }

  // Pretty format for development
  const timestamp = new Date(entry.timestamp).toLocaleTimeString('nl-NL');
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
  };
  const reset = '\x1b[0m';
  const color = levelColors[entry.level];

  let output = `${color}[${timestamp}] [${entry.level.toUpperCase()}]${reset} ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${JSON.stringify(entry.context)}`;
  }

  if (entry.error) {
    output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
    if (entry.error.stack && process.env.NODE_ENV === 'development') {
      output += `\n  Stack: ${entry.error.stack.split('\n').slice(1, 4).join('\n  ')}`;
    }
  }

  return output;
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? (redactSensitiveData(context) as LogContext) : undefined,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  const formattedEntry = formatLogEntry(entry);

  // Output to console
  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(formattedEntry);
      }
      break;
    case 'info':
      console.info(formattedEntry);
      break;
    case 'warn':
      console.warn(formattedEntry);
      // Send warnings to Sentry as breadcrumbs
      Sentry.addBreadcrumb({
        category: 'warning',
        message,
        level: 'warning',
        data: context,
      });
      break;
    case 'error':
      console.error(formattedEntry);
      // Send errors to Sentry
      if (error) {
        Sentry.captureException(error, {
          tags: {
            component: context?.component,
            action: context?.action,
          },
          extra: context,
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          tags: {
            component: context?.component,
            action: context?.action,
          },
          extra: context,
        });
      }
      break;
  }
}

/**
 * Logger interface
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext, error?: Error) =>
    log('error', message, context, error),

  /**
   * Create a child logger with preset context
   */
  child: (defaultContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...defaultContext, ...context }),
    error: (message: string, context?: LogContext, error?: Error) =>
      log('error', message, { ...defaultContext, ...context }, error),
  }),

  /**
   * Log with timing measurement
   */
  timed: async <T>(
    message: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      log('info', `${message} completed`, { ...context, duration });
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      log('error', `${message} failed`, { ...context, duration }, error as Error);
      throw error;
    }
  },
};

export default logger;
