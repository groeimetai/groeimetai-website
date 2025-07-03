import { formatErrorResponse, AppError, mapFirebaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  let error = err;

  // Handle Firebase errors
  if (err.code && err.code.includes('/')) {
    error = mapFirebaseError(err);
  }

  // Handle MongoDB/Mongoose errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error = new AppError(errors.join(', '), 400);
    error.type = 'ValidationError';
  }

  if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400);
    error.type = 'ValidationError';
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
    error.type = 'ConflictError';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
    error.type = 'AuthenticationError';
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
    error.type = 'AuthenticationError';
  }

  // Ensure error has proper structure
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || 'Internal server error', 500, false);
  }

  // Log error
  const logData = {
    error: {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined
      },
      ip: req.ip,
      userAgent: req.get('user-agent')
    },
    user: req.user ? { uid: req.user.uid, email: req.user.email } : null
  };

  if (error.isOperational) {
    logger.warn('Operational error occurred', logData);
  } else {
    logger.error('Unexpected error occurred', logData);
  }

  // Send error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response = formatErrorResponse(error, isDevelopment);

  res.status(error.statusCode).json(response);
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  error.type = 'NotFoundError';
  next(error);
};

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error formatter middleware
 */
export const validationErrorHandler = (validator) => {
  return async (req, res, next) => {
    try {
      await validator(req);
      next();
    } catch (error) {
      const validationError = new AppError('Validation failed', 400);
      validationError.type = 'ValidationError';
      validationError.details = error.details || error.message;
      next(validationError);
    }
  };
};