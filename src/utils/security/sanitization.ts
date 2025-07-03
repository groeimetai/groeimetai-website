import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string, options?: any): string {
  const defaultOptions: any = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    RETURN_TRUSTED_TYPE: false
  };
  
  return DOMPurify.sanitize(dirty, { ...defaultOptions, ...options }) as unknown as string;
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Escape HTML entities
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize SQL input to prevent SQL injection
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove dangerous SQL characters and keywords
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|EXEC|EXECUTE)\b/gi, ''); // Remove SQL keywords
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return '';
  }
  
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Ensure it doesn't start with a dot (hidden file)
  if (sanitized.startsWith('.')) {
    sanitized = '_' + sanitized.substring(1);
  }
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - extension.length) + extension;
  }
  
  return sanitized;
}

/**
 * Validate and sanitize email
 */
export const emailSchema = z.string().email().toLowerCase().trim();

export function sanitizeEmail(email: string): string | null {
  try {
    return emailSchema.parse(email);
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize URL
 */
export const urlSchema = z.string().url().trim();

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = urlSchema.parse(url);
    const urlObj = new URL(parsed);
    
    // Only allow HTTP(S) protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    // Prevent localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return null;
      }
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize phone number
 */
export const phoneSchema = z.string()
  .regex(/^[\d\s+()-]+$/)
  .min(10)
  .max(20)
  .transform(val => val.replace(/\D/g, ''));

export function sanitizePhone(phone: string): string | null {
  try {
    return phoneSchema.parse(phone);
  } catch {
    return null;
  }
}

/**
 * Create a sanitization schema for common user input
 */
export const userInputSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeInput),
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().max(1000).transform(sanitizeInput),
  company: z.string().max(100).transform(sanitizeInput).optional(),
  role: z.string().max(50).transform(sanitizeInput).optional()
});

/**
 * Sanitize JSON input
 */
export function sanitizeJson(json: any): any {
  if (json === null || json === undefined) {
    return json;
  }
  
  if (typeof json === 'string') {
    return sanitizeInput(json);
  }
  
  if (typeof json === 'number' || typeof json === 'boolean') {
    return json;
  }
  
  if (Array.isArray(json)) {
    return json.map(sanitizeJson);
  }
  
  if (typeof json === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(json)) {
      // Sanitize key
      const sanitizedKey = sanitizeInput(key);
      // Recursively sanitize value
      sanitized[sanitizedKey] = sanitizeJson(value);
    }
    return sanitized;
  }
  
  // For any other type, convert to string and sanitize
  return sanitizeInput(String(json));
}

/**
 * Create a safe error message (remove sensitive info)
 */
export function sanitizeErrorMessage(error: any): string {
  const message = error?.message || 'An error occurred';
  
  // Remove file paths
  let sanitized = message.replace(/\/[\w\/.-]+/g, '[path]');
  
  // Remove stack traces
  sanitized = sanitized.split('\n')[0];
  
  // Remove sensitive patterns
  sanitized = sanitized.replace(/\b\d{4,}\b/g, '[number]'); // Long numbers
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]'); // Emails
  sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'); // IP addresses
  
  return sanitized;
}