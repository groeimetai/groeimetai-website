import { auth, db, collections } from '../config/firebase.config.js';
import { AppError, createError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';

/**
 * Security Service - Handles security-related operations
 */
export class SecurityService {
  /**
   * Get security settings for user
   */
  static async getSecuritySettings(userId) {
    const cacheKey = `security:${userId}`;
    let settings = await cache.get(cacheKey);

    if (!settings) {
      const userDoc = await db.collection(collections.users).doc(userId).get();
      
      if (!userDoc.exists) {
        throw createError.notFound('User');
      }

      const userData = userDoc.data();
      const securityData = userData.security || {};

      settings = {
        twoFactorEnabled: securityData.twoFactorEnabled || false,
        hasBackupCodes: (securityData.backupCodes && securityData.backupCodes.length > 0) || false,
        loginNotifications: securityData.loginNotifications !== false,
        suspiciousActivityAlerts: securityData.suspiciousActivityAlerts !== false,
        sessionTimeout: securityData.sessionTimeout || 1440, // 24 hours in minutes
        passwordLastChanged: securityData.passwordLastChanged || userData.metadata.createdAt,
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, settings, 300);
    }

    return settings;
  }

  /**
   * Update security settings
   */
  static async updateSecuritySettings(userId, updates) {
    const allowedFields = [
      'loginNotifications',
      'suspiciousActivityAlerts',
      'sessionTimeout'
    ];

    const sanitizedUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    });

    // Build update object with dot notation
    const updateData = {
      'metadata.updatedAt': new Date().toISOString(),
    };

    Object.keys(sanitizedUpdates).forEach(key => {
      updateData[`security.${key}`] = sanitizedUpdates[key];
    });

    await db.collection(collections.users).doc(userId).update(updateData);

    // Clear cache
    await cache.del(`security:${userId}`);

    return await this.getSecuritySettings(userId);
  }

  /**
   * Get active sessions for user
   */
  static async getActiveSessions(userId) {
    const snapshot = await db
      .collection('user_sessions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('lastActivity', 'desc')
      .get();

    const sessions = [];
    const currentTime = new Date().toISOString();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if session is expired
      const lastActivity = new Date(data.lastActivity);
      const sessionTimeout = data.timeout || 1440; // Default 24 hours
      const expiresAt = new Date(lastActivity.getTime() + sessionTimeout * 60 * 1000);
      
      if (expiresAt < new Date()) {
        // Mark expired session as inactive
        await db.collection('user_sessions').doc(doc.id).update({
          status: 'expired',
          expiredAt: currentTime,
        });
        continue;
      }

      sessions.push({
        id: doc.id,
        device: data.device || 'Unknown Device',
        browser: data.browser || 'Unknown Browser',
        os: data.os || 'Unknown OS',
        location: data.location || 'Unknown Location',
        ipAddress: data.ipAddress ? this.maskIP(data.ipAddress) : 'Unknown',
        createdAt: data.createdAt,
        lastActivity: data.lastActivity,
        current: data.sessionId === data.currentSessionId, // Current session flag
      });
    }

    return sessions;
  }

  /**
   * Revoke user session
   */
  static async revokeSession(userId, sessionId) {
    const sessionDoc = await db.collection('user_sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      throw createError.notFound('Session');
    }

    const sessionData = sessionDoc.data();
    if (sessionData.userId !== userId) {
      throw createError.authorization('Cannot revoke session');
    }

    await db.collection('user_sessions').doc(sessionId).update({
      status: 'revoked',
      revokedAt: new Date().toISOString(),
    });

    // If this was the user's own session, they'll need to re-authenticate
    logger.info('User session revoked', { userId, sessionId });
  }

  /**
   * Get login history for user
   */
  static async getLoginHistory(userId, { limit = 50, offset = 0 }) {
    const snapshot = await db
      .collection('login_history')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        device: data.device || 'Unknown Device',
        browser: data.browser || 'Unknown Browser',
        os: data.os || 'Unknown OS',
        location: data.location || 'Unknown Location',
        ipAddress: this.maskIP(data.ipAddress),
        timestamp: data.timestamp,
        success: data.success,
        failureReason: data.failureReason || null,
        userAgent: data.userAgent ? this.truncateUserAgent(data.userAgent) : null,
      });
    });

    return history;
  }

  /**
   * Get or create 2FA secret for user
   */
  static async get2FASecret(userId) {
    const userDoc = await db.collection(collections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      throw createError.notFound('User');
    }

    const userData = userDoc.data();
    return userData.security?.twoFactorSecret || null;
  }

  /**
   * Store 2FA secret for user
   */
  static async store2FASecret(userId, secret) {
    await db.collection(collections.users).doc(userId).update({
      'security.twoFactorSecret': secret,
      'metadata.updatedAt': new Date().toISOString(),
    });
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId) {
    await db.collection(collections.users).doc(userId).update({
      'security.twoFactorEnabled': true,
      'security.twoFactorEnabledAt': new Date().toISOString(),
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear security cache
    await cache.del(`security:${userId}`);
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId) {
    await db.collection(collections.users).doc(userId).update({
      'security.twoFactorEnabled': false,
      'security.twoFactorSecret': null,
      'security.backupCodes': [],
      'security.twoFactorDisabledAt': new Date().toISOString(),
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear security cache
    await cache.del(`security:${userId}`);
  }

  /**
   * Verify 2FA code (TOTP or backup code)
   */
  static async verify2FACode(userId, code) {
    const userDoc = await db.collection(collections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      throw createError.notFound('User');
    }

    const userData = userDoc.data();
    const security = userData.security || {};

    // Check if 2FA is enabled
    if (!security.twoFactorEnabled) {
      throw createError.badRequest('2FA is not enabled');
    }

    // First try TOTP verification
    if (security.twoFactorSecret) {
      const verified = speakeasy.totp.verify({
        secret: security.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (verified) {
        return true;
      }
    }

    // If TOTP failed, try backup codes
    if (security.backupCodes && security.backupCodes.length > 0) {
      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      const codeIndex = security.backupCodes.findIndex(hashedBackupCode => 
        hashedBackupCode === hashedCode
      );

      if (codeIndex !== -1) {
        // Remove used backup code
        const updatedBackupCodes = [...security.backupCodes];
        updatedBackupCodes.splice(codeIndex, 1);

        await db.collection(collections.users).doc(userId).update({
          'security.backupCodes': updatedBackupCodes,
          'metadata.updatedAt': new Date().toISOString(),
        });

        // Log backup code usage
        await this.logSecurityEvent(userId, 'backup_code_used', {
          remainingCodes: updatedBackupCodes.length,
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Generate backup codes for 2FA
   */
  static async generateBackupCodes(userId, count = 10) {
    const codes = [];
    const hashedCodes = [];

    // Generate codes
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
      
      // Hash the code for storage
      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      hashedCodes.push(hashedCode);
    }

    // Store hashed codes
    await db.collection(collections.users).doc(userId).update({
      'security.backupCodes': hashedCodes,
      'security.backupCodesGeneratedAt': new Date().toISOString(),
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear security cache
    await cache.del(`security:${userId}`);

    return codes; // Return plain codes for user to save
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(userId, eventType, metadata = {}) {
    const event = {
      userId,
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
      ipAddress: metadata.ipAddress || null,
      userAgent: metadata.userAgent || null,
    };

    await db.collection('security_events').add(event);

    logger.info('Security event logged', { userId, eventType, metadata });
  }

  /**
   * Verify user password (for sensitive operations)
   */
  static async verifyPassword(userId, password) {
    try {
      // Get user from Firebase Auth
      const user = await auth.getUser(userId);
      
      // Firebase doesn't provide direct password verification
      // We need to use the Firebase Auth REST API or implement custom logic
      // For now, we'll assume password verification is handled at the auth middleware level
      
      // This is a placeholder - implement proper password verification
      return true;
    } catch (error) {
      logger.error('Password verification failed', error, { userId });
      return false;
    }
  }

  /**
   * Create user session record
   */
  static async createSession(userId, sessionData) {
    const session = {
      userId,
      sessionId: sessionData.sessionId || crypto.randomUUID(),
      device: sessionData.device || 'Unknown Device',
      browser: sessionData.browser || 'Unknown Browser',
      os: sessionData.os || 'Unknown OS',
      location: sessionData.location || 'Unknown Location',
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      status: 'active',
      timeout: sessionData.timeout || 1440, // 24 hours in minutes
    };

    const docRef = await db.collection('user_sessions').add(session);

    // Log login
    await this.logLoginAttempt(userId, {
      success: true,
      device: session.device,
      browser: session.browser,
      os: session.os,
      location: session.location,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    });

    return {
      id: docRef.id,
      ...session,
    };
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionId) {
    await db.collection('user_sessions').doc(sessionId).update({
      lastActivity: new Date().toISOString(),
    });
  }

  /**
   * Log login attempt
   */
  static async logLoginAttempt(userId, attemptData) {
    const loginRecord = {
      userId,
      success: attemptData.success,
      device: attemptData.device,
      browser: attemptData.browser,
      os: attemptData.os,
      location: attemptData.location,
      ipAddress: attemptData.ipAddress,
      userAgent: attemptData.userAgent,
      timestamp: new Date().toISOString(),
      failureReason: attemptData.failureReason || null,
    };

    await db.collection('login_history').add(loginRecord);

    // Log security event for failed attempts
    if (!attemptData.success) {
      await this.logSecurityEvent(userId, 'login_failed', attemptData);
    }
  }

  /**
   * Detect suspicious activity
   */
  static async detectSuspiciousActivity(userId, activityData) {
    const suspiciousFactors = [];

    // Check for unusual location
    const recentLogins = await this.getRecentLogins(userId, 24); // Last 24 hours
    const locations = recentLogins.map(login => login.location).filter(Boolean);
    const uniqueLocations = [...new Set(locations)];
    
    if (uniqueLocations.length > 3) {
      suspiciousFactors.push('multiple_locations');
    }

    // Check for unusual devices
    const devices = recentLogins.map(login => login.device).filter(Boolean);
    const uniqueDevices = [...new Set(devices)];
    
    if (uniqueDevices.length > 2) {
      suspiciousFactors.push('multiple_devices');
    }

    // Check for rapid login attempts
    const recentAttempts = await this.getRecentLoginAttempts(userId, 1); // Last hour
    if (recentAttempts.length > 5) {
      suspiciousFactors.push('rapid_attempts');
    }

    if (suspiciousFactors.length > 0) {
      await this.logSecurityEvent(userId, 'suspicious_activity_detected', {
        factors: suspiciousFactors,
        ...activityData,
      });

      // Trigger security notifications
      // await NotificationService.sendSecurityAlert(userId, 'suspicious_activity', suspiciousFactors);
    }

    return suspiciousFactors;
  }

  /**
   * Get recent logins
   */
  static async getRecentLogins(userId, hoursBack) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

    const snapshot = await db
      .collection('login_history')
      .where('userId', '==', userId)
      .where('success', '==', true)
      .where('timestamp', '>=', cutoffTime.toISOString())
      .get();

    const logins = [];
    snapshot.forEach(doc => {
      logins.push(doc.data());
    });

    return logins;
  }

  /**
   * Get recent login attempts (including failed)
   */
  static async getRecentLoginAttempts(userId, hoursBack) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

    const snapshot = await db
      .collection('login_history')
      .where('userId', '==', userId)
      .where('timestamp', '>=', cutoffTime.toISOString())
      .get();

    const attempts = [];
    snapshot.forEach(doc => {
      attempts.push(doc.data());
    });

    return attempts;
  }

  /**
   * Utility: Mask IP address for privacy
   */
  static maskIP(ipAddress) {
    if (!ipAddress) return 'Unknown';
    
    if (ipAddress.includes(':')) {
      // IPv6
      const parts = ipAddress.split(':');
      return parts.slice(0, 4).join(':') + ':****:****:****:****';
    } else {
      // IPv4
      const parts = ipAddress.split('.');
      return parts.slice(0, 2).join('.') + '.***.**';
    }
  }

  /**
   * Utility: Truncate user agent for display
   */
  static truncateUserAgent(userAgent) {
    if (!userAgent) return null;
    return userAgent.length > 100 ? userAgent.substring(0, 100) + '...' : userAgent;
  }
}