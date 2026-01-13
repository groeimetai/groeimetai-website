import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import {
  authenticateUser,
  requireRole,
  apiRateLimiter,
  authRateLimiter,
} from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { userValidation } from '../validations/user.validation.js';

const router = Router();

/**
 * Public routes
 */
// Register new user
router.post(
  '/register',
  authRateLimiter,
  validateRequest(userValidation.register),
  UserController.registerUser
);

/**
 * Authenticated routes
 */
// Get current user profile
router.get(
  '/me',
  apiRateLimiter,
  authenticateUser,
  (req, res, next) => {
    req.params.userId = req.user.uid;
    next();
  },
  UserController.getUserProfile
);

// Update current user profile
router.put(
  '/me',
  apiRateLimiter,
  authenticateUser,
  validateRequest(userValidation.updateProfile),
  (req, res, next) => {
    req.params.userId = req.user.uid;
    next();
  },
  UserController.updateUserProfile
);

// Get specific user profile
router.get(
  '/:userId',
  apiRateLimiter,
  authenticateUser,
  validateRequest(userValidation.getUserById),
  UserController.getUserProfile
);

// Update specific user profile
router.put(
  '/:userId',
  apiRateLimiter,
  authenticateUser,
  validateRequest(userValidation.updateProfile),
  UserController.updateUserProfile
);

// Delete user account
router.delete(
  '/:userId',
  apiRateLimiter,
  authenticateUser,
  validateRequest(userValidation.getUserById),
  UserController.deleteUser
);

/**
 * Admin only routes
 */
// List all users
router.get(
  '/',
  apiRateLimiter,
  authenticateUser,
  requireRole('admin'),
  validateRequest(userValidation.listUsers),
  UserController.listUsers
);

// Update user role
router.put(
  '/:userId/role',
  apiRateLimiter,
  authenticateUser,
  requireRole('admin'),
  validateRequest(userValidation.updateRole),
  UserController.updateUserRole
);

// Get user statistics
router.get(
  '/stats/overview',
  apiRateLimiter,
  authenticateUser,
  requireRole('admin'),
  UserController.getUserStats
);

export default router;
