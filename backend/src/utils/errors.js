/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  CONFLICT_ERROR: 'ConflictError',
  RATE_LIMIT_ERROR: 'RateLimitError',
  SERVER_ERROR: 'ServerError',
  SERVICE_UNAVAILABLE: 'ServiceUnavailable'
};

/**
 * Factory functions for common errors
 */
export const createError = {
  validation: (message, details = null) => {
    const error = new AppError(message, 400);
    error.type = ErrorTypes.VALIDATION_ERROR;
    error.details = details;
    return error;
  },
  
  authentication: (message = 'Authentication required') => {
    const error = new AppError(message, 401);
    error.type = ErrorTypes.AUTHENTICATION_ERROR;
    return error;
  },
  
  authorization: (message = 'Insufficient permissions') => {
    const error = new AppError(message, 403);
    error.type = ErrorTypes.AUTHORIZATION_ERROR;
    return error;
  },
  
  notFound: (resource = 'Resource') => {
    const error = new AppError(`${resource} not found`, 404);
    error.type = ErrorTypes.NOT_FOUND_ERROR;
    return error;
  },
  
  conflict: (message) => {
    const error = new AppError(message, 409);
    error.type = ErrorTypes.CONFLICT_ERROR;
    return error;
  },
  
  rateLimit: (retryAfter = null) => {
    const error = new AppError('Too many requests', 429);
    error.type = ErrorTypes.RATE_LIMIT_ERROR;
    error.retryAfter = retryAfter;
    return error;
  },
  
  server: (message = 'Internal server error') => {
    const error = new AppError(message, 500, false);
    error.type = ErrorTypes.SERVER_ERROR;
    return error;
  },
  
  serviceUnavailable: (service = 'Service') => {
    const error = new AppError(`${service} temporarily unavailable`, 503);
    error.type = ErrorTypes.SERVICE_UNAVAILABLE;
    return error;
  }
};

/**
 * Error response formatter
 */
export const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message || 'An error occurred',
      type: error.type || 'UnknownError',
      statusCode: error.statusCode || 500,
      timestamp: error.timestamp || new Date().toISOString()
    }
  };
  
  if (error.details) {
    response.error.details = error.details;
  }
  
  if (error.retryAfter) {
    response.error.retryAfter = error.retryAfter;
  }
  
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }
  
  return response;
};

/**
 * Firebase error mapper
 */
export const mapFirebaseError = (error) => {
  const errorMap = {
    'auth/email-already-exists': createError.conflict('Email already registered'),
    'auth/invalid-email': createError.validation('Invalid email address'),
    'auth/user-not-found': createError.notFound('User'),
    'auth/wrong-password': createError.authentication('Invalid credentials'),
    'auth/too-many-requests': createError.rateLimit(),
    'auth/network-request-failed': createError.serviceUnavailable('Authentication service'),
    'permission-denied': createError.authorization(),
    'not-found': createError.notFound(),
    'already-exists': createError.conflict('Resource already exists'),
    'resource-exhausted': createError.rateLimit(),
    'unavailable': createError.serviceUnavailable()
  };
  
  return errorMap[error.code] || createError.server(error.message);
};