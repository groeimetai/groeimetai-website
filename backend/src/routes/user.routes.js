import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { 
  authenticateUser, 
  requireRole, 
  apiRateLimiter,
  authRateLimiter 
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
  authenticateUser,
  apiRateLimiter,
  (req, res, next) => {
    req.params.userId = req.user.uid;
    next();
  },
  UserController.getUserProfile
);

// Update current user profile
router.put(
  '/me',
  authenticateUser,
  apiRateLimiter,
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
  authenticateUser,
  apiRateLimiter,
  validateRequest(userValidation.getUserById),
  UserController.getUserProfile
);

// Update specific user profile
router.put(
  '/:userId',
  authenticateUser,
  apiRateLimiter,
  validateRequest(userValidation.updateProfile),
  UserController.updateUserProfile
);

// Delete user account
router.delete(
  '/:userId',
  authenticateUser,
  apiRateLimiter,
  validateRequest(userValidation.getUserById),
  UserController.deleteUser
);

/**
 * Admin only routes
 */
// List all users
router.get(
  '/',
  authenticateUser,
  requireRole('admin'),
  apiRateLimiter,
  validateRequest(userValidation.listUsers),
  UserController.listUsers
);

// Update user role
router.put(
  '/:userId/role',
  authenticateUser,
  requireRole('admin'),
  apiRateLimiter,
  validateRequest(userValidation.updateRole),
  UserController.updateUserRole
);

// Get user statistics
router.get(
  '/stats/overview',
  authenticateUser,
  requireRole('admin'),
  apiRateLimiter,
  UserController.getUserStats
);

export default router;