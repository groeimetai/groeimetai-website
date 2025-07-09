import { api, withRetry } from './api';
import { UserSettings, ApiResponse } from '@/types';

// UserSettings service for handling all user settings-related API calls
export const userSettingsService = {
  // Get user settings
  async get(userId?: string): Promise<UserSettings> {
    const endpoint = userId ? `/user-settings/${userId}` : '/user-settings/me';
    const response = await api.get<UserSettings>(endpoint);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch user settings');
    }
    return response.data;
  },

  // Create or update user settings
  async save(data: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/user-settings/me', data);
    if (!response.success || !response.data) {
      throw new Error('Failed to save user settings');
    }
    return response.data;
  },

  // Update specific preference
  async updatePreferences(
    preferences: Partial<UserSettings['preferences']>
  ): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/preferences', preferences);
    if (!response.success || !response.data) {
      throw new Error('Failed to update preferences');
    }
    return response.data;
  },

  // Update notification settings
  async updateNotifications(
    notifications: Partial<UserSettings['notifications']>
  ): Promise<UserSettings> {
    const response = await api.patch<UserSettings>(
      '/user-settings/me/notifications',
      notifications
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update notification settings');
    }
    return response.data;
  },

  // Update privacy settings
  async updatePrivacy(privacy: Partial<UserSettings['privacy']>): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/privacy', privacy);
    if (!response.success || !response.data) {
      throw new Error('Failed to update privacy settings');
    }
    return response.data;
  },

  // Update security settings
  async updateSecurity(security: Partial<UserSettings['security']>): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/security', security);
    if (!response.success || !response.data) {
      throw new Error('Failed to update security settings');
    }
    return response.data;
  },

  // Update display settings
  async updateDisplay(display: Partial<UserSettings['display']>): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/display', display);
    if (!response.success || !response.data) {
      throw new Error('Failed to update display settings');
    }
    return response.data;
  },

  // Update integration settings
  async updateIntegrations(
    integrations: Partial<UserSettings['integrations']>
  ): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/integrations', integrations);
    if (!response.success || !response.data) {
      throw new Error('Failed to update integration settings');
    }
    return response.data;
  },

  // Connect integration
  async connectIntegration(
    provider: 'google' | 'slack' | 'github',
    authCode: string
  ): Promise<{ success: boolean; integration: any }> {
    const response = await api.post<{ success: boolean; integration: any }>(
      `/user-settings/me/integrations/${provider}/connect`,
      { authCode }
    );
    if (!response.success || !response.data) {
      throw new Error(`Failed to connect ${provider} integration`);
    }
    return response.data;
  },

  // Disconnect integration
  async disconnectIntegration(provider: 'google' | 'slack' | 'github'): Promise<void> {
    const response = await api.delete(`/user-settings/me/integrations/${provider}`);
    if (!response.success) {
      throw new Error(`Failed to disconnect ${provider} integration`);
    }
  },

  // Update keyboard shortcuts
  async updateShortcuts(shortcuts: Partial<UserSettings['shortcuts']>): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/shortcuts', shortcuts);
    if (!response.success || !response.data) {
      throw new Error('Failed to update keyboard shortcuts');
    }
    return response.data;
  },

  // Update dashboard layout
  async updateDashboardLayout(layout: UserSettings['dashboardLayout']): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/user-settings/me/dashboard-layout', layout);
    if (!response.success || !response.data) {
      throw new Error('Failed to update dashboard layout');
    }
    return response.data;
  },

  // Update email signature
  async updateEmailSignature(signature: string): Promise<UserSettings> {
    const response = await api.patch<UserSettings>('/user-settings/me/email-signature', {
      emailSignature: signature,
    });
    if (!response.success || !response.data) {
      throw new Error('Failed to update email signature');
    }
    return response.data;
  },

  // Update auto-reply settings
  async updateAutoReply(autoReply: UserSettings['autoReply']): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/user-settings/me/auto-reply', autoReply);
    if (!response.success || !response.data) {
      throw new Error('Failed to update auto-reply settings');
    }
    return response.data;
  },

  // Update working hours
  async updateWorkingHours(workingHours: UserSettings['workingHours']): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/user-settings/me/working-hours', workingHours);
    if (!response.success || !response.data) {
      throw new Error('Failed to update working hours');
    }
    return response.data;
  },

  // Reset settings to defaults
  async resetToDefaults(
    category?: 'preferences' | 'notifications' | 'privacy' | 'display' | 'all'
  ): Promise<UserSettings> {
    const endpoint = category ? `/user-settings/me/reset/${category}` : '/user-settings/me/reset';
    const response = await api.post<UserSettings>(endpoint);
    if (!response.success || !response.data) {
      throw new Error('Failed to reset settings');
    }
    return response.data;
  },

  // Export settings
  async export(): Promise<Blob> {
    const response = await api.get<Blob>('/user-settings/me/export');
    if (!response.success) {
      throw new Error('Failed to export settings');
    }
    return response.data as Blob;
  },

  // Import settings
  async import(file: File): Promise<UserSettings> {
    const response = await api.upload<UserSettings>('/user-settings/me/import', file);
    if (!response.success || !response.data) {
      throw new Error('Failed to import settings');
    }
    return response.data;
  },

  // Test notification settings
  async testNotification(
    type: 'email' | 'push' | 'sms'
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `/user-settings/me/test-notification/${type}`
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to test notification');
    }
    return response.data;
  },

  // Get theme preview
  async getThemePreview(theme: string): Promise<{ preview: string }> {
    const response = await api.get<{ preview: string }>(`/user-settings/themes/${theme}/preview`);
    if (!response.success || !response.data) {
      throw new Error('Failed to get theme preview');
    }
    return response.data;
  },

  // Validate custom theme
  async validateCustomTheme(theme: any): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await api.post<{ valid: boolean; errors?: string[] }>(
      '/user-settings/themes/validate',
      theme
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to validate theme');
    }
    return response.data;
  },
};

