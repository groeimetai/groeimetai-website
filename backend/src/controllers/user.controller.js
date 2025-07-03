import { auth, db, collections } from '../config/firebase.config.js';
import { AppError, createError } from '../utils/errors.js';
import log from '../utils/logger.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * User Controller - handles all user-related operations
 */
export const UserController = {
  /**
   * Register a new user
   */
  registerUser: asyncHandler(async (req, res) => {
    const { email, password, displayName, phoneNumber, role = 'client' } = req.body;

    log.api('POST', '/users/register', null, { email });

    try {
      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
        phoneNumber,
        emailVerified: false,
      });

      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, {
        roles: [role],
        registeredAt: new Date().toISOString(),
      });

      // Create user document in Firestore
      const userData = {
        uid: userRecord.uid,
        email,
        displayName,
        phoneNumber: phoneNumber || null,
        photoURL: null,
        role,
        status: 'active',
        emailVerified: false,
        profile: {
          bio: '',
          skills: [],
          experience: '',
          linkedIn: '',
          website: '',
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          language: 'en',
          timezone: 'UTC',
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          loginCount: 0,
        },
      };

      await db.collection(collections.users).doc(userRecord.uid).set(userData);

      // Send verification email
      const verificationLink = await auth.generateEmailVerificationLink(email);
      // TODO: Send email via SendGrid

      log.info('User registered successfully', { userId: userRecord.uid, email });

      res.status(201).json({
        success: true,
        data: {
          uid: userRecord.uid,
          email,
          displayName,
          role,
          emailVerified: false,
        },
        message: 'User registered successfully. Please check your email for verification.',
      });
    } catch (error) {
      log.error('User registration failed', error, { email });
      throw error;
    }
  }),

  /**
   * Get user profile
   */
  getUserProfile: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;

    log.api('GET', `/users/${userId}`, requestingUserId);

    // Check permissions
    if (userId !== requestingUserId && !req.user.customClaims.roles?.includes('admin')) {
      throw createError.authorization();
    }

    const userDoc = await db.collection(collections.users).doc(userId).get();

    if (!userDoc.exists) {
      throw createError.notFound('User');
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      data: userData,
    });
  }),

  /**
   * Update user profile
   */
  updateUserProfile: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;
    const updates = req.body;

    log.api('PUT', `/users/${userId}`, requestingUserId, { updates });

    // Check permissions
    if (userId !== requestingUserId && !req.user.customClaims.roles?.includes('admin')) {
      throw createError.authorization();
    }

    // Prevent updating protected fields
    const protectedFields = ['uid', 'email', 'role', 'metadata.createdAt'];
    protectedFields.forEach((field) => {
      delete updates[field];
    });

    // Update Firebase Auth profile if needed
    const authUpdates = {};
    if (updates.displayName) authUpdates.displayName = updates.displayName;
    if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
    if (updates.phoneNumber) authUpdates.phoneNumber = updates.phoneNumber;

    if (Object.keys(authUpdates).length > 0) {
      await auth.updateUser(userId, authUpdates);
    }

    // Update Firestore document
    const updateData = {
      ...updates,
      'metadata.updatedAt': new Date().toISOString(),
    };

    await db.collection(collections.users).doc(userId).update(updateData);

    log.info('User profile updated', { userId });

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role, addRoles, removeRoles } = req.body;
    const adminId = req.user.uid;

    log.api('PUT', `/users/${userId}/role`, adminId, { role, addRoles, removeRoles });

    // Get current user claims
    const user = await auth.getUser(userId);
    const currentRoles = user.customClaims?.roles || [];
    let newRoles = [...currentRoles];

    // Update roles
    if (role) {
      // Replace all roles with new role
      newRoles = [role];
    } else {
      // Add/remove specific roles
      if (addRoles) {
        newRoles = [...new Set([...newRoles, ...addRoles])];
      }
      if (removeRoles) {
        newRoles = newRoles.filter((r) => !removeRoles.includes(r));
      }
    }

    // Update custom claims
    await auth.setCustomUserClaims(userId, {
      ...user.customClaims,
      roles: newRoles,
    });

    // Update Firestore
    await db
      .collection(collections.users)
      .doc(userId)
      .update({
        role: newRoles[0] || 'client', // Primary role
        roles: newRoles,
        'metadata.updatedAt': new Date().toISOString(),
      });

    log.info('User role updated', { userId, newRoles, adminId });

    res.json({
      success: true,
      data: { roles: newRoles },
      message: 'User role updated successfully',
    });
  }),

  /**
   * List users (admin only)
   */
  listUsers: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      orderBy = 'metadata.createdAt',
      orderDirection = 'desc',
    } = req.query;

    log.api('GET', '/users', req.user.uid, { page, limit, role, status, search });

    let query = db.collection(collections.users);

    // Apply filters
    if (role) {
      query = query.where('role', '==', role);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    // Apply ordering
    query = query.orderBy(orderBy, orderDirection);

    // Calculate pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(parseInt(limit));

    const snapshot = await query.get();
    const users = [];

    snapshot.forEach((doc) => {
      const userData = doc.data();
      // Remove sensitive data
      delete userData.preferences;
      users.push(userData);
    });

    // Get total count
    let countQuery = db.collection(collections.users);
    if (role) countQuery = countQuery.where('role', '==', role);
    if (status) countQuery = countQuery.where('status', '==', status);

    const totalSnapshot = await countQuery.count().get();
    const total = totalSnapshot.data().count;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),

  /**
   * Delete user account
   */
  deleteUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const requestingUserId = req.user.uid;

    log.api('DELETE', `/users/${userId}`, requestingUserId);

    // Check permissions
    if (userId !== requestingUserId && !req.user.customClaims.roles?.includes('admin')) {
      throw createError.authorization();
    }

    // Soft delete in Firestore
    await db.collection(collections.users).doc(userId).update({
      status: 'deleted',
      'metadata.deletedAt': new Date().toISOString(),
      'metadata.deletedBy': requestingUserId,
    });

    // Disable Firebase Auth account
    await auth.updateUser(userId, { disabled: true });

    // TODO: Clean up user data in other collections

    log.info('User account deleted', { userId, deletedBy: requestingUserId });

    res.json({
      success: true,
      message: 'User account deleted successfully',
    });
  }),

  /**
   * Get user statistics (admin only)
   */
  getUserStats: asyncHandler(async (req, res) => {
    const adminId = req.user.uid;

    log.api('GET', '/users/stats', adminId);

    // Get user counts by role
    const roleStats = {};
    const roles = ['client', 'consultant', 'admin'];

    for (const role of roles) {
      const snapshot = await db
        .collection(collections.users)
        .where('role', '==', role)
        .where('status', '==', 'active')
        .count()
        .get();
      roleStats[role] = snapshot.data().count;
    }

    // Get registration stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSnapshot = await db
      .collection(collections.users)
      .where('metadata.createdAt', '>=', thirtyDaysAgo.toISOString())
      .count()
      .get();

    res.json({
      success: true,
      data: {
        totalUsers: Object.values(roleStats).reduce((a, b) => a + b, 0),
        byRole: roleStats,
        recentRegistrations: recentSnapshot.data().count,
        period: '30_days',
      },
    });
  }),
};
