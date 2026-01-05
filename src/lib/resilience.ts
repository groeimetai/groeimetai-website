/**
 * Resilience Utilities for GroeimetAI
 *
 * Provides:
 * - Timeout wrapper for async operations
 * - Circuit breaker pattern for external services
 * - Retry logic with exponential backoff
 */

import { logger } from './logger';

// ============================================
// TIMEOUT UTILITIES
// ============================================

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap an async operation with a timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName: string = 'Operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([operation(), timeoutPromise]);
}

// ============================================
// CIRCUIT BREAKER
// ============================================

export type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerOptions {
  /** Name for logging */
  name: string;
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting to close circuit */
  resetTimeout: number;
  /** Number of successful calls needed to close circuit from half-open */
  successThreshold: number;
  /** Optional timeout for each operation */
  timeout?: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  nextAttempt: number | null;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Get or create circuit breaker state
 */
function getCircuitState(name: string): CircuitBreakerState {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, {
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailure: null,
      nextAttempt: null,
    });
  }
  return circuitBreakers.get(name)!;
}

/**
 * Circuit breaker wrapper for external service calls
 */
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  options: CircuitBreakerOptions
): Promise<T> {
  const { name, failureThreshold, resetTimeout, successThreshold, timeout } = options;
  const circuit = getCircuitState(name);

  // Check if circuit is open
  if (circuit.state === 'open') {
    const now = Date.now();
    if (circuit.nextAttempt && now >= circuit.nextAttempt) {
      // Transition to half-open
      circuit.state = 'half-open';
      circuit.successes = 0;
      logger.info(`Circuit breaker ${name} transitioning to half-open`, { component: 'circuit-breaker' });
    } else {
      const waitTime = circuit.nextAttempt ? circuit.nextAttempt - now : resetTimeout;
      throw new CircuitOpenError(
        `Circuit breaker ${name} is open. Retry in ${Math.ceil(waitTime / 1000)}s`,
        name,
        waitTime
      );
    }
  }

  try {
    // Execute operation with optional timeout
    const result = timeout
      ? await withTimeout(operation, timeout, name)
      : await operation();

    // Handle success
    if (circuit.state === 'half-open') {
      circuit.successes++;
      if (circuit.successes >= successThreshold) {
        // Close the circuit
        circuit.state = 'closed';
        circuit.failures = 0;
        circuit.successes = 0;
        circuit.lastFailure = null;
        circuit.nextAttempt = null;
        logger.info(`Circuit breaker ${name} closed after ${successThreshold} successes`, {
          component: 'circuit-breaker',
        });
      }
    } else {
      // Reset failures on success in closed state
      circuit.failures = 0;
    }

    return result;
  } catch (error) {
    // Handle failure
    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.state === 'half-open') {
      // Back to open
      circuit.state = 'open';
      circuit.nextAttempt = Date.now() + resetTimeout;
      logger.warn(`Circuit breaker ${name} reopened after failure in half-open state`, {
        component: 'circuit-breaker',
      });
    } else if (circuit.failures >= failureThreshold) {
      // Open the circuit
      circuit.state = 'open';
      circuit.nextAttempt = Date.now() + resetTimeout;
      logger.error(
        `Circuit breaker ${name} opened after ${failureThreshold} failures`,
        { component: 'circuit-breaker', failures: circuit.failures },
        error as Error
      );
    }

    throw error;
  }
}