// Helper function to get user settings with retry
export async function getUserSettingsWithRetry(userId?: string): Promise<UserSettings> {
  return withRetry(() => userSettingsService.get(userId), {
    maxAttempts: 3,
    delay: 1000,
    shouldRetry: (error, attempt) => {
      // Retry on network errors or 5xx status codes
      return error.status >= 500 || error.code === 'NETWORK_ERROR';
    },
  });
}

// Helper function to apply theme
export function applyTheme(theme: string | UserSettings['preferences']['customTheme']): void {
  const root = document.documentElement;

  if (typeof theme === 'string') {
    // Apply predefined theme
    root.setAttribute('data-theme', theme);
  } else if (theme) {
    // Apply custom theme
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--success-color', theme.successColor);
    root.style.setProperty('--warning-color', theme.warningColor);
    root.style.setProperty('--error-color', theme.errorColor);
  }
}

// Helper function to get default settings
export function getDefaultSettings(): Partial<UserSettings> {
  return {
    preferences: {
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      startOfWeek: 'sunday',
      defaultView: 'dashboard',
      theme: 'system',
    },
    notifications: {
      email: {
        enabled: true,
        frequency: 'instant',
        types: {
          messages: true,
          projectUpdates: true,
          taskAssignments: true,
          mentions: true,
          deadlines: true,
          systemAlerts: true,
          marketing: false,
        },
      },
      push: {
        enabled: true,
        types: {
          messages: true,
          projectUpdates: true,
          taskAssignments: true,
          mentions: true,
          deadlines: true,
          systemAlerts: true,
          marketing: false,
        },
      },
      sms: {
        enabled: false,
        types: {
          messages: false,
          projectUpdates: false,
          taskAssignments: false,
          mentions: false,
          deadlines: true,
          systemAlerts: true,
          marketing: false,
        },
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true,
        types: {
          messages: true,
          projectUpdates: true,
          taskAssignments: true,
          mentions: true,
          deadlines: true,
          systemAlerts: true,
          marketing: true,
        },
      },
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: true,
      showPhone: false,
      showLocation: false,
      activityStatus: true,
      readReceipts: true,
      typingIndicators: true,
    },
    display: {
      density: 'comfortable',
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false,
      sidebarCollapsed: false,
      showAvatars: true,
    },
    shortcuts: {
      enabled: true,
    },
  };
}

// Helper function to merge settings with defaults
export function mergeWithDefaults(settings: Partial<UserSettings>): UserSettings {
  const defaults = getDefaultSettings();
  return {
    ...defaults,
    ...settings,
    preferences: { ...defaults.preferences, ...settings.preferences },
    notifications: {
      email: { ...defaults.notifications?.email, ...settings.notifications?.email },
      push: { ...defaults.notifications?.push, ...settings.notifications?.push },
      sms: { ...defaults.notifications?.sms, ...settings.notifications?.sms },
      inApp: { ...defaults.notifications?.inApp, ...settings.notifications?.inApp },
    },
    privacy: { ...defaults.privacy, ...settings.privacy },
    display: { ...defaults.display, ...settings.display },
    shortcuts: { ...defaults.shortcuts, ...settings.shortcuts },
  } as UserSettings;
}
