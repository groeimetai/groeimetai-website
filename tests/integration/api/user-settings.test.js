/**
 * Integration tests for user settings API endpoints
 * Tests the complete request/response cycle with real Firebase backend
 */

const request = require('supertest');
const admin = require('firebase-admin');
const { app } = require('../../../backend/server');

describe('User Settings API Integration Tests', () => {
  let testApp;
  let mockUser;
  let authToken;
  let testUserId;

  // Test data
  const testUserSettings = {
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      startOfWeek: 'sunday',
      defaultView: 'dashboard',
      theme: 'light',
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
  };

  beforeAll(async () => {
    // Initialize test app
    testApp = app;
    
    // Create test user
    testUserId = `test-user-${Date.now()}`;
    mockUser = {
      uid: testUserId,
      email: 'test@example.com',
      displayName: 'Test User',
      customClaims: { roles: ['client'] },
    };

    // Mock Firebase Auth for tests
    jest.spyOn(admin, 'auth').mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue(mockUser),
      getUser: jest.fn().mockResolvedValue(mockUser),
      createUser: jest.fn().mockResolvedValue(mockUser),
      updateUser: jest.fn().mockResolvedValue(mockUser),
      setCustomUserClaims: jest.fn().mockResolvedValue({}),
    });

    // Create a mock Firebase ID token
    authToken = 'mock-firebase-token';
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      try {
        await admin.firestore().collection('users').doc(testUserId).delete();
        await admin.firestore().collection('user_settings').doc(testUserId).delete();
      } catch (error) {
        console.warn('Cleanup failed:', error.message);
      }
    }
  });

  describe('GET /api/user-settings/me', () => {
    it('should get current user settings', async () => {
      // First create settings
      await admin.firestore()
        .collection('user_settings')
        .doc(testUserId)
        .set({
          userId: testUserId,
          ...testUserSettings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      const response = await request(testApp)
        .get('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId', testUserId);
      expect(response.body.data).toHaveProperty('preferences');
      expect(response.body.data).toHaveProperty('notifications');
      expect(response.body.data).toHaveProperty('privacy');
      expect(response.body.data).toHaveProperty('display');
      expect(response.body.data.preferences.language).toBe('en');
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(testApp)
        .get('/api/user-settings/me')
        .expect(401);
    });

    it('should return default settings for new user', async () => {
      // Delete existing settings
      await admin.firestore()
        .collection('user_settings')
        .doc(testUserId)
        .delete();

      const response = await request(testApp)
        .get('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('preferences');
      expect(response.body.data.preferences.language).toBe('en');
      expect(response.body.data.preferences.theme).toBe('system');
    });
  });

  describe('PUT /api/user-settings/me', () => {
    it('should create/update user settings', async () => {
      const settingsUpdate = {
        preferences: {
          language: 'es',
          timezone: 'Europe/Madrid',
          theme: 'dark',
        },
        notifications: {
          email: {
            enabled: false,
            frequency: 'weekly',
          },
        },
      };

      const response = await request(testApp)
        .put('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(settingsUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.language).toBe('es');
      expect(response.body.data.preferences.timezone).toBe('Europe/Madrid');
      expect(response.body.data.preferences.theme).toBe('dark');
      expect(response.body.data.notifications.email.enabled).toBe(false);

      // Verify data was saved to Firestore
      const savedDoc = await admin.firestore()
        .collection('user_settings')
        .doc(testUserId)
        .get();

      expect(savedDoc.exists).toBe(true);
      expect(savedDoc.data().preferences.language).toBe('es');
    });

    it('should validate required fields', async () => {
      const invalidUpdate = {
        preferences: {
          language: 'invalid-lang-code-that-is-too-long',
          timeFormat: 'invalid-format',
        },
      };

      await request(testApp)
        .put('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400);
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdate = {
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
        },
      };

      const response = await request(testApp)
        .put('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.privacy.profileVisibility).toBe('private');
      expect(response.body.data.privacy.showEmail).toBe(false);
      // Should preserve existing values
      expect(response.body.data.preferences.language).toBeDefined();
    });
  });

  describe('PATCH /api/user-settings/me/preferences', () => {
    it('should update only preferences', async () => {
      const preferencesUpdate = {
        language: 'fr',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
      };

      const response = await request(testApp)
        .patch('/api/user-settings/me/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferencesUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.language).toBe('fr');
      expect(response.body.data.preferences.currency).toBe('EUR');
      expect(response.body.data.preferences.dateFormat).toBe('DD/MM/YYYY');
    });

    it('should preserve other settings sections', async () => {
      // Get current settings first
      const currentResponse = await request(testApp)
        .get('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const currentPrivacy = currentResponse.body.data.privacy;

      // Update preferences
      await request(testApp)
        .patch('/api/user-settings/me/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'de' })
        .expect(200);

      // Check privacy settings are unchanged
      const updatedResponse = await request(testApp)
        .get('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(updatedResponse.body.data.privacy).toEqual(currentPrivacy);
    });
  });

  describe('PATCH /api/user-settings/me/notifications', () => {
    it('should update notification settings', async () => {
      const notificationUpdate = {
        email: {
          enabled: true,
          frequency: 'instant',
          types: {
            messages: false,
            marketing: true,
          },
        },
        push: {
          enabled: false,
        },
      };

      const response = await request(testApp)
        .patch('/api/user-settings/me/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.email.enabled).toBe(true);
      expect(response.body.data.notifications.email.frequency).toBe('instant');
      expect(response.body.data.notifications.email.types.messages).toBe(false);
      expect(response.body.data.notifications.push.enabled).toBe(false);
    });

    it('should merge notification type settings', async () => {
      const notificationUpdate = {
        email: {
          types: {
            projectUpdates: false,
          },
        },
      };

      const response = await request(testApp)
        .patch('/api/user-settings/me/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.email.types.projectUpdates).toBe(false);
      // Should preserve other notification types
      expect(response.body.data.notifications.email.types).toHaveProperty('messages');
      expect(response.body.data.notifications.email.types).toHaveProperty('deadlines');
    });
  });

  describe('PATCH /api/user-settings/me/privacy', () => {
    it('should update privacy settings', async () => {
      const privacyUpdate = {
        profileVisibility: 'public',
        showPhone: true,
        activityStatus: false,
      };

      const response = await request(testApp)
        .patch('/api/user-settings/me/privacy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(privacyUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.privacy.profileVisibility).toBe('public');
      expect(response.body.data.privacy.showPhone).toBe(true);
      expect(response.body.data.privacy.activityStatus).toBe(false);
    });
  });

  describe('PATCH /api/user-settings/me/display', () => {
    it('should update display settings', async () => {
      const displayUpdate = {
        density: 'compact',
        fontSize: 'large',
        highContrast: true,
        reduceMotion: true,
      };

      const response = await request(testApp)
        .patch('/api/user-settings/me/display')
        .set('Authorization', `Bearer ${authToken}`)
        .send(displayUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.display.density).toBe('compact');
      expect(response.body.data.display.fontSize).toBe('large');
      expect(response.body.data.display.highContrast).toBe(true);
      expect(response.body.data.display.reduceMotion).toBe(true);
    });
  });

  describe('PATCH /api/user-settings/me/integrations', () => {
    it('should update integration settings', async () => {
      const integrationsUpdate = {
        google: {
          connected: true,
          calendarSync: true,
          driveSync: false,
          lastSync: new Date().toISOString(),
        },
      };

      const response = await request(testApp)
        .patch('/api/user-settings/me/integrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(integrationsUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrations.google.connected).toBe(true);
      expect(response.body.data.integrations.google.calendarSync).toBe(true);
      expect(response.body.data.integrations.google.driveSync).toBe(false);
    });
  });

  describe('POST /api/user-settings/me/integrations/:provider/connect', () => {
    it('should connect Google integration', async () => {
      const authCode = 'mock-google-auth-code';

      // Mock successful OAuth exchange
      jest.spyOn(require('googleapis'), 'google').mockReturnValue({
        auth: {
          OAuth2: jest.fn().mockReturnValue({
            getToken: jest.fn().mockResolvedValue({
              tokens: {
                access_token: 'access-token',
                refresh_token: 'refresh-token',
              },
            }),
          }),
        },
      });

      const response = await request(testApp)
        .post('/api/user-settings/me/integrations/google/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ authCode })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integration.provider).toBe('google');
      expect(response.body.data.integration.connected).toBe(true);
    });

    it('should handle invalid auth code', async () => {
      const invalidAuthCode = 'invalid-code';

      const response = await request(testApp)
        .post('/api/user-settings/me/integrations/google/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ authCode: invalidAuthCode })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/invalid.*auth.*code/i);
    });
  });

  describe('DELETE /api/user-settings/me/integrations/:provider', () => {
    it('should disconnect integration', async () => {
      // First connect an integration
      await admin.firestore()
        .collection('user_settings')
        .doc(testUserId)
        .update({
          'integrations.google.connected': true,
          'integrations.google.accessToken': 'token',
        });

      const response = await request(testApp)
        .delete('/api/user-settings/me/integrations/google')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify integration was disconnected
      const updatedDoc = await admin.firestore()
        .collection('user_settings')
        .doc(testUserId)
        .get();

      expect(updatedDoc.data().integrations.google.connected).toBe(false);
      expect(updatedDoc.data().integrations.google.accessToken).toBeUndefined();
    });
  });

  describe('POST /api/user-settings/me/reset', () => {
    it('should reset all settings to defaults', async () => {
      // First set custom settings
      await request(testApp)
        .put('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: { language: 'fr', theme: 'dark' },
          privacy: { profileVisibility: 'private' },
        });

      // Reset to defaults
      const response = await request(testApp)
        .post('/api/user-settings/me/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.language).toBe('en');
      expect(response.body.data.preferences.theme).toBe('system');
      expect(response.body.data.privacy.profileVisibility).toBe('team');
    });

    it('should reset specific category to defaults', async () => {
      // Set custom notification settings
      await request(testApp)
        .patch('/api/user-settings/me/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: { enabled: false, frequency: 'never' },
        });

      // Reset only notifications
      const response = await request(testApp)
        .post('/api/user-settings/me/reset/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.email.enabled).toBe(true);
      expect(response.body.data.notifications.email.frequency).toBe('instant');
      // Should preserve other settings
      expect(response.body.data.preferences.language).toBeDefined();
    });
  });

  describe('POST /api/user-settings/me/test-notification/:type', () => {
    it('should test email notification', async () => {
      const response = await request(testApp)
        .post('/api/user-settings/me/test-notification/email')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toMatch(/email.*sent/i);
    });

    it('should test push notification', async () => {
      const response = await request(testApp)
        .post('/api/user-settings/me/test-notification/push')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toMatch(/push.*sent/i);
    });

    it('should handle invalid notification type', async () => {
      await request(testApp)
        .post('/api/user-settings/me/test-notification/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid JSON payload', async () => {
      await request(testApp)
        .put('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle database errors gracefully', async () => {
      // Mock Firestore to throw an error
      jest.spyOn(admin.firestore(), 'collection').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(testApp)
        .get('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/internal.*error/i);
    });

    it('should handle rate limiting', async () => {
      // Make many rapid requests to trigger rate limiting
      const requests = Array(20).fill(null).map(() =>
        request(testApp)
          .get('/api/user-settings/me')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.some(result => 
        result.status === 'fulfilled' && result.value.status === 429
      );

      expect(rateLimited).toBe(true);
    });
  });

  describe('Performance tests', () => {
    it('should handle large settings objects efficiently', async () => {
      const largeSettings = {
        preferences: testUserSettings.preferences,
        notifications: testUserSettings.notifications,
        privacy: testUserSettings.privacy,
        display: testUserSettings.display,
        integrations: testUserSettings.integrations,
        shortcuts: {
          enabled: true,
          customShortcuts: {},
        },
        dashboardLayout: {
          widgets: Array(50).fill(null).map((_, i) => ({
            id: `widget-${i}`,
            type: 'chart',
            position: { x: i % 12, y: Math.floor(i / 12) },
            size: { width: 4, height: 3 },
            settings: { title: `Widget ${i}`, data: Array(100).fill(0) },
          })),
          columns: 12,
        },
      };

      const startTime = Date.now();
      
      const response = await request(testApp)
        .put('/api/user-settings/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeSettings)
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
      expect(response.body.data.dashboardLayout.widgets).toHaveLength(50);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array(10).fill(null).map((_, i) =>
        request(testApp)
          .patch('/api/user-settings/me/preferences')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ language: i % 2 === 0 ? 'en' : 'es' })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(10000); // All requests should complete within 10 seconds
    });
  });
});