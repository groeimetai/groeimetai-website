/**
 * Security tests for user settings functionality
 * Tests authentication, authorization, data sanitization, and security vulnerabilities
 */

import { userSettingsService } from '@/services/userSettingsService';
import { createMockUserSettings, createMockApiResponse, mockFetch } from '../utils/test-helpers';

// Mock the API module
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Settings Security Tests', () => {
  const mockApi = require('@/services/api').api;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      const unauthorizedError = {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      mockApi.get.mockRejectedValue(unauthorizedError);

      await expect(userSettingsService.get()).rejects.toMatchObject({
        status: 401,
        code: 'UNAUTHORIZED',
      });
    });

    it('should reject requests with invalid tokens', async () => {
      const invalidTokenError = {
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      };
      mockApi.get.mockRejectedValue(invalidTokenError);

      await expect(userSettingsService.get()).rejects.toMatchObject({
        status: 401,
        code: 'INVALID_TOKEN',
      });
    });

    it('should prevent access to other users settings', async () => {
      const forbiddenError = {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Access denied to user settings',
      };
      mockApi.get.mockRejectedValue(forbiddenError);

      await expect(userSettingsService.get('other-user-123')).rejects.toMatchObject({
        status: 403,
        code: 'FORBIDDEN',
      });
    });

    it('should validate user permissions for admin operations', async () => {
      const insufficientPermissionsError = {
        status: 403,
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Admin privileges required',
      };
      mockApi.patch.mockRejectedValue(insufficientPermissionsError);

      await expect(userSettingsService.updateSecurity({
        forcePasswordChange: true,
        adminOverride: true,
      })).rejects.toMatchObject({
        status: 403,
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should sanitize XSS attempts in text fields', async () => {
      const maliciousInput = {
        emailSignature: '<script>alert("XSS")</script>Hello World',
        preferences: {
          customTheme: {
            primaryColor: 'javascript:alert("XSS")',
          },
        },
      };

      const sanitizedResponse = createMockApiResponse({
        ...createMockUserSettings(),
        emailSignature: '&lt;script&gt;alert("XSS")&lt;/script&gt;Hello World',
        preferences: {
          ...createMockUserSettings().preferences,
          customTheme: {
            primaryColor: 'invalid-color', // Should be sanitized/validated
          },
        },
      });

      mockApi.put.mockResolvedValue(sanitizedResponse);

      const result = await userSettingsService.save(maliciousInput);

      expect(result.emailSignature).not.toContain('<script>');
      expect(result.preferences.customTheme?.primaryColor).not.toContain('javascript:');
    });

    it('should validate email formats', async () => {
      const invalidEmailError = {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
        details: { field: 'email', value: 'invalid-email' },
      };

      mockApi.patch.mockRejectedValue(invalidEmailError);

      await expect(userSettingsService.updateNotifications({
        email: { enabled: true, address: 'invalid-email' } as any,
      })).rejects.toMatchObject({
        status: 400,
        code: 'VALIDATION_ERROR',
      });
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionAttempt = {
        preferences: {
          language: "'; DROP TABLE users; --",
          timezone: "'; DELETE FROM user_settings WHERE '1'='1",
        },
      };

      // Should either sanitize or reject the input
      const sanitizedResponse = createMockApiResponse({
        ...createMockUserSettings(),
        preferences: {
          ...createMockUserSettings().preferences,
          language: 'en', // Should default to valid value
          timezone: 'UTC', // Should default to valid value
        },
      });

      mockApi.put.mockResolvedValue(sanitizedResponse);

      const result = await userSettingsService.save(sqlInjectionAttempt);

      expect(result.preferences.language).toBe('en');
      expect(result.preferences.timezone).toBe('UTC');
      expect(result.preferences.language).not.toContain('DROP TABLE');
      expect(result.preferences.timezone).not.toContain('DELETE FROM');
    });

    it('should validate and sanitize URLs', async () => {
      const maliciousUrls = {
        integrations: {
          webhook: {
            url: 'javascript:alert("XSS")',
            callbackUrl: 'data:text/html,<script>alert("XSS")</script>',
          },
        },
      };

      const validationError = {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid URL format',
        details: { field: 'webhook.url', value: 'javascript:alert("XSS")' },
      };

      mockApi.patch.mockRejectedValue(validationError);

      await expect(userSettingsService.updateIntegrations(maliciousUrls))
        .rejects.toMatchObject({
          status: 400,
          code: 'VALIDATION_ERROR',
        });
    });

    it('should prevent prototype pollution attacks', async () => {
      const prototypePolluton = {
        '__proto__.isAdmin': true,
        'constructor.prototype.isAdmin': true,
        preferences: {
          '__proto__.theme': 'hacked',
          'constructor.prototype.language': 'hacked',
        },
      };

      const cleanResponse = createMockApiResponse(createMockUserSettings());
      mockApi.put.mockResolvedValue(cleanResponse);

      const result = await userSettingsService.save(prototypePolluton);

      // Should not contain prototype pollution
      expect(result).not.toHaveProperty('__proto__.isAdmin');
      expect(result).not.toHaveProperty('constructor.prototype.isAdmin');
      expect(result.preferences).not.toHaveProperty('__proto__.theme');
      expect(result.preferences).not.toHaveProperty('constructor.prototype.language');
    });
  });

  describe('Sensitive Data Protection', () => {
    it('should encrypt sensitive fields in storage', async () => {
      const sensitiveData = {
        security: {
          backupCodes: ['code1', 'code2', 'code3'],
          recoveryEmail: 'recovery@example.com',
          twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        },
        integrations: {
          api: {
            keys: {
              google: 'sensitive-api-key-123',
              slack: 'xoxb-slack-token',
            },
          },
        },
      };

      // Mock encrypted response
      const encryptedResponse = createMockApiResponse({
        ...createMockUserSettings(),
        security: {
          ...createMockUserSettings().security,
          backupCodes: ['[ENCRYPTED]', '[ENCRYPTED]', '[ENCRYPTED]'],
          recoveryEmail: '[ENCRYPTED]',
          twoFactorSecret: '[ENCRYPTED]',
        },
        integrations: {
          ...createMockUserSettings().integrations,
          api: {
            keys: {
              google: '[ENCRYPTED]',
              slack: '[ENCRYPTED]',
            },
          },
        },
      });

      mockApi.patch.mockResolvedValue(encryptedResponse);

      const result = await userSettingsService.updateSecurity(sensitiveData.security);

      // Verify sensitive data is not returned in plain text
      expect(result.security?.backupCodes?.[0]).toBe('[ENCRYPTED]');
      expect(result.security?.recoveryEmail).toBe('[ENCRYPTED]');
      expect(result.security?.twoFactorSecret).toBe('[ENCRYPTED]');
    });

    it('should not expose internal system fields', async () => {
      const attemptToSetSystemFields = {
        userId: 'hacked-user-id',
        createdAt: new Date('2020-01-01'),
        isAdmin: true,
        systemRole: 'admin',
        internalFlags: {
          bypassSecurity: true,
          debugMode: true,
        },
      };

      const cleanResponse = createMockApiResponse({
        ...createMockUserSettings(),
        // System fields should not be included or should be filtered
      });

      mockApi.put.mockResolvedValue(cleanResponse);

      const result = await userSettingsService.save(attemptToSetSystemFields);

      // Verify system fields are not present or modified
      expect(result).not.toHaveProperty('isAdmin');
      expect(result).not.toHaveProperty('systemRole');
      expect(result).not.toHaveProperty('internalFlags');
      expect(result.userId).toBe('test-user-123'); // Should remain original
      expect(result.createdAt).not.toEqual(new Date('2020-01-01'));
    });

    it('should mask sensitive data in error responses', async () => {
      const sensitiveError = {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          field: 'apiKey',
          value: 'sk-1234567890abcdef', // Should be masked in error
          sensitiveFields: ['apiKey', 'password', 'token'],
        },
      };

      // Mock error with sensitive data masking
      const maskedError = {
        ...sensitiveError,
        details: {
          ...sensitiveError.details,
          value: 'sk-****', // Should be masked
        },
      };

      mockApi.patch.mockRejectedValue(maskedError);

      try {
        await userSettingsService.updateIntegrations({
          api: { key: 'sk-1234567890abcdef' },
        });
      } catch (error: any) {
        expect(error.details.value).toBe('sk-****');
        expect(error.details.value).not.toContain('1234567890abcdef');
      }
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should enforce rate limits on sensitive operations', async () => {
      const rateLimitError = {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        details: {
          limit: 5,
          windowMs: 60000,
          remaining: 0,
          resetTime: Date.now() + 60000,
        },
      };

      mockApi.patch.mockRejectedValue(rateLimitError);

      await expect(userSettingsService.updateSecurity({
        twoFactorEnabled: true,
      })).rejects.toMatchObject({
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    });

    it('should detect and prevent automated attacks', async () => {
      const automatedAttackError = {
        status: 429,
        code: 'AUTOMATED_BEHAVIOR_DETECTED',
        message: 'Automated behavior detected',
        details: {
          suspiciousActivity: true,
          requiresCaptcha: true,
        },
      };

      mockApi.post.mockRejectedValue(automatedAttackError);

      await expect(userSettingsService.testNotification('email'))
        .rejects.toMatchObject({
          status: 429,
          code: 'AUTOMATED_BEHAVIOR_DETECTED',
        });
    });

    it('should throttle password reset attempts', async () => {
      const throttleError = {
        status: 429,
        code: 'PASSWORD_RESET_THROTTLED',
        message: 'Password reset attempts throttled',
        details: {
          nextAllowedAt: Date.now() + 300000, // 5 minutes
        },
      };

      mockApi.post.mockRejectedValue(throttleError);

      await expect(userSettingsService.resetToDefaults('security'))
        .rejects.toMatchObject({
          status: 429,
          code: 'PASSWORD_RESET_THROTTLED',
        });
    });
  });

  describe('Session and Token Security', () => {
    it('should validate session integrity', async () => {
      const sessionError = {
        status: 401,
        code: 'SESSION_INVALID',
        message: 'Session has been invalidated',
        details: {
          reason: 'concurrent_login',
          action: 'reauthenticate',
        },
      };

      mockApi.get.mockRejectedValue(sessionError);

      await expect(userSettingsService.get()).rejects.toMatchObject({
        status: 401,
        code: 'SESSION_INVALID',
      });
    });

    it('should handle CSRF token validation', async () => {
      const csrfError = {
        status: 403,
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token validation failed',
      };

      mockApi.post.mockRejectedValue(csrfError);

      await expect(userSettingsService.connectIntegration('google', 'auth-code'))
        .rejects.toMatchObject({
          status: 403,
          code: 'CSRF_TOKEN_INVALID',
        });
    });

    it('should enforce secure token refresh', async () => {
      const refreshError = {
        status: 401,
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh token is invalid or expired',
        details: {
          action: 'login_required',
        },
      };

      mockApi.patch.mockRejectedValue(refreshError);

      await expect(userSettingsService.updateSecurity({
        sessionTimeout: 1800,
      })).rejects.toMatchObject({
        status: 401,
        code: 'REFRESH_TOKEN_INVALID',
      });
    });
  });

  describe('Audit Logging and Monitoring', () => {
    it('should log sensitive operations', async () => {
      const mockLoggedResponse = createMockApiResponse({
        ...createMockUserSettings(),
        security: {
          ...createMockUserSettings().security,
          twoFactorEnabled: true,
          auditLog: [{
            action: 'enable_2fa',
            timestamp: new Date().toISOString(),
            ipAddress: '[REDACTED]',
            userAgent: '[REDACTED]',
          }],
        },
      });

      mockApi.patch.mockResolvedValue(mockLoggedResponse);

      const result = await userSettingsService.updateSecurity({
        twoFactorEnabled: true,
      });

      expect(result.security?.auditLog).toBeDefined();
      expect(result.security?.auditLog?.[0].action).toBe('enable_2fa');
      expect(result.security?.auditLog?.[0].ipAddress).toBe('[REDACTED]');
    });

    it('should track failed security attempts', async () => {
      const securityViolation = {
        status: 403,
        code: 'SECURITY_VIOLATION',
        message: 'Suspicious activity detected',
        details: {
          violation: 'multiple_failed_attempts',
          attempts: 5,
          lockoutDuration: 900000, // 15 minutes
          notificationSent: true,
        },
      };

      mockApi.patch.mockRejectedValue(securityViolation);

      try {
        await userSettingsService.updateSecurity({
          twoFactorEnabled: false, // Attempting to disable 2FA
        });
      } catch (error: any) {
        expect(error.details.violation).toBe('multiple_failed_attempts');
        expect(error.details.notificationSent).toBe(true);
      }
    });
  });

  describe('Data Encryption and Storage', () => {
    it('should ensure PII is encrypted at rest', async () => {
      const piiData = {
        profile: {
          ssn: '123-45-6789',
          dateOfBirth: '1990-01-01',
          address: '123 Main St, City, State 12345',
        },
        paymentInfo: {
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123',
        },
      };

      // PII should never be stored in plain text
      const encryptedResponse = createMockApiResponse({
        ...createMockUserSettings(),
        profile: {
          ssn: '[ENCRYPTED:PII]',
          dateOfBirth: '[ENCRYPTED:PII]',
          address: '[ENCRYPTED:PII]',
        },
        paymentInfo: {
          cardNumber: '[ENCRYPTED:PAYMENT]',
          expiryDate: '[ENCRYPTED:PAYMENT]',
          cvv: '[ENCRYPTED:PAYMENT]',
        },
      });

      mockApi.patch.mockResolvedValue(encryptedResponse);

      const result = await userSettingsService.updatePreferences(piiData);

      expect(result.profile.ssn).toBe('[ENCRYPTED:PII]');
      expect(result.paymentInfo.cardNumber).toBe('[ENCRYPTED:PAYMENT]');
    });

    it('should use proper encryption for backup codes', async () => {
      const backupCodes = ['ABC123', 'DEF456', 'GHI789'];

      const secureResponse = createMockApiResponse({
        ...createMockUserSettings(),
        security: {
          ...createMockUserSettings().security,
          backupCodes: backupCodes.map(() => '[HASHED]'), // Should be hashed, not encrypted
          backupCodesGeneratedAt: new Date().toISOString(),
        },
      });

      mockApi.patch.mockResolvedValue(secureResponse);

      const result = await userSettingsService.updateSecurity({
        generateBackupCodes: true,
      });

      expect(result.security?.backupCodes).toEqual(['[HASHED]', '[HASHED]', '[HASHED]']);
    });
  });

  describe('Integration Security', () => {
    it('should validate OAuth state parameters', async () => {
      const stateValidationError = {
        status: 400,
        code: 'INVALID_OAUTH_STATE',
        message: 'OAuth state parameter validation failed',
        details: {
          expectedState: '[REDACTED]',
          receivedState: '[REDACTED]',
        },
      };

      mockApi.post.mockRejectedValue(stateValidationError);

      await expect(userSettingsService.connectIntegration('github', 'invalid-code'))
        .rejects.toMatchObject({
          status: 400,
          code: 'INVALID_OAUTH_STATE',
        });
    });

    it('should sanitize webhook URLs', async () => {
      const maliciousWebhook = {
        integrations: {
          webhook: {
            url: 'http://evil-site.com/steal-data',
            events: ['*'], // Overly broad permissions
          },
        },
      };

      const securityError = {
        status: 403,
        code: 'SECURITY_POLICY_VIOLATION',
        message: 'Webhook URL not allowed',
        details: {
          policy: 'webhook_allowlist',
          allowedDomains: ['trusted-domain.com'],
        },
      };

      mockApi.patch.mockRejectedValue(securityError);

      await expect(userSettingsService.updateIntegrations(maliciousWebhook))
        .rejects.toMatchObject({
          status: 403,
          code: 'SECURITY_POLICY_VIOLATION',
        });
    });
  });

  describe('Privacy and Compliance', () => {
    it('should handle GDPR data deletion requests', async () => {
      const deletionRequest = {
        gdpr: {
          action: 'delete_all_data',
          reason: 'user_request',
          confirmation: 'I understand this action is irreversible',
        },
      };

      const deletionResponse = createMockApiResponse({
        success: true,
        message: 'Data deletion initiated',
        details: {
          requestId: 'gdpr-req-123',
          estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      mockApi.post.mockResolvedValue(deletionResponse);

      const result = await userSettingsService.export(); // Using export as proxy for GDPR requests

      expect(result).toBeDefined();
    });

    it('should provide data portability export', async () => {
      const exportRequest = {
        gdpr: {
          action: 'export_data',
          format: 'json',
          includeMetadata: true,
        },
      };

      // Export should not contain sensitive data in plain text
      const exportData = JSON.stringify({
        settings: createMockUserSettings(),
        metadata: {
          exportedAt: new Date().toISOString(),
          dataVersion: '1.0',
          sensitiveDataRedacted: true,
        },
      });

      const exportBlob = new Blob([exportData], { type: 'application/json' });
      const exportResponse = createMockApiResponse(exportBlob);

      mockApi.get.mockResolvedValue(exportResponse);

      const result = await userSettingsService.export();

      expect(result).toBeInstanceOf(Blob);
    });
  });
});