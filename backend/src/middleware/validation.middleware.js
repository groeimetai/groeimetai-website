import { createError } from '../utils/errors.js';

/**
 * Generic validation middleware
 */
export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate different parts of the request
      const toValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const errors = {};

      // Run validation for each part
      for (const [key, data] of Object.entries(toValidate)) {
        if (schema[key]) {
          const { error, value } = schema[key].validate(data, {
            abortEarly: false,
            stripUnknown: true,
          });

          if (error) {
            errors[key] = error.details.map((detail) => ({
              field: detail.path.join('.'),
              message: detail.message,
            }));
          } else {
            // Replace with validated and sanitized data
            req[key] = value;
          }
        }
      }

      // If there are any errors, throw validation error
      if (Object.keys(errors).length > 0) {
        const validationError = createError.validation('Validation failed', errors);
        return next(validationError);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Custom validation rules
 */
export const customValidators = {
  /**
   * Validate Firebase UID format
   */
  isFirebaseUid: (value) => {
    const uidRegex = /^[a-zA-Z0-9]{28}$/;
    if (!uidRegex.test(value)) {
      throw new Error('Invalid Firebase UID format');
    }
    return value;
  },

  /**
   * Validate phone number format
   */
  isPhoneNumber: (value) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Invalid phone number format');
    }
    return value;
  },

  /**
   * Validate URL format
   */
  isValidUrl: (value) => {
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error('Invalid URL format');
    }
  },

  /**
   * Validate date is in future
   */
  isFutureDate: (value) => {
    const date = new Date(value);
    if (date <= new Date()) {
      throw new Error('Date must be in the future');
    }
    return value;
  },

  /**
   * Validate array of strings
   */
  isStringArray: (value) => {
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
      throw new Error('Must be an array of strings');
    }
    return value;
  },

  /**
   * Validate enum values
   */
  isEnum: (validValues) => (value) => {
    if (!validValues.includes(value)) {
      throw new Error(`Must be one of: ${validValues.join(', ')}`);
    }
    return value;
  },
};

/**
 * Sanitization helpers
 */
export const sanitizers = {
  /**
   * Trim and normalize whitespace
   */
  normalizeString: (value) => {
    return value?.trim().replace(/\s+/g, ' ');
  },

  /**
   * Remove HTML tags safely using iterative approach
   * Handles nested tags and encoded characters that could bypass single-pass regex
   */
  stripHtml: (value) => {
    if (!value) return value;

    let result = value;
    let previous;

    // Decode common HTML entities first
    result = result
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#x27;/gi, "'")
      .replace(/&#x2F;/gi, '/')
      .replace(/&amp;/gi, '&');

    // Iteratively remove tags until stable (handles nested/encoded tags)
    do {
      previous = result;
      // Remove HTML comments
      result = result.replace(/<!--[\s\S]*?-->/g, '');
      // Remove CDATA sections
      result = result.replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, '');
      // Remove HTML tags (including self-closing and with attributes)
      result = result.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, '');
    } while (result !== previous);

    return result;
  },

  /**
   * Normalize email
   */
  normalizeEmail: (value) => {
    return value?.toLowerCase().trim();
  },

  /**
   * Sanitize file name
   */
  sanitizeFileName: (value) => {
    return value?.replace(/[^a-zA-Z0-9.-]/g, '_');
  },
};
