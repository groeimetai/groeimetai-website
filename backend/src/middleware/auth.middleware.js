import { auth } from '../config/firebase.config.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

/**
 * Authentication middleware for verifying Firebase ID tokens
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401);
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      customClaims: decodedToken
    };
    
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      next(new AppError('Authentication token expired', 401));
    } else if (error.code === 'auth/id-token-revoked') {
      next(new AppError('Authentication token revoked', 401));
    } else {
      next(new AppError('Invalid authentication token', 401));
    }
  }
};

/**
 * Middleware for checking user roles
 */
export const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const userRoles = req.user.customClaims.roles || [];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware for verifying custom JWT tokens (for internal services)
 */
export const verifyServiceToken = async (req, res, next) => {
  try {
    const token = req.headers['x-service-token'];
    
    if (!token) {
      throw new AppError('No service token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.service = decoded;
    
    next();
  } catch (error) {
    next(new AppError('Invalid service token', 401));
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        customClaims: decodedToken
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Rate limiting middleware factory
 */
export const createRateLimiter = (windowMs, maxRequests) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user?.uid || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [k, times] of requests.entries()) {
      const validTimes = times.filter(time => time > windowStart);
      if (validTimes.length === 0) {
        requests.delete(k);
      } else {
        requests.set(k, validTimes);
      }
    }
    
    // Check current user's requests
    const userRequests = requests.get(key) || [];
    if (userRequests.length >= maxRequests) {
      return next(new AppError('Too many requests', 429));
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

// Export commonly used rate limiters
export const apiRateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
);

export const authRateLimiter = createRateLimiter(
  300000, // 5 minutes
  5 // 5 attempts
);