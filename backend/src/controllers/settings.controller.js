import { auth, db, collections } from '../config/firebase.config.js';
import { AppError, createError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { SettingsService } from '../services/settings.service.js';
import { SecurityService } from '../services/security.service.js';
import { NotificationService } from '../services/notification.service.js';
import crypto from 'crypto';
import speakeasy from 'speakeasy';

/**
 * Settings Controller - handles all user settings operations
 */
export const SettingsController = {
  /**
   * Get user profile data
   */
  getProfile: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/profile', userId);

    const profile = await SettingsService.getProfile(userId);
    
    res.json({
      success: true,
      data: profile,
    });
  }),

  /**
   * Update user profile
   */
  updateProfile: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;
    
    logger.api('PUT', '/settings/profile', userId, { updates });

    const updatedProfile = await SettingsService.updateProfile(userId, updates);
    
    // Emit real-time update
    await NotificationService.emitSettingsUpdate(userId, 'profile', updatedProfile);

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  }),

  /**
   * Get user preferences
   */
  getPreferences: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/preferences', userId);

    const preferences = await SettingsService.getPreferences(userId);
    
    res.json({
      success: true,
      data: preferences,
    });
  }),

  /**
   * Update user preferences
   */
  updatePreferences: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;
    
    logger.api('PUT', '/settings/preferences', userId, { updates });

    const updatedPreferences = await SettingsService.updatePreferences(userId, updates);
    
    // Emit real-time update
    await NotificationService.emitSettingsUpdate(userId, 'preferences', updatedPreferences);

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences updated successfully',
    });
  }),

  /**
   * Get notification settings
   */
  getNotificationSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/notifications', userId);

    const notifications = await SettingsService.getNotificationSettings(userId);
    
    res.json({
      success: true,
      data: notifications,
    });
  }),

  /**
   * Update notification settings
   */
  updateNotificationSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;
    
    logger.api('PUT', '/settings/notifications', userId, { updates });

    const updatedNotifications = await SettingsService.updateNotificationSettings(userId, updates);
    
    // Update notification subscriptions
    await NotificationService.updateSubscriptions(userId, updatedNotifications);
    
    // Emit real-time update
    await NotificationService.emitSettingsUpdate(userId, 'notifications', updatedNotifications);

    res.json({
      success: true,
      data: updatedNotifications,
      message: 'Notification settings updated successfully',
    });
  }),

  /**
   * Get security settings
   */
  getSecuritySettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/security', userId);

    const securitySettings = await SecurityService.getSecuritySettings(userId);
    
    res.json({
      success: true,
      data: securitySettings,
    });
  }),

  /**
   * Update security settings
   */
  updateSecuritySettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;
    
    logger.api('PUT', '/settings/security', userId, { updates });

    const updatedSettings = await SecurityService.updateSecuritySettings(userId, updates);
    
    // Log security changes
    await SecurityService.logSecurityEvent(userId, 'settings_update', {
      changes: Object.keys(updates),
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Security settings updated successfully',
    });
  }),

  /**
   * Get active sessions
   */
  getActiveSessions: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/security/sessions', userId);

    const sessions = await SecurityService.getActiveSessions(userId);
    
    res.json({
      success: true,
      data: sessions,
    });
  }),

  /**
   * Revoke session
   */
  revokeSession: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { sessionId } = req.params;
    
    logger.api('DELETE', `/settings/security/sessions/${sessionId}`, userId);

    await SecurityService.revokeSession(userId, sessionId);
    
    // Log security event
    await SecurityService.logSecurityEvent(userId, 'session_revoked', {
      sessionId,
    });

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  }),

  /**
   * Get login history
   */
  getLoginHistory: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { limit = 50, offset = 0 } = req.query;
    
    logger.api('GET', '/settings/security/login-history', userId, { limit, offset });

    const history = await SecurityService.getLoginHistory(userId, { limit, offset });
    
    res.json({
      success: true,
      data: history,
    });
  }),

  /**
   * Enable 2FA
   */
  enable2FA: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { code } = req.body;
    
    logger.api('POST', '/settings/security/2fa/enable', userId);

    // Generate secret if not exists
    let secret = await SecurityService.get2FASecret(userId);
    if (!secret) {
      secret = speakeasy.generateSecret({
        name: `GroeiMetAI (${req.user.email})`,
        issuer: 'GroeiMetAI',
      });
      await SecurityService.store2FASecret(userId, secret.base32);
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      throw createError.validation('Invalid verification code');
    }

    // Enable 2FA
    await SecurityService.enable2FA(userId);
    
    // Generate backup codes
    const backupCodes = await SecurityService.generateBackupCodes(userId);

    // Log security event
    await SecurityService.logSecurityEvent(userId, '2fa_enabled');

    res.json({
      success: true,
      data: {
        backupCodes,
      },
      message: '2FA enabled successfully. Save your backup codes safely!',
    });
  }),

  /**
   * Disable 2FA
   */
  disable2FA: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { code } = req.body;
    
    logger.api('POST', '/settings/security/2fa/disable', userId);

    // Verify current 2FA code or backup code
    const verified = await SecurityService.verify2FACode(userId, code);
    
    if (!verified) {
      throw createError.validation('Invalid verification code');
    }

    await SecurityService.disable2FA(userId);
    
    // Log security event
    await SecurityService.logSecurityEvent(userId, '2fa_disabled');

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  }),

  /**
   * Generate backup codes
   */
  generateBackupCodes: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('POST', '/settings/security/2fa/backup-codes', userId);

    const backupCodes = await SecurityService.generateBackupCodes(userId);
    
    // Log security event
    await SecurityService.logSecurityEvent(userId, 'backup_codes_generated');

    res.json({
      success: true,
      data: {
        backupCodes,
      },
      message: 'New backup codes generated. Previous codes are now invalid.',
    });
  }),

  /**
   * Get privacy settings
   */
  getPrivacySettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/privacy', userId);

    const privacySettings = await SettingsService.getPrivacySettings(userId);
    
    res.json({
      success: true,
      data: privacySettings,
    });
  }),

  /**
   * Update privacy settings
   */
  updatePrivacySettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;
    
    logger.api('PUT', '/settings/privacy', userId, { updates });

    const updatedSettings = await SettingsService.updatePrivacySettings(userId, updates);
    
    // Emit real-time update
    await NotificationService.emitSettingsUpdate(userId, 'privacy', updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Privacy settings updated successfully',
    });
  }),

  /**
   * Get API keys
   */
  getAPIKeys: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/api-keys', userId);

    const apiKeys = await SettingsService.getAPIKeys(userId);
    
    res.json({
      success: true,
      data: apiKeys,
    });
  }),

  /**
   * Create API key
   */
  createAPIKey: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { name, permissions, expiresAt } = req.body;
    
    logger.api('POST', '/settings/api-keys', userId, { name, permissions });

    const apiKey = await SettingsService.createAPIKey(userId, {
      name,
      permissions,
      expiresAt,
    });

    // Log security event
    await SecurityService.logSecurityEvent(userId, 'api_key_created', {
      keyId: apiKey.id,
      permissions,
    });

    res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created successfully. Save the key safely - it cannot be retrieved again.',
    });
  }),

  /**
   * Delete API key
   */
  deleteAPIKey: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { keyId } = req.params;
    
    logger.api('DELETE', `/settings/api-keys/${keyId}`, userId);

    await SettingsService.deleteAPIKey(userId, keyId);
    
    // Log security event
    await SecurityService.logSecurityEvent(userId, 'api_key_deleted', {
      keyId,
    });

    res.json({
      success: true,
      message: 'API key deleted successfully',
    });
  }),

  /**
   * Get integrations
   */
  getIntegrations: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/integrations', userId);

    const integrations = await SettingsService.getIntegrations(userId);
    
    res.json({
      success: true,
      data: integrations,
    });
  }),

  /**
   * Connect integration
   */
  connectIntegration: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { provider } = req.params;
    const { credentials, permissions } = req.body;
    
    logger.api('POST', `/settings/integrations/${provider}/connect`, userId);

    const integration = await SettingsService.connectIntegration(userId, provider, {
      credentials,
      permissions,
    });

    res.json({
      success: true,
      data: integration,
      message: `${provider} integration connected successfully`,
    });
  }),

  /**
   * Disconnect integration
   */
  disconnectIntegration: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { integrationId } = req.params;
    
    logger.api('DELETE', `/settings/integrations/${integrationId}/disconnect`, userId);

    await SettingsService.disconnectIntegration(userId, integrationId);

    res.json({
      success: true,
      message: 'Integration disconnected successfully',
    });
  }),

  /**
   * Get advanced settings
   */
  getAdvancedSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/advanced', userId);

    const advancedSettings = await SettingsService.getAdvancedSettings(userId);
    
    res.json({
      success: true,
      data: advancedSettings,
    });
  }),

  /**
   * Update advanced settings
   */
  updateAdvancedSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;
    
    logger.api('PUT', '/settings/advanced', userId, { updates });

    const updatedSettings = await SettingsService.updateAdvancedSettings(userId, updates);
    
    // Emit real-time update
    await NotificationService.emitSettingsUpdate(userId, 'advanced', updatedSettings);

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Advanced settings updated successfully',
    });
  }),

  /**
   * Request data export
   */
  requestDataExport: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('POST', '/settings/data-export', userId);

    const exportRequest = await SettingsService.requestDataExport(userId);

    res.json({
      success: true,
      data: exportRequest,
      message: 'Data export requested. You will be notified when it is ready.',
    });
  }),

  /**
   * Get data export status
   */
  getDataExportStatus: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/data-export/status', userId);

    const status = await SettingsService.getDataExportStatus(userId);
    
    res.json({
      success: true,
      data: status,
    });
  }),

  /**
   * Schedule account deletion
   */
  scheduleAccountDeletion: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { password, reason } = req.body;
    
    logger.api('POST', '/settings/account/delete', userId, { reason });

    // Verify password
    const isValidPassword = await SecurityService.verifyPassword(userId, password);
    if (!isValidPassword) {
      throw createError.validation('Invalid password');
    }

    await SettingsService.scheduleAccountDeletion(userId, reason);
    
    // Log security event
    await SecurityService.logSecurityEvent(userId, 'account_deletion_scheduled', {
      reason,
    });

    res.json({
      success: true,
      message: 'Account deletion scheduled. You have 30 days to cancel this request.',
    });
  }),

  /**
   * Cancel account deletion
   */
  cancelAccountDeletion: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('DELETE', '/settings/account/delete', userId);

    await SettingsService.cancelAccountDeletion(userId);
    
    // Log security event
    await SecurityService.logSecurityEvent(userId, 'account_deletion_cancelled');

    res.json({
      success: true,
      message: 'Account deletion cancelled successfully',
    });
  }),

  /**
   * Get all settings (comprehensive)
   */
  getAllSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    logger.api('GET', '/settings/all', userId);

    const allSettings = await SettingsService.getAllSettings(userId);
    
    res.json({
      success: true,
      data: allSettings,
    });
  }),

  /**
   * Batch update settings
   */
  batchUpdateSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { updates } = req.body;
    
    logger.api('PUT', '/settings/batch', userId, { updates });

    const result = await SettingsService.batchUpdateSettings(userId, updates);
    
    // Emit real-time updates for each category
    for (const [category, data] of Object.entries(result)) {
      await NotificationService.emitSettingsUpdate(userId, category, data);
    }

    res.json({
      success: true,
      data: result,
      message: 'Settings updated successfully',
    });
  }),

  /**
   * Sync settings (real-time)
   */
  syncSettings: asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { lastSync } = req.query;
    
    logger.api('GET', '/settings/sync', userId, { lastSync });

    const syncData = await SettingsService.getSyncData(userId, lastSync);
    
    res.json({
      success: true,
      data: syncData,
      timestamp: new Date().toISOString(),
    });
  }),
};