/**
 * Unit tests for userSettingsService
 * Tests all API calls and service methods with various scenarios
 */

import { userSettingsService, getUserSettingsWithRetry, applyTheme, getDefaultSettings, mergeWithDefaults } from '@/services/userSettingsService';
import { createMockUserSettings, createMockApiResponse, createMockError, mockFetch } from '../../utils/test-helpers';
import { UserSettings } from '@/types';

// Mock the API module
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
  },
  withRetry: jest.fn(),
}));

describe('userSettingsService', () => {
  const mockApi = require('@/services/api').api;
  const mockWithRetry = require('@/services/api').withRetry;
  const mockSettings = createMockUserSettings();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should fetch current user settings successfully', async () => {
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userSettingsService.get();

      expect(mockApi.get).toHaveBeenCalledWith('/user-settings/me');
      expect(result).toEqual(mockSettings);
    });

    it('should fetch specific user settings successfully', async () => {
      const userId = 'user-456';
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userSettingsService.get(userId);

      expect(mockApi.get).toHaveBeenCalledWith(`/user-settings/${userId}`);
      expect(result).toEqual(mockSettings);
    });

    it('should handle API failure', async () => {
      const mockResponse = createMockApiResponse(null, false);
      mockApi.get.mockResolvedValue(mockResponse);

      await expect(userSettingsService.get()).rejects.toThrow('Failed to fetch user settings');
    });

    it('should handle network errors', async () => {
      mockApi.get.mockRejectedValue(createMockError('Network error'));

      await expect(userSettingsService.get()).rejects.toThrow('Network error');
    });
  });

  describe('save', () => {
    it('should save user settings successfully', async () => {
      const updateData = { preferences: { language: 'es' } };
      const updatedSettings = { ...mockSettings, ...updateData };
      const mockResponse = createMockApiResponse(updatedSettings);
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await userSettingsService.save(updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/user-settings/me', updateData);
      expect(result).toEqual(updatedSettings);
    });

    it('should handle save failure', async () => {
      const updateData = { preferences: { language: 'es' } };
      const mockResponse = createMockApiResponse(null, false);
      mockApi.put.mockResolvedValue(mockResponse);

      await expect(userSettingsService.save(updateData)).rejects.toThrow('Failed to save user settings');
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const preferences = { language: 'fr', timezone: 'Europe/Paris' };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updatePreferences(preferences);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/preferences', preferences);
      expect(result).toEqual(mockSettings);
    });

    it('should handle empty preferences', async () => {
      const preferences = {};
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updatePreferences(preferences);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/preferences', preferences);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateNotifications', () => {
    it('should update notification settings successfully', async () => {
      const notifications = {
        email: { enabled: false, frequency: 'weekly' as const },
      };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updateNotifications(notifications);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/notifications', notifications);
      expect(result).toEqual(mockSettings);
    });

    it('should handle complex notification updates', async () => {
      const notifications = {
        email: {
          enabled: true,
          frequency: 'instant' as const,
          types: {
            messages: false,
            projectUpdates: true,
            marketing: false,
          },
        },
        push: { enabled: false },
      };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updateNotifications(notifications);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/notifications', notifications);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updatePrivacy', () => {
    it('should update privacy settings successfully', async () => {
      const privacy = {
        profileVisibility: 'private' as const,
        showEmail: false,
        showPhone: false,
      };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updatePrivacy(privacy);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/privacy', privacy);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateSecurity', () => {
    it('should update security settings successfully', async () => {
      const security = {
        twoFactorEnabled: true,
        sessionTimeout: 1800,
      };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updateSecurity(security);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/security', security);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateDisplay', () => {
    it('should update display settings successfully', async () => {
      const display = {
        density: 'compact' as const,
        fontSize: 'large' as const,
        highContrast: true,
      };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updateDisplay(display);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/display', display);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateIntegrations', () => {
    it('should update integration settings successfully', async () => {
      const integrations = {
        google: {
          connected: true,
          calendarSync: true,
          driveSync: false,
        },
      };
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await userSettingsService.updateIntegrations(integrations);

      expect(mockApi.patch).toHaveBeenCalledWith('/user-settings/me/integrations', integrations);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('connectIntegration', () => {
    it('should connect Google integration successfully', async () => {
      const authCode = 'auth-code-123';
      const mockResponse = createMockApiResponse({
        success: true,
        integration: { provider: 'google', connected: true },
      });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.connectIntegration('google', authCode);

      expect(mockApi.post).toHaveBeenCalledWith('/user-settings/me/integrations/google/connect', { authCode });
      expect(result).toEqual({ success: true, integration: { provider: 'google', connected: true } });
    });

    it('should connect Slack integration successfully', async () => {
      const authCode = 'slack-auth-456';
      const mockResponse = createMockApiResponse({
        success: true,
        integration: { provider: 'slack', workspaceId: 'T123456' },
      });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.connectIntegration('slack', authCode);

      expect(mockApi.post).toHaveBeenCalledWith('/user-settings/me/integrations/slack/connect', { authCode });
      expect(result.success).toBe(true);
    });

    it('should handle connection failure', async () => {
      const authCode = 'invalid-code';
      const mockResponse = createMockApiResponse(null, false);
      mockApi.post.mockResolvedValue(mockResponse);

      await expect(userSettingsService.connectIntegration('github', authCode))
        .rejects.toThrow('Failed to connect github integration');
    });
  });

  describe('disconnectIntegration', () => {
    it('should disconnect integration successfully', async () => {
      const mockResponse = createMockApiResponse({});
      mockApi.delete.mockResolvedValue(mockResponse);

      await userSettingsService.disconnectIntegration('google');

      expect(mockApi.delete).toHaveBeenCalledWith('/user-settings/me/integrations/google');
    });

    it('should handle disconnection failure', async () => {
      const mockResponse = createMockApiResponse(null, false);
      mockApi.delete.mockResolvedValue(mockResponse);

      await expect(userSettingsService.disconnectIntegration('slack'))
        .rejects.toThrow('Failed to disconnect slack integration');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', async () => {
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.resetToDefaults();

      expect(mockApi.post).toHaveBeenCalledWith('/user-settings/me/reset');
      expect(result).toEqual(mockSettings);
    });

    it('should reset specific category to defaults', async () => {
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.resetToDefaults('notifications');

      expect(mockApi.post).toHaveBeenCalledWith('/user-settings/me/reset/notifications');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('export', () => {
    it('should export settings successfully', async () => {
      const mockBlob = new Blob(['settings data'], { type: 'application/json' });
      const mockResponse = createMockApiResponse(mockBlob);
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userSettingsService.export();

      expect(mockApi.get).toHaveBeenCalledWith('/user-settings/me/export');
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('import', () => {
    it('should import settings successfully', async () => {
      const file = new File(['settings'], 'settings.json', { type: 'application/json' });
      const mockResponse = createMockApiResponse(mockSettings);
      mockApi.upload.mockResolvedValue(mockResponse);

      const result = await userSettingsService.import(file);

      expect(mockApi.upload).toHaveBeenCalledWith('/user-settings/me/import', file);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('testNotification', () => {
    it('should test email notification successfully', async () => {
      const mockResponse = createMockApiResponse({
        success: true,
        message: 'Email notification sent successfully',
      });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.testNotification('email');

      expect(mockApi.post).toHaveBeenCalledWith('/user-settings/me/test-notification/email');
      expect(result).toEqual({ success: true, message: 'Email notification sent successfully' });
    });

    it('should test push notification successfully', async () => {
      const mockResponse = createMockApiResponse({
        success: true,
        message: 'Push notification sent successfully',
      });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.testNotification('push');

      expect(result.success).toBe(true);
    });

    it('should handle notification test failure', async () => {
      const mockResponse = createMockApiResponse(null, false);
      mockApi.post.mockResolvedValue(mockResponse);

      await expect(userSettingsService.testNotification('sms'))
        .rejects.toThrow('Failed to test notification');
    });
  });

  describe('getThemePreview', () => {
    it('should get theme preview successfully', async () => {
      const theme = 'dark';
      const mockResponse = createMockApiResponse({
        preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      });
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userSettingsService.getThemePreview(theme);

      expect(mockApi.get).toHaveBeenCalledWith('/user-settings/themes/dark/preview');
      expect(result.preview).toBeDefined();
    });
  });

  describe('validateCustomTheme', () => {
    it('should validate custom theme successfully', async () => {
      const theme = {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
      };
      const mockResponse = createMockApiResponse({
        valid: true,
        errors: [],
      });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.validateCustomTheme(theme);

      expect(mockApi.post).toHaveBeenCalledWith('/user-settings/themes/validate', theme);
      expect(result.valid).toBe(true);
    });

    it('should return validation errors for invalid theme', async () => {
      const theme = {
        primaryColor: 'invalid-color',
        backgroundColor: '#gggggg',
      };
      const mockResponse = createMockApiResponse({
        valid: false,
        errors: ['Invalid primary color format', 'Invalid background color format'],
      });
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userSettingsService.validateCustomTheme(theme);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});

describe('getUserSettingsWithRetry', () => {
  const mockWithRetry = require('@/services/api').withRetry;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use retry mechanism', async () => {
    const mockSettings = createMockUserSettings();
    mockWithRetry.mockResolvedValue(mockSettings);

    const result = await getUserSettingsWithRetry();

    expect(mockWithRetry).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        maxAttempts: 3,
        delay: 1000,
        shouldRetry: expect.any(Function),
      })
    );
    expect(result).toEqual(mockSettings);
  });

  it('should retry on 5xx errors', async () => {
    const mockSettings = createMockUserSettings();
    mockWithRetry.mockResolvedValue(mockSettings);

    await getUserSettingsWithRetry();

    const retryConfig = mockWithRetry.mock.calls[0][1];
    const shouldRetry = retryConfig.shouldRetry;

    // Should retry on 500 error
    expect(shouldRetry({ status: 500 }, 1)).toBe(true);
    // Should retry on network error
    expect(shouldRetry({ code: 'NETWORK_ERROR' }, 1)).toBe(true);
    // Should not retry on 400 error
    expect(shouldRetry({ status: 400 }, 1)).toBe(false);
  });
});

describe('applyTheme', () => {
  let mockRoot: HTMLElement;

  beforeEach(() => {
    mockRoot = {
      setAttribute: jest.fn(),
      style: {
        setProperty: jest.fn(),
      },
    } as any;
    
    Object.defineProperty(document, 'documentElement', {
      value: mockRoot,
      writable: true,
    });
  });

  it('should apply predefined theme', () => {
    applyTheme('dark');

    expect(mockRoot.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should apply custom theme', () => {
    const customTheme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    };

    applyTheme(customTheme);

    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--primary-color', '#3b82f6');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--secondary-color', '#64748b');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--background-color', '#ffffff');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--text-color', '#1f2937');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--border-color', '#e5e7eb');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--success-color', '#10b981');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--warning-color', '#f59e0b');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--error-color', '#ef4444');
  });

  it('should handle null theme', () => {
    applyTheme(null as any);

    expect(mockRoot.setAttribute).not.toHaveBeenCalled();
    expect(mockRoot.style.setProperty).not.toHaveBeenCalled();
  });
});

describe('getDefaultSettings', () => {
  it('should return default settings with correct structure', () => {
    const defaults = getDefaultSettings();

    expect(defaults).toHaveProperty('preferences');
    expect(defaults).toHaveProperty('notifications');
    expect(defaults).toHaveProperty('privacy');
    expect(defaults).toHaveProperty('display');
    expect(defaults).toHaveProperty('shortcuts');

    // Check default values
    expect(defaults.preferences?.language).toBe('en');
    expect(defaults.preferences?.theme).toBe('system');
    expect(defaults.preferences?.startOfWeek).toBe('sunday');
    expect(defaults.notifications?.email?.enabled).toBe(true);
    expect(defaults.privacy?.profileVisibility).toBe('team');
    expect(defaults.display?.density).toBe('comfortable');
    expect(defaults.shortcuts?.enabled).toBe(true);
  });

  it('should use system timezone by default', () => {
    const defaults = getDefaultSettings();
    
    expect(defaults.preferences?.timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});

describe('mergeWithDefaults', () => {
  it('should merge partial settings with defaults', () => {
    const partialSettings = {
      preferences: {
        language: 'fr',
        theme: 'dark' as const,
      },
      privacy: {
        profileVisibility: 'private' as const,
      },
    };

    const merged = mergeWithDefaults(partialSettings);

    // Should keep custom values
    expect(merged.preferences.language).toBe('fr');
    expect(merged.preferences.theme).toBe('dark');
    expect(merged.privacy.profileVisibility).toBe('private');

    // Should use defaults for missing values
    expect(merged.preferences.currency).toBe('USD');
    expect(merged.notifications.email.enabled).toBe(true);
    expect(merged.display.density).toBe('comfortable');
  });

  it('should handle deep partial objects', () => {
    const partialSettings = {
      notifications: {
        email: {
          enabled: false,
        },
      },
    };

    const merged = mergeWithDefaults(partialSettings);

    // Should merge nested objects correctly
    expect(merged.notifications.email.enabled).toBe(false);
    expect(merged.notifications.email.frequency).toBe('instant'); // default
    expect(merged.notifications.push.enabled).toBe(true); // default
  });

  it('should handle empty settings object', () => {
    const merged = mergeWithDefaults({});

    // Should return all defaults
    const defaults = getDefaultSettings();
    expect(merged.preferences?.language).toBe(defaults.preferences?.language);
    expect(merged.notifications?.email?.enabled).toBe(defaults.notifications?.email?.enabled);
  });
});