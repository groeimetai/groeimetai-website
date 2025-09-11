import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { authenticateUser, requireRole, apiRateLimiter } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { settingsValidation } from '../validations/settings.validation.js';

const router = Router();

/**
 * User Settings Routes
 * All routes require authentication
 */

// Get user profile data
router.get(
  '/profile',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getProfile
);

// Update user profile
router.put(
  '/profile',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.updateProfile),
  SettingsController.updateProfile
);

// Get user preferences
router.get(
  '/preferences',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getPreferences
);

// Update user preferences
router.put(
  '/preferences',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.updatePreferences),
  SettingsController.updatePreferences
);

// Get notification settings
router.get(
  '/notifications',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getNotificationSettings
);

// Update notification settings
router.put(
  '/notifications',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.updateNotifications),
  SettingsController.updateNotificationSettings
);

// Get security settings
router.get(
  '/security',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getSecuritySettings
);

// Update security settings
router.put(
  '/security',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.updateSecurity),
  SettingsController.updateSecuritySettings
);

// Get active sessions
router.get(
  '/security/sessions',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getActiveSessions
);

// Revoke session
router.delete(
  '/security/sessions/:sessionId',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.revokeSession),
  SettingsController.revokeSession
);

// Get login history
router.get(
  '/security/login-history',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getLoginHistory
);

// Enable/Disable 2FA
router.post(
  '/security/2fa/enable',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.enable2FA),
  SettingsController.enable2FA
);

router.post(
  '/security/2fa/disable',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.disable2FA),
  SettingsController.disable2FA
);

// Generate backup codes
router.post(
  '/security/2fa/backup-codes',
  authenticateUser,
  apiRateLimiter,
  SettingsController.generateBackupCodes
);

// Privacy settings
router.get(
  '/privacy',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getPrivacySettings
);

router.put(
  '/privacy',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.updatePrivacy),
  SettingsController.updatePrivacySettings
);

// API Keys management
router.get(
  '/api-keys',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getAPIKeys
);

router.post(
  '/api-keys',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.createAPIKey),
  SettingsController.createAPIKey
);

router.delete(
  '/api-keys/:keyId',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.deleteAPIKey),
  SettingsController.deleteAPIKey
);

// Integrations
router.get(
  '/integrations',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getIntegrations
);

router.post(
  '/integrations/:provider/connect',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.connectIntegration),
  SettingsController.connectIntegration
);

router.delete(
  '/integrations/:integrationId/disconnect',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.disconnectIntegration),
  SettingsController.disconnectIntegration
);

// Advanced settings
router.get(
  '/advanced',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getAdvancedSettings
);

router.put(
  '/advanced',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.updateAdvanced),
  SettingsController.updateAdvancedSettings
);

// Data export
router.post(
  '/data-export',
  authenticateUser,
  apiRateLimiter,
  SettingsController.requestDataExport
);

router.get(
  '/data-export/status',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getDataExportStatus
);

// Account deletion
router.post(
  '/account/delete',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.scheduleAccountDeletion),
  SettingsController.scheduleAccountDeletion
);

router.delete(
  '/account/delete',
  authenticateUser,
  apiRateLimiter,
  SettingsController.cancelAccountDeletion
);

// Get all settings (comprehensive)
router.get(
  '/all',
  authenticateUser,
  apiRateLimiter,
  SettingsController.getAllSettings
);

// Batch update settings
router.put(
  '/batch',
  authenticateUser,
  apiRateLimiter,
  validateRequest(settingsValidation.batchUpdate),
  SettingsController.batchUpdateSettings
);

// Real-time settings sync
router.get(
  '/sync',
  authenticateUser,
  apiRateLimiter,
  SettingsController.syncSettings
);

export default router;