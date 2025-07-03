import Joi from 'joi';
import { customValidators } from '../middleware/validation.middleware.js';

/**
 * User validation schemas
 */
export const userValidation = {
  /**
   * User registration validation
   */
  register: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      
      displayName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
          'string.min': 'Display name must be at least 2 characters long',
          'string.max': 'Display name cannot exceed 50 characters',
          'any.required': 'Display name is required'
        }),
      
      phoneNumber: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      
      role: Joi.string()
        .valid('client', 'consultant')
        .default('client')
        .messages({
          'any.only': 'Role must be either client or consultant'
        })
    })
  },

  /**
   * Update profile validation
   */
  updateProfile: {
    body: Joi.object({
      displayName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .optional(),
      
      photoURL: Joi.string()
        .uri()
        .optional()
        .messages({
          'string.uri': 'Please provide a valid URL for the photo'
        }),
      
      phoneNumber: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .allow(null),
      
      profile: Joi.object({
        bio: Joi.string()
          .max(500)
          .trim()
          .optional(),
        
        skills: Joi.array()
          .items(Joi.string().trim())
          .max(20)
          .optional(),
        
        experience: Joi.string()
          .max(1000)
          .trim()
          .optional(),
        
        linkedIn: Joi.string()
          .uri()
          .optional()
          .allow(''),
        
        website: Joi.string()
          .uri()
          .optional()
          .allow('')
      }).optional(),
      
      preferences: Joi.object({
        notifications: Joi.object({
          email: Joi.boolean().optional(),
          push: Joi.boolean().optional(),
          sms: Joi.boolean().optional()
        }).optional(),
        
        language: Joi.string()
          .valid('en', 'es', 'fr', 'de', 'pt', 'nl')
          .optional(),
        
        timezone: Joi.string()
          .optional()
      }).optional(),
      
      status: Joi.string()
        .valid('active', 'inactive', 'suspended')
        .optional()
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  /**
   * Get user by ID validation
   */
  getUserById: {
    params: Joi.object({
      userId: Joi.string()
        .pattern(/^[a-zA-Z0-9]{28}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid user ID format',
          'any.required': 'User ID is required'
        })
    })
  },

  /**
   * List users validation
   */
  listUsers: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
      
      role: Joi.string()
        .valid('client', 'consultant', 'admin')
        .optional(),
      
      status: Joi.string()
        .valid('active', 'inactive', 'suspended', 'deleted')
        .optional(),
      
      search: Joi.string()
        .trim()
        .optional(),
      
      orderBy: Joi.string()
        .valid('metadata.createdAt', 'displayName', 'email', 'role')
        .default('metadata.createdAt'),
      
      orderDirection: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
    })
  },

  /**
   * Update user role validation
   */
  updateRole: {
    params: Joi.object({
      userId: Joi.string()
        .pattern(/^[a-zA-Z0-9]{28}$/)
        .required()
    }),
    
    body: Joi.object({
      role: Joi.string()
        .valid('client', 'consultant', 'admin')
        .optional(),
      
      addRoles: Joi.array()
        .items(Joi.string().valid('client', 'consultant', 'admin', 'moderator'))
        .optional(),
      
      removeRoles: Joi.array()
        .items(Joi.string().valid('client', 'consultant', 'admin', 'moderator'))
        .optional()
    }).or('role', 'addRoles', 'removeRoles')
    .messages({
      'object.missing': 'Must provide either role, addRoles, or removeRoles'
    })
  }
};