export class CircuitOpenError extends Error {
  constructor(
    message: string,
    public readonly circuitName: string,
    public readonly retryAfterMs: number
  ) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

// ============================================
// RETRY LOGIC
// ============================================

interface RetryOptions {
  /** Maximum number of attempts */
  maxAttempts: number;
  /** Initial delay in ms */
  initialDelay: number;
  /** Maximum delay in ms */
  maxDelay: number;
  /** Backoff multiplier */
  backoffFactor: number;
  /** Optional function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Operation name for logging */
  operationName?: string;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  isRetryable: () => true,
  operationName: 'Operation',
};

/**
 * Retry an operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!opts.isRetryable!(lastError)) {
        logger.warn(`${opts.operationName} failed with non-retryable error`, {
          component: 'retry',
          attempt,
          error: lastError.message,
        });
        throw lastError;
      }

      // Check if we have more attempts
      if (attempt >= opts.maxAttempts) {
        logger.error(
          `${opts.operationName} failed after ${opts.maxAttempts} attempts`,
          { component: 'retry', attempts: opts.maxAttempts },
          lastError
        );
        throw lastError;
      }

      // Log retry attempt
      logger.warn(`${opts.operationName} failed, retrying in ${delay}ms`, {
        component: 'retry',
        attempt,
        nextAttemptIn: delay,
        error: lastError.message,
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay with exponential backoff
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  throw lastError!;
}

// ============================================
// COMBINED RESILIENCE WRAPPER
// ============================================

interface ResilientCallOptions {
  /** Operation name for logging */
  name: string;
  /** Timeout in ms (default: 30000) */
  timeout?: number;
  /** Circuit breaker options */
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
    successThreshold?: number;
  };
  /** Retry options */
  retry?: {
    maxAttempts?: number;
    initialDelay?: number;
    isRetryable?: (error: Error) => boolean;
  };
}

/**
 * Combined resilience wrapper with timeout, circuit breaker, and retry
 */
export async function resilientCall<T>(
  operation: () => Promise<T>,
  options: ResilientCallOptions
): Promise<T> {
  const { name, timeout = 30000 } = options;

  // Build the call chain from inside out:
  // retry -> circuit breaker -> timeout -> operation

  let wrappedOperation = operation;

  // Apply timeout
  wrappedOperation = () => withTimeout(wrappedOperation, timeout, name);

  // Apply circuit breaker if configured
  if (options.circuitBreaker) {
    const cb = options.circuitBreaker;
    const cbOperation = wrappedOperation;
    wrappedOperation = () =>
      withCircuitBreaker(cbOperation, {
        name,
        failureThreshold: cb.failureThreshold ?? 5,
        resetTimeout: cb.resetTimeout ?? 60000,
        successThreshold: cb.successThreshold ?? 2,
      });
  }

  // Apply retry if configured
  if (options.retry) {
    const retryOpts = options.retry;
    const retryOperation = wrappedOperation;
    wrappedOperation = () =>
      withRetry(retryOperation, {
        maxAttempts: retryOpts.maxAttempts ?? 3,
        initialDelay: retryOpts.initialDelay ?? 1000,
        isRetryable: retryOpts.isRetryable,
        operationName: name,
      });
  }

  return wrappedOperation();
}

// ============================================
// FIRESTORE-SPECIFIC HELPERS
// ============================================

const FIRESTORE_TIMEOUT = 10000; // 10 seconds
const FIRESTORE_CIRCUIT_NAME = 'firestore';

/**
 * Wrap Firestore operations with resilience
 */
export async function resilientFirestoreCall<T>(
  operation: () => Promise<T>,
  operationName: string = 'Firestore operation'
): Promise<T> {
  return resilientCall(operation, {
    name: operationName,
    timeout: FIRESTORE_TIMEOUT,
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 30000,
      successThreshold: 2,
    },
    retry: {
      maxAttempts: 2,
      initialDelay: 500,
      isRetryable: (error) => {
        // Retry on network errors, not on permission errors
        const message = error.message.toLowerCase();
        return (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('unavailable') ||
          message.includes('deadline')
        );
      },
    },
  });
}

// ============================================
// EXTERNAL API HELPERS
// ============================================

/**
 * Wrap external API calls with resilience
 */
export async function resilientApiCall<T>(
  operation: () => Promise<T>,
  serviceName: string,
  options?: { timeout?: number; maxRetries?: number }
): Promise<T> {
  return resilientCall(operation, {
    name: `${serviceName} API call`,
    timeout: options?.timeout ?? 30000,
    circuitBreaker: {
      failureThreshold: 3,
      resetTimeout: 60000,
      successThreshold: 1,
    },
    retry: {
      maxAttempts: options?.maxRetries ?? 3,
      initialDelay: 1000,
      isRetryable: (error) => {
        // Retry on network and rate limit errors
        const message = error.message.toLowerCase();
        return (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('rate limit') ||
          message.includes('429') ||
          message.includes('503') ||
          message.includes('502')
        );
      },
    },
  });
}
