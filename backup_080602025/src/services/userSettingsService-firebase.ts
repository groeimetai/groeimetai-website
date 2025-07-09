import { db, auth } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserSettings } from '@/types';

// Default settings (without userId and timestamps, which are added dynamically)
const defaultSettings: Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  preferences: {
    language: 'en',
    timezone: 'Europe/Amsterdam',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'EUR',
    startOfWeek: 'monday',
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
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 60,
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
    customShortcuts: {},
  },
  integrations: {
    google: { 
      connected: false,
      calendarSync: false,
      driveSync: false,
    },
    slack: { 
      connected: false,
      notifications: false,
    },
    github: { 
      connected: false,
    },
  },
  dashboardLayout: {
    widgets: [],
    columns: 3,
  },
  workingHours: {
    monday: { isWorkingDay: true, start: '09:00', end: '17:00' },
    tuesday: { isWorkingDay: true, start: '09:00', end: '17:00' },
    wednesday: { isWorkingDay: true, start: '09:00', end: '17:00' },
    thursday: { isWorkingDay: true, start: '09:00', end: '17:00' },
    friday: { isWorkingDay: true, start: '09:00', end: '17:00' },
    saturday: { isWorkingDay: false },
    sunday: { isWorkingDay: false },
    holidays: false,
  },
  autoReply: {
    enabled: false,
    message: '',
  },
  emailSignature: '',
};

// UserSettings service for handling all user settings directly with Firebase
export const userSettingsService = {
  // Get user settings
  async get(userId?: string): Promise<UserSettings> {
    try {
      const uid = userId || auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsDoc = await getDoc(doc(db, 'userSettings', uid));
      
      if (!settingsDoc.exists()) {
        // Return default settings if none exist
        return {
          ...defaultSettings,
          userId: uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Merge with defaults to ensure all fields exist
      const data = settingsDoc.data() as UserSettings;
      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('Failed to fetch user settings');
    }
  },

  // Create or update user settings
  async save(data: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      
      // Merge with existing data
      await setDoc(settingsRef, {
        ...data,
        userId: uid,
        updatedAt: new Date(),
      }, { merge: true });

      // Get updated settings
      const updatedDoc = await getDoc(settingsRef);
      const updatedData = updatedDoc.data() as UserSettings;
      return updatedData;
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw new Error('Failed to save user settings');
    }
  },

  // Update specific preference
  async updatePreferences(
    preferences: Partial<UserSettings['preferences']>
  ): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      const currentDoc = await getDoc(settingsRef);
      const currentData = currentDoc.exists() ? currentDoc.data() : {};

      await updateDoc(settingsRef, {
        preferences: {
          ...(currentData.preferences || defaultSettings.preferences),
          ...preferences,
        },
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(settingsRef);
      const updatedData = updatedDoc.data() as UserSettings;
      return updatedData;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  },

  // Update notification settings
  async updateNotifications(
    notifications: Partial<UserSettings['notifications']>
  ): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      
      // Check if document exists, if not create it
      const currentDoc = await getDoc(settingsRef);
      
      if (!currentDoc.exists()) {
        // Create new document with notifications
        await setDoc(settingsRef, {
          notifications,
          updatedAt: new Date(),
        });
      } else {
        // Update existing document
        const currentData = currentDoc.data();
        await updateDoc(settingsRef, {
          notifications: {
            ...(currentData.notifications || defaultSettings.notifications),
            ...notifications,
          },
          updatedAt: new Date(),
        });
      }

      const updatedDoc = await getDoc(settingsRef);
      const updatedData = updatedDoc.data() as UserSettings;
      return updatedData;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error('Failed to update notification settings');
    }
  },

  // Update privacy settings
  async updatePrivacy(privacy: Partial<UserSettings['privacy']>): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      const currentDoc = await getDoc(settingsRef);
      const currentData = currentDoc.exists() ? currentDoc.data() : {};

      await updateDoc(settingsRef, {
        privacy: {
          ...(currentData.privacy || defaultSettings.privacy),
          ...privacy,
        },
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(settingsRef);
      const updatedData = updatedDoc.data() as UserSettings;
      return updatedData;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw new Error('Failed to update privacy settings');
    }
  },

  // Update security settings
  async updateSecurity(security: Partial<UserSettings['security']>): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      const currentDoc = await getDoc(settingsRef);
      const currentData = currentDoc.exists() ? currentDoc.data() : {};

      await updateDoc(settingsRef, {
        security: {
          ...(currentData.security || defaultSettings.security),
          ...security,
        },
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(settingsRef);
      const updatedData = updatedDoc.data() as UserSettings;
      return updatedData;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw new Error('Failed to update security settings');
    }
  },

  // Update display settings
  async updateDisplay(display: Partial<UserSettings['display']>): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      const currentDoc = await getDoc(settingsRef);
      const currentData = currentDoc.exists() ? currentDoc.data() : {};

      await updateDoc(settingsRef, {
        display: {
          ...(currentData.display || defaultSettings.display),
          ...display,
        },
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(settingsRef);
      const updatedData = updatedDoc.data() as UserSettings;
      return updatedData;
    } catch (error) {
      console.error('Error updating display settings:', error);
      throw new Error('Failed to update display settings');
    }
  },

  // Reset settings to defaults
  async resetToDefaults(
    category?: 'preferences' | 'notifications' | 'privacy' | 'display' | 'all'
  ): Promise<UserSettings> {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error('No user authenticated');
      }

      const settingsRef = doc(db, 'userSettings', uid);
      
      if (category === 'all' || !category) {
        // Reset all settings
        await setDoc(settingsRef, {
          ...defaultSettings,
          userId: uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Reset specific category
        await updateDoc(settingsRef, {
          [category]: defaultSettings[category],
          updatedAt: new Date(),
        });
      }

      const updatedDoc = await getDoc(settingsRef);
      return updatedDoc.data() as UserSettings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('Failed to reset settings');
    }
  },
};

// Helper function to merge settings with defaults
function mergeWithDefaults(settings: Partial<UserSettings>, userId: string): UserSettings {
  return {
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...defaultSettings,
    ...settings,
    preferences: { ...defaultSettings.preferences, ...settings.preferences },
    notifications: {
      email: { ...defaultSettings.notifications.email, ...settings.notifications?.email },
      push: { ...defaultSettings.notifications.push, ...settings.notifications?.push },
      sms: { ...defaultSettings.notifications.sms, ...settings.notifications?.sms },
      inApp: { ...defaultSettings.notifications.inApp, ...settings.notifications?.inApp },
    },
    privacy: { ...defaultSettings.privacy, ...settings.privacy },
    security: { ...defaultSettings.security, ...settings.security },
    display: { ...defaultSettings.display, ...settings.display },
    shortcuts: { ...defaultSettings.shortcuts, ...settings.shortcuts },
    integrations: { ...defaultSettings.integrations, ...settings.integrations },
    workingHours: { ...defaultSettings.workingHours, ...settings.workingHours },
    autoReply: { ...defaultSettings.autoReply, ...settings.autoReply },
    dashboardLayout: settings.dashboardLayout || defaultSettings.dashboardLayout,
    emailSignature: settings.emailSignature || defaultSettings.emailSignature,
  } as UserSettings;
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
export function getDefaultSettings(): Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'> {
  return defaultSettings;
}