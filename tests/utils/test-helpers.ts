/**
 * Test helper utilities and mock factories
 */

import { User, UserSettings, UserDetailedPreferences, NotificationSettings } from '@/types';

// Mock user factory
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  phoneNumber: '+1234567890',
  firstName: 'Test',
  lastName: 'User',
  bio: 'Test user biography',
  title: 'Software Engineer',
  jobTitle: 'Senior Developer',
  company: 'Test Company',
  linkedinUrl: 'https://linkedin.com/in/testuser',
  website: 'https://testuser.com',
  accountType: 'customer',
  role: 'client',
  permissions: ['read', 'write'],
  isActive: true,
  isVerified: true,
  organizationId: 'org-123',
  organizationRole: 'member',
  preferences: {
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
    },
    theme: 'light',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLoginAt: new Date('2024-01-01'),
  lastActivityAt: new Date('2024-01-01'),
  subscriptionId: 'sub-123',
  subscriptionStatus: 'active',
  subscriptionPlan: 'professional',
  stats: {
    projectsCount: 5,
    consultationsCount: 10,
    messagesCount: 25,
    totalSpent: 1000,
  },
  isDeleted: false,
  ...overrides,
});

// Mock user settings factory
export const createMockUserSettings = (overrides: Partial<UserSettings> = {}): UserSettings => ({
  userId: 'test-user-123',
  preferences: {
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    startOfWeek: 'sunday',
    defaultView: 'dashboard',
    theme: 'light',
    customTheme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
  },
  notifications: {
    email: {
      enabled: true,
      frequency: 'daily',
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
    colorBlindMode: 'none',
    sidebarCollapsed: false,
    showAvatars: true,
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
  shortcuts: {
    enabled: true,
    customShortcuts: {
      'open-search': 'cmd+k',
      'new-project': 'cmd+n',
      'toggle-sidebar': 'cmd+b',
    },
  },
  security: {
    twoFactorEnabled: false,
    twoFactorMethods: [],
    sessionTimeout: 3600,
    trustedDevices: [],
  },
  dashboardLayout: {
    widgets: [
      {
        id: 'projects-widget',
        type: 'projects',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 },
        settings: { showCompleted: false },
      },
      {
        id: 'messages-widget',
        type: 'messages',
        position: { x: 6, y: 0 },
        size: { width: 6, height: 4 },
        settings: { maxMessages: 10 },
      },
    ],
    columns: 12,
  },
  emailSignature: 'Best regards,\nTest User\nTest Company',
  autoReply: {
    enabled: false,
    message: 'Thank you for your message. I will get back to you soon.',
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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// API response mock factory
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  error: success ? undefined : { code: 'TEST_ERROR', message: 'Test error' },
  metadata: {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    requestId: 'test-request-123',
  },
});

// Error mock factory
export const createMockError = (message = 'Test error', status = 500) => {
  const error = new Error(message) as any;
  error.status = status;
  error.code = 'TEST_ERROR';
  return error;
};

// Fetch mock helper
export const mockFetch = (response: any, options: { success?: boolean; status?: number } = {}) => {
  const { success = true, status = success ? 200 : 500 } = options;
  
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: success,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

// Local storage mock
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    key: jest.fn((index: number) => Object.keys(storage)[index] || null),
    get length() {
      return Object.keys(storage).length;
    },
  };
};

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Custom render with providers
export const renderWithProviders = (ui: React.ReactElement, options: any = {}) => {
  // This would include theme providers, query client, etc.
  return ui;
};

// Test data generators
export const generateTestData = {
  email: () => `test-${Math.random().toString(36).substring(7)}@example.com`,
  userId: () => `user-${Math.random().toString(36).substring(2, 15)}`,
  timestamp: () => new Date().toISOString(),
  randomString: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  randomNumber: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
};