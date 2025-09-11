import Joi from 'joi';

/**
 * Settings validation schemas
 */
export const settingsValidation = {
  /**
   * Update profile validation
   */
  updateProfile: {
    body: Joi.object({
      displayName: Joi.string().min(1).max(100).trim(),
      phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow(null, ''),
      photoURL: Joi.string().uri().allow(null, ''),
      bio: Joi.string().max(500).allow(''),
      website: Joi.string().uri().allow(''),
      location: Joi.string().max(100).allow(''),
      skills: Joi.array().items(Joi.string().max(50)).max(20),
      experience: Joi.string().max(1000).allow(''),
      linkedIn: Joi.string().uri().allow(''),
    }).min(1),
  },

  /**
   * Update preferences validation
   */
  updatePreferences: {
    body: Joi.object({
      language: Joi.string().valid('en', 'nl', 'de', 'fr', 'es'),
      timezone: Joi.string().max(50),
      theme: Joi.string().valid('light', 'dark', 'auto'),
      dateFormat: Joi.string().valid('MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'),
      timeFormat: Joi.string().valid('12h', '24h'),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD'),
      accessibility: Joi.object({
        reducedMotion: Joi.boolean(),
        highContrast: Joi.boolean(),
        screenReader: Joi.boolean(),
      }),
    }).min(1),
  },

  /**
   * Update notifications validation
   */
  updateNotifications: {
    body: Joi.object({
      email: Joi.object({
        marketing: Joi.boolean(),
        updates: Joi.boolean(),
        security: Joi.boolean(),
        mentions: Joi.boolean(),
        comments: Joi.boolean(),
      }),
      push: Joi.object({
        enabled: Joi.boolean(),
        marketing: Joi.boolean(),
        updates: Joi.boolean(),
        security: Joi.boolean(),
        mentions: Joi.boolean(),
        comments: Joi.boolean(),
      }),
      inApp: Joi.object({
        mentions: Joi.boolean(),
        comments: Joi.boolean(),
        updates: Joi.boolean(),
        achievements: Joi.boolean(),
      }),
    }).min(1),
  },

  /**
   * Update security settings validation
   */
  updateSecurity: {
    body: Joi.object({
      loginNotifications: Joi.boolean(),
      suspiciousActivityAlerts: Joi.boolean(),
      sessionTimeout: Joi.number().integer().min(15).max(10080), // 15 minutes to 7 days
    }).min(1),
  },

  /**
   * Revoke session validation
   */
  revokeSession: {
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
  },

  /**
   * Enable 2FA validation
   */
  enable2FA: {
    body: Joi.object({
      code: Joi.string().length(6).pattern(/^\d{6}$/).required(),
    }),
  },

  /**
   * Disable 2FA validation
   */
  disable2FA: {
    body: Joi.object({
      code: Joi.string().required(), // Can be 6-digit TOTP or 8-char backup code
    }),
  },

  /**
   * Update privacy settings validation
   */
  updatePrivacy: {
    body: Joi.object({
      profileVisibility: Joi.string().valid('public', 'private', 'connections'),
      showEmail: Joi.boolean(),
      showPhone: Joi.boolean(),
      allowSearchEngines: Joi.boolean(),
      dataProcessing: Joi.boolean(),
      analytics: Joi.boolean(),
      personalization: Joi.boolean(),
    }).min(1),
  },

  /**
   * Create API key validation
   */
  createAPIKey: {
    body: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      permissions: Joi.array()
        .items(Joi.string().valid('read', 'write', 'admin'))
        .min(1)
        .max(10)
        .required(),
      expiresAt: Joi.date().iso().greater('now').optional(),
    }),
  },

  /**
   * Delete API key validation
   */
  deleteAPIKey: {
    params: Joi.object({
      keyId: Joi.string().required(),
    }),
  },

  /**
   * Connect integration validation
   */
  connectIntegration: {
    params: Joi.object({
      provider: Joi.string()
        .valid('google', 'microsoft', 'slack', 'github', 'linkedin')
        .required(),
    }),
    body: Joi.object({
      credentials: Joi.object().required(),
      permissions: Joi.array().items(Joi.string()).optional(),
    }),
  },

  /**
   * Disconnect integration validation
   */
  disconnectIntegration: {
    params: Joi.object({
      integrationId: Joi.string().required(),
    }),
  },

  /**
   * Update advanced settings validation
   */
  updateAdvanced: {
    body: Joi.object({
      developerMode: Joi.boolean(),
      experimentalFeatures: Joi.array().items(Joi.string()).max(10),
      betaProgram: Joi.boolean(),
    }).min(1),
  },

  /**
   * Schedule account deletion validation
   */
  scheduleAccountDeletion: {
    body: Joi.object({
      password: Joi.string().required(),
      reason: Joi.string().max(500).optional(),
    }),
  },

  /**
   * Batch update validation
   */
  batchUpdate: {
    body: Joi.object({
      updates: Joi.object({
        profile: Joi.object({
          displayName: Joi.string().min(1).max(100).trim(),
          phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow(null, ''),
          photoURL: Joi.string().uri().allow(null, ''),
          bio: Joi.string().max(500).allow(''),
          website: Joi.string().uri().allow(''),
          location: Joi.string().max(100).allow(''),
          skills: Joi.array().items(Joi.string().max(50)).max(20),
          experience: Joi.string().max(1000).allow(''),
          linkedIn: Joi.string().uri().allow(''),
        }),
        preferences: Joi.object({
          language: Joi.string().valid('en', 'nl', 'de', 'fr', 'es'),
          timezone: Joi.string().max(50),
          theme: Joi.string().valid('light', 'dark', 'auto'),
          dateFormat: Joi.string().valid('MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'),
          timeFormat: Joi.string().valid('12h', '24h'),
          currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD'),
          accessibility: Joi.object({
            reducedMotion: Joi.boolean(),
            highContrast: Joi.boolean(),
            screenReader: Joi.boolean(),
          }),
        }),
        notifications: Joi.object({
          email: Joi.object({
            marketing: Joi.boolean(),
            updates: Joi.boolean(),
            security: Joi.boolean(),
            mentions: Joi.boolean(),
            comments: Joi.boolean(),
          }),
          push: Joi.object({
            enabled: Joi.boolean(),
            marketing: Joi.boolean(),
            updates: Joi.boolean(),
            security: Joi.boolean(),
            mentions: Joi.boolean(),
            comments: Joi.boolean(),
          }),
          inApp: Joi.object({
            mentions: Joi.boolean(),
            comments: Joi.boolean(),
            updates: Joi.boolean(),
            achievements: Joi.boolean(),
          }),
        }),
        privacy: Joi.object({
          profileVisibility: Joi.string().valid('public', 'private', 'connections'),
          showEmail: Joi.boolean(),
          showPhone: Joi.boolean(),
          allowSearchEngines: Joi.boolean(),
          dataProcessing: Joi.boolean(),
          analytics: Joi.boolean(),
          personalization: Joi.boolean(),
        }),
        advanced: Joi.object({
          developerMode: Joi.boolean(),
          experimentalFeatures: Joi.array().items(Joi.string()).max(10),
          betaProgram: Joi.boolean(),
        }),
      }).min(1).required(),
    }),
  },

  /**
   * Common validation patterns
   */
  commonPatterns: {
    email: Joi.string().email().lowercase(),
    password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    url: Joi.string().uri({ scheme: ['http', 'https'] }),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/),
    alphanumeric: Joi.string().alphanum(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    locale: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/),
    timezone: Joi.string().max(50),
    currency: Joi.string().length(3).uppercase(),
  },

  /**
   * Custom validation functions
   */
  custom: {
    /**
     * Validate timezone
     */
    timezone: (value, helpers) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return value;
      } catch (error) {
        return helpers.error('any.invalid', { message: 'Invalid timezone' });
      }
    },

    /**
     * Validate locale
     */
    locale: (value, helpers) => {
      const validLocales = ['en', 'nl', 'de', 'fr', 'es'];
      if (!validLocales.includes(value)) {
        return helpers.error('any.invalid', { message: 'Invalid locale' });
      }
      return value;
    },

    /**
     * Validate currency code
     */
    currency: (value, helpers) => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];
      if (!validCurrencies.includes(value)) {
        return helpers.error('any.invalid', { message: 'Invalid currency code' });
      }
      return value;
    },

    /**
     * Validate profile visibility
     */
    profileVisibility: (value, helpers) => {
      const validValues = ['public', 'private', 'connections'];
      if (!validValues.includes(value)) {
        return helpers.error('any.invalid', { message: 'Invalid profile visibility' });
      }
      return value;
    },

    /**
     * Validate API key permissions
     */
    apiKeyPermissions: (value, helpers) => {
      const validPermissions = ['read', 'write', 'admin'];
      if (!Array.isArray(value)) {
        return helpers.error('array.base');
      }
      
      for (const permission of value) {
        if (!validPermissions.includes(permission)) {
          return helpers.error('any.invalid', { message: `Invalid permission: ${permission}` });
        }
      }
      
      return value;
    },

    /**
     * Validate integration provider
     */
    integrationProvider: (value, helpers) => {
      const validProviders = ['google', 'microsoft', 'slack', 'github', 'linkedin', 'facebook', 'twitter'];
      if (!validProviders.includes(value)) {
        return helpers.error('any.invalid', { message: 'Invalid integration provider' });
      }
      return value;
    },

    /**
     * Validate skills array
     */
    skills: (value, helpers) => {
      if (!Array.isArray(value)) {
        return helpers.error('array.base');
      }
      
      if (value.length > 20) {
        return helpers.error('array.max', { limit: 20 });
      }
      
      for (const skill of value) {
        if (typeof skill !== 'string' || skill.trim().length === 0 || skill.length > 50) {
          return helpers.error('any.invalid', { message: 'Each skill must be a non-empty string with max 50 characters' });
        }
      }
      
      return value.map(skill => skill.trim());
    },

    /**
     * Validate experimental features
     */
    experimentalFeatures: (value, helpers) => {
      if (!Array.isArray(value)) {
        return helpers.error('array.base');
      }
      
      const validFeatures = [
        'ai_assistant',
        'dark_mode_beta',
        'advanced_analytics',
        'real_time_collaboration',
        'voice_commands',
        'gesture_navigation',
        'ar_features',
        'predictive_search',
      ];
      
      for (const feature of value) {
        if (!validFeatures.includes(feature)) {
          return helpers.error('any.invalid', { message: `Invalid experimental feature: ${feature}` });
        }
      }
      
      return value;
    },
  },

  /**
   * Sanitization functions
   */
  sanitizers: {
    /**
     * Sanitize HTML input
     */
    html: (value) => {
      if (typeof value !== 'string') return value;
      
      // Basic HTML sanitization - in production use a proper library like DOMPurify
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    },

    /**
     * Sanitize URL
     */
    url: (value) => {
      if (typeof value !== 'string') return value;
      
      try {
        const url = new URL(value);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          return null;
        }
        return url.href;
      } catch {
        return null;
      }
    },

    /**
     * Sanitize phone number
     */
    phone: (value) => {
      if (typeof value !== 'string') return value;
      
      // Remove all non-numeric characters except +
      return value.replace(/[^\d+\s\-\(\)]/g, '').trim();
    },

    /**
     * Sanitize bio text
     */
    bio: (value) => {
      if (typeof value !== 'string') return value;
      
      return value
        .trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .substring(0, 500); // Ensure max length
    },
  },
};