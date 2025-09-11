import { auth, db, collections } from '../config/firebase.config.js';
import { AppError, createError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';
import crypto from 'crypto';

/**
 * Settings Service - Business logic for user settings
 */
export class SettingsService {
  /**
   * Default user preferences
   */
  static getDefaultPreferences() {
    return {
      language: 'en',
      timezone: 'UTC',
      theme: 'light',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      currency: 'USD',
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        screenReader: false,
      },
    };
  }

  /**
   * Default notification settings
   */
  static getDefaultNotificationSettings() {
    return {
      email: {
        marketing: true,
        updates: true,
        security: true,
        mentions: true,
        comments: true,
      },
      push: {
        enabled: true,
        marketing: false,
        updates: true,
        security: true,
        mentions: true,
        comments: true,
      },
      inApp: {
        mentions: true,
        comments: true,
        updates: true,
        achievements: true,
      },
    };
  }

  /**
   * Default privacy settings
   */
  static getDefaultPrivacySettings() {
    return {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowSearchEngines: true,
      dataProcessing: true,
      analytics: true,
      personalization: true,
    };
  }

  /**
   * Get user profile data
   */
  static async getProfile(userId) {
    const cacheKey = `profile:${userId}`;
    let profile = await cache.get(cacheKey);

    if (!profile) {
      const userDoc = await db.collection(collections.users).doc(userId).get();
      
      if (!userDoc.exists) {
        throw createError.notFound('User');
      }

      const userData = userDoc.data();
      profile = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        photoURL: userData.photoURL,
        bio: userData.profile?.bio || '',
        website: userData.profile?.website || '',
        location: userData.profile?.location || '',
        skills: userData.profile?.skills || [],
        experience: userData.profile?.experience || '',
        linkedIn: userData.profile?.linkedIn || '',
        status: userData.status,
        emailVerified: userData.emailVerified,
        metadata: userData.metadata,
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, profile, 300);
    }

    return profile;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updates) {
    // Sanitize updates
    const allowedFields = [
      'displayName', 'phoneNumber', 'photoURL', 'bio', 'website',
      'location', 'skills', 'experience', 'linkedIn'
    ];
    
    const sanitizedUpdates = {};
    const profileUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        if (['displayName', 'phoneNumber', 'photoURL'].includes(key)) {
          sanitizedUpdates[key] = updates[key];
        } else {
          profileUpdates[key] = updates[key];
        }
      }
    });

    // Update Firebase Auth if needed
    if (Object.keys(sanitizedUpdates).length > 0) {
      await auth.updateUser(userId, sanitizedUpdates);
    }

    // Update Firestore document
    const updateData = {
      ...sanitizedUpdates,
      'metadata.updatedAt': new Date().toISOString(),
    };

    // Add profile updates
    Object.keys(profileUpdates).forEach(key => {
      updateData[`profile.${key}`] = profileUpdates[key];
    });

    await db.collection(collections.users).doc(userId).update(updateData);

    // Clear cache
    await cache.del(`profile:${userId}`);
    
    // Return updated profile
    return await this.getProfile(userId);
  }

  /**
   * Get user preferences
   */
  static async getPreferences(userId) {
    const cacheKey = `preferences:${userId}`;
    let preferences = await cache.get(cacheKey);

    if (!preferences) {
      const userDoc = await db.collection(collections.users).doc(userId).get();
      
      if (!userDoc.exists) {
        throw createError.notFound('User');
      }

      const userData = userDoc.data();
      preferences = {
        ...this.getDefaultPreferences(),
        ...userData.preferences,
      };

      // Cache for 10 minutes
      await cache.set(cacheKey, preferences, 600);
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(userId, updates) {
    const currentPreferences = await this.getPreferences(userId);
    
    // Deep merge with current preferences
    const updatedPreferences = this.deepMerge(currentPreferences, updates);
    
    // Validate preferences
    this.validatePreferences(updatedPreferences);

    // Update Firestore
    await db.collection(collections.users).doc(userId).update({
      preferences: updatedPreferences,
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear cache
    await cache.del(`preferences:${userId}`);

    return updatedPreferences;
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(userId) {
    const cacheKey = `notifications:${userId}`;
    let notifications = await cache.get(cacheKey);

    if (!notifications) {
      const userDoc = await db.collection(collections.users).doc(userId).get();
      
      if (!userDoc.exists) {
        throw createError.notFound('User');
      }

      const userData = userDoc.data();
      notifications = {
        ...this.getDefaultNotificationSettings(),
        ...userData.notificationSettings,
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, notifications, 300);
    }

    return notifications;
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(userId, updates) {
    const currentSettings = await this.getNotificationSettings(userId);
    
    // Deep merge with current settings
    const updatedSettings = this.deepMerge(currentSettings, updates);

    // Update Firestore
    await db.collection(collections.users).doc(userId).update({
      notificationSettings: updatedSettings,
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear cache
    await cache.del(`notifications:${userId}`);

    return updatedSettings;
  }

  /**
   * Get privacy settings
   */
  static async getPrivacySettings(userId) {
    const cacheKey = `privacy:${userId}`;
    let privacy = await cache.get(cacheKey);

    if (!privacy) {
      const userDoc = await db.collection(collections.users).doc(userId).get();
      
      if (!userDoc.exists) {
        throw createError.notFound('User');
      }

      const userData = userDoc.data();
      privacy = {
        ...this.getDefaultPrivacySettings(),
        ...userData.privacySettings,
      };

      // Cache for 10 minutes
      await cache.set(cacheKey, privacy, 600);
    }

    return privacy;
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(userId, updates) {
    const currentSettings = await this.getPrivacySettings(userId);
    
    // Deep merge with current settings
    const updatedSettings = this.deepMerge(currentSettings, updates);

    // Update Firestore
    await db.collection(collections.users).doc(userId).update({
      privacySettings: updatedSettings,
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear cache
    await cache.del(`privacy:${userId}`);

    return updatedSettings;
  }

  /**
   * Get API keys for user
   */
  static async getAPIKeys(userId) {
    const snapshot = await db
      .collection('api_keys')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .get();

    const apiKeys = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Don't return the actual key, only metadata
      apiKeys.push({
        id: doc.id,
        name: data.name,
        permissions: data.permissions,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        expiresAt: data.expiresAt,
        status: data.status,
      });
    });

    return apiKeys;
  }

  /**
   * Create new API key
   */
  static async createAPIKey(userId, { name, permissions, expiresAt }) {
    // Generate secure API key
    const keyValue = `gmai_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(keyValue).digest('hex');

    const apiKeyData = {
      userId,
      name,
      keyHash,
      permissions: permissions || ['read'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      expiresAt: expiresAt || null,
      status: 'active',
    };

    const docRef = await db.collection('api_keys').add(apiKeyData);

    return {
      id: docRef.id,
      name,
      key: keyValue, // Only returned once
      permissions,
      createdAt: apiKeyData.createdAt,
      expiresAt,
    };
  }

  /**
   * Delete API key
   */
  static async deleteAPIKey(userId, keyId) {
    const keyDoc = await db.collection('api_keys').doc(keyId).get();
    
    if (!keyDoc.exists || keyDoc.data().userId !== userId) {
      throw createError.notFound('API key');
    }

    await db.collection('api_keys').doc(keyId).update({
      status: 'deleted',
      deletedAt: new Date().toISOString(),
    });
  }

  /**
   * Get integrations
   */
  static async getIntegrations(userId) {
    const snapshot = await db
      .collection('integrations')
      .where('userId', '==', userId)
      .orderBy('connectedAt', 'desc')
      .get();

    const integrations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      integrations.push({
        id: doc.id,
        provider: data.provider,
        connected: data.status === 'connected',
        connectedAt: data.connectedAt,
        permissions: data.permissions,
        status: data.status,
      });
    });

    return integrations;
  }

  /**
   * Connect integration
   */
  static async connectIntegration(userId, provider, { credentials, permissions }) {
    // Encrypt credentials
    const encryptedCredentials = this.encryptCredentials(credentials);

    const integrationData = {
      userId,
      provider,
      credentials: encryptedCredentials,
      permissions: permissions || [],
      connectedAt: new Date().toISOString(),
      status: 'connected',
    };

    const docRef = await db.collection('integrations').add(integrationData);

    return {
      id: docRef.id,
      provider,
      connected: true,
      connectedAt: integrationData.connectedAt,
      permissions,
    };
  }

  /**
   * Disconnect integration
   */
  static async disconnectIntegration(userId, integrationId) {
    const integrationDoc = await db.collection('integrations').doc(integrationId).get();
    
    if (!integrationDoc.exists || integrationDoc.data().userId !== userId) {
      throw createError.notFound('Integration');
    }

    await db.collection('integrations').doc(integrationId).update({
      status: 'disconnected',
      disconnectedAt: new Date().toISOString(),
    });
  }

  /**
   * Get advanced settings
   */
  static async getAdvancedSettings(userId) {
    const cacheKey = `advanced:${userId}`;
    let advanced = await cache.get(cacheKey);

    if (!advanced) {
      const userDoc = await db.collection(collections.users).doc(userId).get();
      
      if (!userDoc.exists) {
        throw createError.notFound('User');
      }

      const userData = userDoc.data();
      advanced = {
        developerMode: false,
        experimentalFeatures: [],
        betaProgram: false,
        dataExport: {
          available: true,
          lastExport: null,
        },
        accountDeletion: {
          scheduled: false,
          scheduledFor: null,
        },
        ...userData.advancedSettings,
      };

      // Cache for 15 minutes
      await cache.set(cacheKey, advanced, 900);
    }

    return advanced;
  }

  /**
   * Update advanced settings
   */
  static async updateAdvancedSettings(userId, updates) {
    const currentSettings = await this.getAdvancedSettings(userId);
    
    // Deep merge with current settings
    const updatedSettings = this.deepMerge(currentSettings, updates);

    // Update Firestore
    await db.collection(collections.users).doc(userId).update({
      advancedSettings: updatedSettings,
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear cache
    await cache.del(`advanced:${userId}`);

    return updatedSettings;
  }

  /**
   * Request data export
   */
  static async requestDataExport(userId) {
    const exportRequest = {
      userId,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      completedAt: null,
      downloadUrl: null,
      expiresAt: null,
    };

    const docRef = await db.collection('data_exports').add(exportRequest);

    // Queue export job (implement with job queue like Bull)
    // await exportQueue.add('export-user-data', { userId, exportId: docRef.id });

    return {
      id: docRef.id,
      status: 'requested',
      requestedAt: exportRequest.requestedAt,
    };
  }

  /**
   * Get data export status
   */
  static async getDataExportStatus(userId) {
    const snapshot = await db
      .collection('data_exports')
      .where('userId', '==', userId)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { available: false };
    }

    const exportDoc = snapshot.docs[0];
    const data = exportDoc.data();

    return {
      available: true,
      id: exportDoc.id,
      status: data.status,
      requestedAt: data.requestedAt,
      completedAt: data.completedAt,
      downloadUrl: data.downloadUrl,
      expiresAt: data.expiresAt,
    };
  }

  /**
   * Schedule account deletion
   */
  static async scheduleAccountDeletion(userId, reason) {
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30); // 30 days grace period

    await db.collection(collections.users).doc(userId).update({
      'advancedSettings.accountDeletion': {
        scheduled: true,
        scheduledFor: scheduledFor.toISOString(),
        reason,
        scheduledAt: new Date().toISOString(),
      },
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear cache
    await cache.del(`advanced:${userId}`);

    // Schedule deletion job
    // await deletionQueue.add('schedule-account-deletion', 
    //   { userId }, 
    //   { delay: 30 * 24 * 60 * 60 * 1000 } // 30 days
    // );
  }

  /**
   * Cancel account deletion
   */
  static async cancelAccountDeletion(userId) {
    await db.collection(collections.users).doc(userId).update({
      'advancedSettings.accountDeletion': {
        scheduled: false,
        scheduledFor: null,
        cancelledAt: new Date().toISOString(),
      },
      'metadata.updatedAt': new Date().toISOString(),
    });

    // Clear cache
    await cache.del(`advanced:${userId}`);
  }

  /**
   * Get all settings (comprehensive)
   */
  static async getAllSettings(userId) {
    const [profile, preferences, notifications, privacy, advanced, apiKeys, integrations] = 
      await Promise.all([
        this.getProfile(userId),
        this.getPreferences(userId),
        this.getNotificationSettings(userId),
        this.getPrivacySettings(userId),
        this.getAdvancedSettings(userId),
        this.getAPIKeys(userId),
        this.getIntegrations(userId),
      ]);

    return {
      profile,
      preferences,
      notifications,
      privacy,
      advanced,
      apiKeys,
      integrations,
    };
  }

  /**
   * Batch update settings
   */
  static async batchUpdateSettings(userId, updates) {
    const results = {};

    // Process each category
    for (const [category, data] of Object.entries(updates)) {
      try {
        switch (category) {
          case 'profile':
            results.profile = await this.updateProfile(userId, data);
            break;
          case 'preferences':
            results.preferences = await this.updatePreferences(userId, data);
            break;
          case 'notifications':
            results.notifications = await this.updateNotificationSettings(userId, data);
            break;
          case 'privacy':
            results.privacy = await this.updatePrivacySettings(userId, data);
            break;
          case 'advanced':
            results.advanced = await this.updateAdvancedSettings(userId, data);
            break;
          default:
            logger.warn(`Unknown settings category: ${category}`);
        }
      } catch (error) {
        logger.error(`Failed to update ${category} settings`, error, { userId });
        throw error;
      }
    }

    return results;
  }

  /**
   * Get sync data for real-time updates
   */
  static async getSyncData(userId, lastSync) {
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);
    
    // Get user document to check last update
    const userDoc = await db.collection(collections.users).doc(userId).get();
    
    if (!userDoc.exists) {
      throw createError.notFound('User');
    }

    const userData = userDoc.data();
    const lastUpdate = new Date(userData.metadata.updatedAt);

    // If no changes since last sync, return empty
    if (lastUpdate <= lastSyncDate) {
      return { hasChanges: false };
    }

    // Return all settings if there are changes
    const allSettings = await this.getAllSettings(userId);
    
    return {
      hasChanges: true,
      lastUpdate: lastUpdate.toISOString(),
      settings: allSettings,
    };
  }

  /**
   * Utility: Deep merge objects
   */
  static deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Validate preferences
   */
  static validatePreferences(preferences) {
    const validThemes = ['light', 'dark', 'auto'];
    const validTimeFormats = ['12h', '24h'];
    
    if (preferences.theme && !validThemes.includes(preferences.theme)) {
      throw createError.validation('Invalid theme');
    }
    
    if (preferences.timeFormat && !validTimeFormats.includes(preferences.timeFormat)) {
      throw createError.validation('Invalid time format');
    }
  }

  /**
   * Encrypt credentials (placeholder implementation)
   */
  static encryptCredentials(credentials) {
    // Implement proper encryption here
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
  }

  /**
   * Decrypt credentials (placeholder implementation)
   */
  static decryptCredentials(encryptedCredentials) {
    // Implement proper decryption here
    return JSON.parse(Buffer.from(encryptedCredentials, 'base64').toString());
  }
}